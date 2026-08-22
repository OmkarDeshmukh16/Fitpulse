import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode, UserPlus, LogIn, LogOut, Camera, X, Check, Search,
  RefreshCw, Maximize2, Minimize2, Upload, AlertCircle, Sparkles,
  Shield, Clock, Phone, User, Monitor, Zap, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Html5Qrcode } from 'html5-qrcode'
import {
  useGetTodayAttendanceQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useCheckInQRMutation,
} from '../../services/api'
import { useGetMembersQuery } from '../../services/members.api'

// Audio feedback helper using Web Audio API
const playSound = (type = 'success') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const now = ctx.currentTime

    if (type === 'success') {
      // Pleasant double chime: 880Hz -> 1318.5Hz
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, now)
      osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.12)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.35)
    } else if (type === 'checkout') {
      // Warm checkout chord: 659.25Hz -> 523.25Hz
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(659.25, now)
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.15)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.35)
    } else {
      // Warning buzz
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.setValueAtTime(240, now + 0.1)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.25)
    }
  } catch {}
}

// ─────────────────────────────────────────────────────────────
// 1. QR SCANNER MODAL (Camera + File Upload + Mode Switcher)
// ─────────────────────────────────────────────────────────────
function QRScannerModal({ onClose, onScanSuccess }) {
  const [activeTab, setActiveTab] = useState('camera') // 'camera' | 'upload'
  const [scanMode, setScanMode] = useState('auto') // 'auto' | 'checkin' | 'checkout'
  const [continuous, setContinuous] = useState(true)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanCooldown, setScanCooldown] = useState(false)
  const [lastScanResult, setLastScanResult] = useState(null)
  const [cameraError, setCameraError] = useState('')

  const [checkInQR, { isLoading: isProcessing }] = useCheckInQRMutation()
  const scannerRef = useRef(null)
  const isCooldownRef = useRef(false)

  // Handle scanned raw string or JSON
  const handleProcessQR = async (qrText) => {
    if (isCooldownRef.current || isProcessing) return

    isCooldownRef.current = true
    setScanCooldown(true)

    try {
      const res = await checkInQR({ qrData: qrText, mode: scanMode }).unwrap()
      const actionType = res.action || 'checkin'
      playSound(actionType === 'checkout' ? 'checkout' : 'success')
      
      setLastScanResult({
        success: true,
        action: actionType,
        member: res.member,
        message: res.message,
        data: res.data,
        timestamp: new Date(),
      })

      toast.success(res.message || `${res.member?.fullName} attendance recorded!`, {
        icon: actionType === 'checkout' ? '👋' : '✅',
      })

      if (onScanSuccess) onScanSuccess(res)

      if (!continuous) {
        setTimeout(() => onClose(), 1500)
      }
    } catch (err) {
      playSound('error')
      const errMsg = err?.data?.message || 'Failed to process QR Code'
      
      setLastScanResult({
        success: false,
        message: errMsg,
        member: err?.data?.member || null,
        alreadyCheckedIn: err?.data?.alreadyCheckedIn,
        timestamp: new Date(),
      })

      toast.error(errMsg)
    } finally {
      setTimeout(() => {
        isCooldownRef.current = false
        setScanCooldown(false)
      }, 2500)
    }
  }

  // Initialize camera scanner
  useEffect(() => {
    let html5QrCode = null
    const readerElementId = 'qr-reader-viewport'

    const initScanner = async () => {
      try {
        setCameraError('')
        const devices = await Html5Qrcode.getCameras()
        if (!devices || devices.length === 0) {
          setCameraError('No camera found on this device. You can upload a QR image instead.')
          return
        }

        setCameras(devices)
        const preferredCam = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[0]
        const camId = selectedCamera || preferredCam.id
        setSelectedCamera(camId)

        html5QrCode = new Html5Qrcode(readerElementId)
        scannerRef.current = html5QrCode

        await html5QrCode.start(
          camId,
          {
            fps: 12,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleProcessQR(decodedText)
          },
          () => {} // ignore frame parse failures
        )
        setIsScanning(true)
      } catch (err) {
        console.error('Camera init error:', err)
        setCameraError(err?.message || 'Could not access camera. Please check camera permissions.')
        setIsScanning(false)
      }
    }

    if (activeTab === 'camera') {
      // Small timeout to allow DOM container to render
      const timer = setTimeout(() => {
        initScanner()
      }, 100)
      return () => {
        clearTimeout(timer)
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
              scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {})
            } else {
              scannerRef.current.clear()
            }
          } catch {}
          scannerRef.current = null
        }
      }
    } else {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {})
          }
        } catch {}
      }
    }
  }, [activeTab, selectedCamera])

  // Handle image file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const html5QrCode = new Html5Qrcode('qr-upload-hidden')
      const decodedText = await html5QrCode.scanFile(file, true)
      html5QrCode.clear()
      await handleProcessQR(decodedText)
    } catch (err) {
      playSound('error')
      toast.error('Could not find or read QR code from this image.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="modal slide-up"
        style={{
          maxWidth: 520,
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.5rem',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-bg-border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <QrCode size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                QR Attendance Scanner
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Scan member pass for instant check-in or checkout
              </p>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '0.4rem', borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher (Camera vs File Upload) */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
          padding: '0.25rem', background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-md)', marginBottom: '1rem',
        }}>
          <button
            type="button"
            className={`btn ${activeTab === 'camera' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.5rem', justifyContent: 'center' }}
            onClick={() => setActiveTab('camera')}
          >
            <Camera size={15} /> Live Camera
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.5rem', justifyContent: 'center' }}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={15} /> Upload QR Image
          </button>
        </div>

        {/* Mode Selector (Auto / CheckIn / CheckOut) */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.6rem 0.85rem', background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--color-bg-border)',
          marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Mode:
          </span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[
              { id: 'auto', label: '⚡ Smart Auto' },
              { id: 'checkin', label: '🟢 In Only' },
              { id: 'checkout', label: '🔴 Out Only' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                style={{
                  fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: 6,
                  background: scanMode === m.id ? 'var(--color-accent)' : 'transparent',
                  color: scanMode === m.id ? '#fff' : 'var(--color-text-secondary)',
                  border: scanMode === m.id ? '1px solid var(--color-accent-light)' : '1px solid transparent',
                  cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
                }}
                onClick={() => setScanMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* CAMERA VIEW */}
        {activeTab === 'camera' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cameraError ? (
              <div style={{
                padding: '2rem 1.5rem', textAlign: 'center',
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-md)',
              }}>
                <AlertCircle size={32} color="#ef4444" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Camera Access Error
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  {cameraError}
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => setActiveTab('upload')}
                >
                  <Upload size={14} /> Use Image Upload Instead
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#000' }}>
                {/* Viewport container for html5-qrcode */}
                <div id="qr-reader-viewport" style={{ width: '100%', minHeight: 280 }} />

                {/* Laser animation line & viewfinder overlay */}
                {isScanning && !scanCooldown && (
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 220, height: 220, border: '2px dashed rgba(16,185,129,0.7)',
                      borderRadius: 16, position: 'relative', overflow: 'hidden',
                      boxShadow: '0 0 25px rgba(16,185,129,0.25)',
                    }}>
                      <motion.div
                        animate={{ y: [0, 220, 0] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                        style={{
                          height: 2,
                          background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
                          boxShadow: '0 0 10px #10b981',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    zIndex: 10,
                  }}>
                    <div className="spin" style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#10b981', borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Verifying Pass...</span>
                  </div>
                )}

                {/* Cooldown indicator */}
                {scanCooldown && !isProcessing && (
                  <div style={{
                    position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(16, 185, 129, 0.9)', color: '#fff',
                    padding: '0.35rem 0.85rem', borderRadius: 99,
                    fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}>
                    <Check size={13} /> Scanned! Ready in a moment...
                  </div>
                )}
              </div>
            )}

            {/* Camera Controls */}
            {cameras.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <Camera size={14} color="var(--color-text-muted)" />
                <select
                  className="input"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                >
                  {cameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Camera ${cam.id.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* UPLOAD VIEW */}
        {activeTab === 'upload' && (
          <div>
            <div id="qr-upload-hidden" style={{ display: 'none' }} />
            <label
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '2.5rem 1.5rem', border: '2px dashed var(--color-bg-border)',
                borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-secondary)',
                cursor: 'pointer', transition: 'all 0.2s', gap: '0.75rem',
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (e.dataTransfer.files?.[0]) {
                  handleFileUpload({ target: { files: e.dataTransfer.files } })
                }
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Upload size={22} color="var(--color-accent-light)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                  Click to browse or drag & drop QR image
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  PNG, JPG, or screenshot of member pass
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        )}

        {/* LAST SCANNED MEMBER RESULT CARD */}
        <AnimatePresence>
          {lastScanResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: lastScanResult.success
                  ? lastScanResult.action === 'checkout'
                    ? 'rgba(245, 158, 11, 0.1)'
                    : 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${
                  lastScanResult.success
                    ? lastScanResult.action === 'checkout'
                      ? 'rgba(245, 158, 11, 0.3)'
                      : 'rgba(16, 185, 129, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)'
                }`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div className="avatar" style={{ width: 44, height: 44, fontSize: '1rem', flexShrink: 0 }}>
                  {lastScanResult.member?.photo ? (
                    <img src={lastScanResult.member.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  ) : (
                    lastScanResult.member?.fullName?.charAt(0) || '?'
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                      {lastScanResult.member?.fullName || 'Member'}
                    </span>
                    <span className={`badge ${lastScanResult.success ? (lastScanResult.action === 'checkout' ? 'badge-frozen' : 'badge-active') : 'badge-expired'}`} style={{ fontSize: '0.65rem' }}>
                      {lastScanResult.action === 'checkout' ? 'Checked Out' : lastScanResult.success ? 'Checked In' : 'Alert'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                    ID: {lastScanResult.member?.memberId || '—'} {lastScanResult.member?.phone ? `• ${lastScanResult.member.phone}` : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: lastScanResult.success ? (lastScanResult.action === 'checkout' ? '#f59e0b' : '#10b981') : '#ef4444', marginTop: '0.25rem' }}>
                    {lastScanResult.message}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-bg-border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={continuous}
              onChange={(e) => setContinuous(e.target.checked)}
              style={{ accentColor: '#10b981' }}
            />
            Continuous Scanner Mode
          </label>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Done / Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 2. KIOSK / DESK SELF-SCAN FULLSCREEN MODE
// ─────────────────────────────────────────────────────────────
function KioskScannerModal({ onClose, onScanSuccess }) {
  const [time, setTime] = useState(new Date())
  const [scannedMember, setScannedMember] = useState(null)
  const [checkInQR] = useCheckInQRMutation()
  const scannerRef = useRef(null)
  const isCooldownRef = useRef(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let html5QrCode = null
    const timer = setTimeout(async () => {
      try {
        html5QrCode = new Html5Qrcode('kiosk-reader-viewport')
        scannerRef.current = html5QrCode
        await html5QrCode.start(
          { facingMode: 'user' },
          { fps: 15, qrbox: { width: 300, height: 300 }, aspectRatio: 1.0 },
          async (decodedText) => {
            if (isCooldownRef.current) return
            isCooldownRef.current = true

            try {
              const res = await checkInQR({ qrData: decodedText, mode: 'auto' }).unwrap()
              playSound(res.action === 'checkout' ? 'checkout' : 'success')
              setScannedMember({
                member: res.member,
                action: res.action,
                message: res.message,
                time: new Date(),
              })
              if (onScanSuccess) onScanSuccess(res)
            } catch (err) {
              playSound('error')
              setScannedMember({
                error: true,
                message: err?.data?.message || 'Invalid Pass / Member not found',
                member: err?.data?.member || null,
                time: new Date(),
              })
            } finally {
              setTimeout(() => {
                setScannedMember(null)
                isCooldownRef.current = false
              }, 3500)
            }
          },
          () => {}
        )
      } catch (e) {
        console.error('Kiosk camera error:', e)
      }
    }, 150)

    return () => {
      clearTimeout(timer)
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {})
          } else {
            scannerRef.current.clear()
          }
        } catch {}
      }
    }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'radial-gradient(circle at center, #12122a 0%, #080812 100%)',
      display: 'flex', flexDirection: 'column', color: '#fff',
    }}>
      {/* Kiosk Top Bar */}
      <div style={{
        padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(14,14,28,0.7)', backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>FITPULSE KIOSK</div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.08em' }}>SELF-SERVICE ATTENDANCE</div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: '#fff' }}>
            {format(time, 'hh:mm:ss a')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            {format(time, 'EEEE, dd MMMM yyyy')}
          </div>
        </div>

        <button
          className="btn btn-ghost"
          onClick={onClose}
          style={{ padding: '0.6rem 1rem', color: 'var(--color-text-muted)' }}
        >
          <Minimize2 size={18} /> Exit Kiosk
        </button>
      </div>

      {/* Kiosk Body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
          <AnimatePresence mode="wait">
            {!scannedMember ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div style={{
                  position: 'relative', width: 340, height: 340, margin: '0 auto 1.5rem',
                  borderRadius: 24, overflow: 'hidden', border: '3px solid rgba(16,185,129,0.4)',
                  boxShadow: '0 0 50px rgba(16,185,129,0.2)', background: '#000',
                }}>
                  <div id="kiosk-reader-viewport" style={{ width: '100%', height: '100%' }} />
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 250, height: 250, border: '2px dashed rgba(16,185,129,0.8)',
                      borderRadius: 18,
                    }}>
                      <motion.div
                        animate={{ y: [0, 250, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        style={{ height: 2, background: '#10b981', boxShadow: '0 0 12px #10b981' }}
                      />
                    </div>
                  </div>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', color: '#fff' }}>
                  Scan Your Member QR Code
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  Hold your digital membership pass or card up to the camera
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  background: 'var(--color-bg-card)',
                  padding: '2.5rem', borderRadius: 28,
                  border: `2px solid ${scannedMember.error ? '#ef4444' : scannedMember.action === 'checkout' ? '#f59e0b' : '#10b981'}`,
                  boxShadow: `0 0 60px ${scannedMember.error ? 'rgba(239,68,68,0.3)' : scannedMember.action === 'checkout' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                }}
              >
                <div style={{
                  width: 90, height: 90, borderRadius: '50%', margin: '0 auto 1.25rem',
                  background: scannedMember.error ? 'rgba(239,68,68,0.2)' : scannedMember.action === 'checkout' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
                }}>
                  {scannedMember.member?.photo ? (
                    <img src={scannedMember.member.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : scannedMember.error ? (
                    <AlertCircle size={48} color="#ef4444" />
                  ) : scannedMember.action === 'checkout' ? (
                    <LogOut size={48} color="#f59e0b" />
                  ) : (
                    <Check size={48} color="#10b981" />
                  )}
                </div>

                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
                  {scannedMember.member?.fullName || (scannedMember.error ? 'Scan Failed' : 'Welcome!')}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                  {scannedMember.member?.memberId ? `Member ID: ${scannedMember.member.memberId}` : ''}
                </p>

                <div style={{
                  padding: '0.75rem 1.5rem', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: scannedMember.error ? 'rgba(239,68,68,0.15)' : scannedMember.action === 'checkout' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                  color: scannedMember.error ? '#ef4444' : scannedMember.action === 'checkout' ? '#f59e0b' : '#10b981',
                  fontWeight: 700, fontSize: '0.95rem',
                }}>
                  {scannedMember.message}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 3. FIXED MANUAL CHECK-IN MODAL (Universal ID / Phone / Autocomplete)
// ─────────────────────────────────────────────────────────────
function ManualCheckInModal({ onClose, onCheckInSuccess }) {
  const [query, setQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [checkIn, { isLoading }] = useCheckInMutation()
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation()

  // Live autocomplete member search
  const { data: searchResults, isFetching } = useGetMembersQuery(
    { search: query.trim(), limit: 6 },
    { skip: !query.trim() || query.trim().length < 1 }
  )

  const membersList = searchResults?.data || []

  const handleManualSubmit = async (e) => {
    if (e) e.preventDefault()
    const targetId = selectedMember ? (selectedMember.memberId || selectedMember._id) : query.trim()
    if (!targetId) {
      toast.error('Please enter a Member ID, Name, or Phone number')
      return
    }

    try {
      const res = await checkIn({ memberId: targetId, method: 'manual' }).unwrap()
      playSound('success')
      toast.success(res.message || `✅ ${res.member?.fullName || 'Member'} checked in!`)
      if (onCheckInSuccess) onCheckInSuccess(res)
      onClose()
    } catch (err) {
      playSound('error')
      toast.error(err?.data?.message || 'Check-in failed. Please verify member ID.')
    }
  }

  const handleManualCheckOut = async (memberObj) => {
    const targetId = memberObj?.memberId || memberObj?._id || query.trim()
    try {
      const res = await checkOut({ memberId: targetId }).unwrap()
      playSound('checkout')
      toast.success(res.message || `Checked out successfully!`)
      if (onCheckInSuccess) onCheckInSuccess(res)
      onClose()
    } catch (err) {
      playSound('error')
      toast.error(err?.data?.message || 'Check-out failed.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="modal slide-up"
        style={{
          maxWidth: 480,
          width: '95%',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-bg-border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(99,102,241,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UserPlus size={20} color="var(--color-accent)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Manual Check-In
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Search by Member ID (e.g. FP-...), Name, Phone, or Email
              </p>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '0.4rem', borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="label">Member ID / Name / Phone</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input"
                style={{ paddingLeft: '2.4rem' }}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedMember(null)
                }}
                placeholder="Type member name, FP-ID, or phone..."
                required
                id="manual-checkin-id"
                autoFocus
              />
              {isFetching && (
                <div className="spin" style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 14, height: 14, border: '2px solid var(--color-bg-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%',
                }} />
              )}
            </div>

            {/* LIVE AUTOCOMPLETE DROPDOWN */}
            {query.trim().length >= 1 && membersList.length > 0 && !selectedMember && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
                background: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-border)',
                borderRadius: 'var(--radius-md)', zIndex: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                maxHeight: 220, overflowY: 'auto',
              }}>
                {membersList.map((m) => (
                  <div
                    key={m._id}
                    style={{
                      padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderBottom: '1px solid var(--color-bg-border)', cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => {
                      setSelectedMember(m)
                      setQuery(`${m.fullName} (${m.memberId})`)
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                        {m.photo ? <img src={m.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : m.fullName?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{m.fullName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{m.memberId} • {m.phone}</div>
                      </div>
                    </div>
                    <span className={`badge badge-${m.membershipStatus === 'active' ? 'active' : 'inactive'}`} style={{ fontSize: '0.65rem' }}>
                      {m.membershipStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Member Preview Card */}
          {selectedMember && (
            <div style={{
              padding: '0.85rem', borderRadius: 'var(--radius-md)',
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="avatar" style={{ width: 38, height: 38, fontSize: '0.85rem' }}>
                  {selectedMember.photo ? <img src={selectedMember.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : selectedMember.fullName?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{selectedMember.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ID: {selectedMember.memberId} • Status: <span style={{ color: selectedMember.membershipStatus === 'active' ? '#10b981' : '#ef4444' }}>{selectedMember.membershipStatus}</span></div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => {
                  setSelectedMember(null)
                  setQuery('')
                }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {selectedMember && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ color: 'var(--color-warning)' }}
                disabled={isCheckingOut}
                onClick={() => handleManualCheckOut(selectedMember)}
              >
                <LogOut size={15} /> {isCheckingOut ? 'Checking out...' : 'Check Out'}
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !query.trim()}
              id="submit-manual-checkin"
            >
              <LogIn size={15} /> {isLoading ? 'Checking in...' : 'Check In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 4. MAIN ATTENDANCE PAGE
// ─────────────────────────────────────────────────────────────
export default function AttendancePage() {
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [showKiosk, setShowKiosk] = useState(false)
  const [filterType, setFilterType] = useState('all') // 'all' | 'in_gym' | 'checked_out' | 'qr' | 'manual'
  const [searchFilter, setSearchFilter] = useState('')

  const { data, isLoading, isFetching, refetch } = useGetTodayAttendanceQuery()
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation()

  const records = data?.data || []
  const todayCount = data?.count || 0

  const inGymCount = records.filter((r) => !r.checkOutTime).length
  const checkedOutCount = records.filter((r) => r.checkOutTime).length
  const qrCount = records.filter((r) => r.method === 'qr').length

  // Filtered records
  const filteredRecords = records.filter((r) => {
    // Tab filter
    if (filterType === 'in_gym' && r.checkOutTime) return false
    if (filterType === 'checked_out' && !r.checkOutTime) return false
    if (filterType === 'qr' && r.method !== 'qr') return false
    if (filterType === 'manual' && r.method !== 'manual') return false

    // Search query filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase()
      const name = r.memberId?.fullName?.toLowerCase() || ''
      const memberCode = r.memberId?.memberId?.toLowerCase() || ''
      const phone = r.memberId?.phone || ''
      return name.includes(q) || memberCode.includes(q) || phone.includes(q)
    }

    return true
  })

  const handleCheckOut = async (memberId) => {
    try {
      await checkOut({ memberId }).unwrap()
      playSound('checkout')
      toast.success('Member checked out successfully')
      refetch()
    } catch (err) {
      playSound('error')
      toast.error(err?.data?.message || 'Check-out failed')
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Attendance Hub
          </h1>
          <p className="page-subtitle">
            {todayCount} check-ins logged today — {format(new Date(), 'EEEE, dd MMMM yyyy')}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowQRScanner(true)}
            id="scan-qr-btn"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
            }}
          >
            <QrCode size={16} /> Scan Member QR
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowManual(true)}
            id="manual-checkin-btn"
          >
            <UserPlus size={16} /> Manual Check-In
          </button>

          <button
            className="btn btn-ghost"
            onClick={() => setShowKiosk(true)}
            title="Open Fullscreen Front Desk Kiosk Scanner"
            style={{ border: '1px solid var(--color-bg-border)' }}
          >
            <Monitor size={16} /> Kiosk Mode
          </button>
        </div>
      </div>

      {/* Live Stats Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { label: "Today's Total Check-ins", value: todayCount, color: '#6366f1', icon: Clock, bg: 'rgba(99,102,241,0.1)' },
          { label: 'Currently In Gym', value: inGymCount, color: '#10b981', icon: Zap, bg: 'rgba(16,185,129,0.1)' },
          { label: 'Checked Out', value: checkedOutCount, color: '#94a3b8', icon: LogOut, bg: 'rgba(148,163,184,0.1)' },
          { label: 'QR Scan Ratio', value: todayCount > 0 ? `${Math.round((qrCount / todayCount) * 100)}%` : '0%', color: '#f59e0b', icon: QrCode, bg: 'rgba(245,158,11,0.1)' },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{s.label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={15} color={s.color} />
              </div>
            </div>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Records Table Card */}
      <div className="card" style={{ padding: 0 }}>
        {/* Table Header Controls */}
        <div style={{
          padding: '1.25rem', borderBottom: '1px solid var(--color-bg-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          {/* Tab Filters */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Logs (${records.length})` },
              { id: 'in_gym', label: `In Gym (${inGymCount})` },
              { id: 'checked_out', label: `Completed (${checkedOutCount})` },
              { id: 'qr', label: `QR Scans (${qrCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`btn ${filterType === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderRadius: 8 }}
                onClick={() => setFilterType(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search filter & refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input"
                style={{ paddingLeft: '2rem', paddingRight: '0.5rem', fontSize: '0.8rem', height: 34 }}
                placeholder="Search member..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', height: 34 }}
              onClick={() => refetch()}
              title="Refresh log"
            >
              <RefreshCw size={14} className={isFetching ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="table-container">
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <div className="spin" style={{ width: 28, height: 28, border: '3px solid var(--color-bg-border)', borderTopColor: '#10b981', borderRadius: '50%', margin: '0 auto 0.75rem' }} />
              Loading today's attendance logs...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <QrCode size={36} color="var(--color-text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                No attendance records matching filter
              </p>
              <p style={{ fontSize: '0.8rem' }}>
                Use "Scan Member QR" or "Manual Check-In" to mark attendance.
              </p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Method</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.8rem' }}>
                          {r.memberId?.photo ? (
                            <img src={r.memberId.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            r.memberId?.fullName?.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                            {r.memberId?.fullName || 'Unknown Member'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                            {r.memberId?.memberId || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${r.method === 'qr' ? 'badge-active' : 'badge-frozen'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        {r.method === 'qr' ? <QrCode size={11} /> : <User size={11} />}
                        {r.method === 'qr' ? 'QR Code' : 'Manual'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {r.checkInTime ? format(new Date(r.checkInTime), 'hh:mm a') : '—'}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {r.checkOutTime ? (
                        format(new Date(r.checkOutTime), 'hh:mm a')
                      ) : (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          color: '#10b981', fontWeight: 600, fontSize: '0.8rem',
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                          In Gym
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {r.duration ? `${r.duration} min` : '—'}
                    </td>
                    <td>
                      {r.checkOutTime ? (
                        <span className="badge badge-expired">Completed</span>
                      ) : (
                        <span className="badge badge-active">Active</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!r.checkOutTime && (
                        <button
                          className="btn btn-ghost"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', color: 'var(--color-warning)' }}
                          onClick={() => handleCheckOut(r.memberId?._id || r.memberId)}
                          disabled={isCheckingOut}
                        >
                          <LogOut size={13} /> Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          onClose={() => {
            setShowQRScanner(false)
            refetch()
          }}
          onScanSuccess={() => refetch()}
        />
      )}

      {/* Manual Check-In Modal */}
      {showManual && (
        <ManualCheckInModal
          onClose={() => {
            setShowManual(false)
            refetch()
          }}
          onCheckInSuccess={() => refetch()}
        />
      )}

      {/* Kiosk Fullscreen Mode */}
      {showKiosk && (
        <KioskScannerModal
          onClose={() => {
            setShowKiosk(false)
            refetch()
          }}
          onScanSuccess={() => refetch()}
        />
      )}
    </div>
  )
}
