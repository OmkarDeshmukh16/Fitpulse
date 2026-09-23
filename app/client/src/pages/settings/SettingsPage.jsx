import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Save, Loader, Building, Settings as SettingsIcon, Users, Plus, Shield,
  Upload, Image as ImageIcon, Trash2, Link as LinkIcon, Dumbbell, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useGetSettingsQuery, useUpdateSettingsMutation, useGetStaffQuery, useAddStaffMutation } from '../../services/api'
import { useDispatch } from 'react-redux'
import { updateGymSettings } from '../../redux/slices/authSlice'
import SearchableSelect from '../../components/common/SearchableSelect'

const tabs = ['Gym Profile', 'System', 'Staff']

/**
 * Utility to process and optimize an image file to a lightweight data URL
 */
const processImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'))
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (PNG, JPG, SVG, WEBP)'))
    }
    if (file.size > 5 * 1024 * 1024) {
      return reject(new Error('Image must be under 5MB'))
    }

    if (file.type === 'image/svg+xml') {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => reject(new Error('Failed to read SVG file'))
      reader.readAsDataURL(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_DIM = 400
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width)
            width = MAX_DIM
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height)
            height = MAX_DIM
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        const isPng = file.type === 'image/png'
        const outputType = isPng ? 'image/png' : 'image/jpeg'
        const dataUrl = canvas.toDataURL(outputType, 0.88)
        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error('Failed to parse image'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Defined at module level — NOT inside a component — to prevent remount on every render
function Row({ label, id, children }) {
  return (
    <div className="form-group">
      <label className="label" htmlFor={id}>{label}</label>
      {children}
    </div>
  )
}

function GymProfileTab({ settings }) {
  const [form, setForm] = useState(settings || {})
  const [isDragging, setIsDragging] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef(null)
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation()
  const dispatch = useDispatch()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setForm(settings)
    }
  }, [settings])

  const handleSave = async () => {
    try {
      const res = await updateSettings(form).unwrap()
      dispatch(updateGymSettings(res.data))
      toast.success('Gym profile saved!')
    } catch (err) {
      toast.error('Failed to save settings')
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await processImageFile(file)
      set('logo', dataUrl)
      toast.success('Logo uploaded!')
    } catch (err) {
      toast.error(err.message || 'Failed to process logo')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    try {
      const dataUrl = await processImageFile(file)
      set('logo', dataUrl)
      toast.success('Logo uploaded!')
    } catch (err) {
      toast.error(err.message || 'Failed to process logo')
    }
  }

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return
    set('logo', urlInput.trim())
    setUrlInput('')
    setShowUrlInput(false)
    toast.success('Logo URL applied!')
  }

  const handleRemoveLogo = () => {
    set('logo', '')
    toast.success('Logo removed')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Gym Logo & Brand Section */}
      <div style={{
        padding: '1.25rem',
        borderRadius: 12,
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-bg-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <ImageIcon size={18} color="var(--color-accent)" /> Gym Logo & Branding
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>
              Your logo appears in the sidebars, top navigation bar, member portal, and receipts.
            </p>
          </div>
          {form.logo && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRemoveLogo}
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              <Trash2 size={14} /> Remove Logo
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
          {/* Upload Dropzone / Logo Preview Frame */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              padding: '1.25rem',
              borderRadius: 10,
              border: `2px dashed ${isDragging ? 'var(--color-accent)' : 'var(--color-bg-border)'}`,
              background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'var(--color-bg-card)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Logo Preview box */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              background: form.logo ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: '1px solid var(--color-bg-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
              {form.logo ? (
                <img
                  src={form.logo}
                  alt="Gym Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <Dumbbell size={32} color="#fff" />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="gym-logo-file-input"
              />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                >
                  <Upload size={14} /> {form.logo ? 'Change Logo' : 'Upload Image'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <LinkIcon size={14} /> {showUrlInput ? 'Cancel URL' : 'Use URL'}
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                PNG, SVG, JPG, or WEBP (Max 5MB). Square or horizontal with transparent background recommended.
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div style={{
            padding: '1rem',
            borderRadius: 10,
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-bg-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sidebar Header Preview
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.6rem 0.75rem',
              borderRadius: 8,
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-bg-border)',
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: form.logo ? 'var(--color-bg-secondary)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                border: form.logo ? '1px solid var(--color-bg-border)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                {form.logo ? (
                  <img src={form.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                ) : (
                  <Dumbbell size={18} color="#fff" />
                )}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {form.gymName || 'Fitpulse'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ADMIN
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* URL Input dropdown/field */}
        {showUrlInput && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <input
              className="input"
              placeholder="Paste public logo URL (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyUrl(); }}
              style={{ fontSize: '0.85rem' }}
            />
            <button type="button" className="btn btn-primary" onClick={handleApplyUrl} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Profile Form Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        <Row label="Gym Name" id="gym-name"><input className="input" id="gym-name" value={form.gymName || ''} onChange={e => set('gymName', e.target.value)} /></Row>
        <Row label="Phone" id="gym-phone"><input className="input" id="gym-phone" value={form.phone || ''} onChange={e => set('phone', e.target.value)} /></Row>
        <Row label="Email" id="gym-email"><input className="input" id="gym-email" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} /></Row>
        <Row label="Website" id="gym-website"><input className="input" id="gym-website" value={form.website || ''} onChange={e => set('website', e.target.value)} /></Row>
        <Row label="GST Number" id="gym-gst"><input className="input" id="gym-gst" value={form.gstNumber || ''} onChange={e => set('gstNumber', e.target.value)} placeholder="e.g. 27XXXXX1234X1Z5" /></Row>
        <Row label="Address" id="gym-address"><input className="input" id="gym-address" value={form.address || ''} onChange={e => set('address', e.target.value)} /></Row>
        <Row label="City" id="gym-city"><input className="input" id="gym-city" value={form.city || ''} onChange={e => set('city', e.target.value)} /></Row>
        <Row label="State" id="gym-state"><input className="input" id="gym-state" value={form.state || ''} onChange={e => set('state', e.target.value)} /></Row>
        <Row label="Pincode" id="gym-pin"><input className="input" id="gym-pin" value={form.pincode || ''} onChange={e => set('pincode', e.target.value)} /></Row>
        <Row label="Receipt Footer" id="gym-footer"><input className="input" id="gym-footer" value={form.receiptFooter || ''} onChange={e => set('receiptFooter', e.target.value)} /></Row>
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={isLoading} id="save-gym-profile">
            {isLoading ? <Loader size={16} className="spin" /> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function SystemTab({ settings }) {
  const [form, setForm] = useState({ currency: settings?.currency || 'INR', currencySymbol: settings?.currencySymbol || '₹', timezone: settings?.timezone || 'Asia/Kolkata' })
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation()
  const dispatch = useDispatch()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setForm({
        currency: settings?.currency || 'INR',
        currencySymbol: settings?.currencySymbol || '₹',
        timezone: settings?.timezone || 'Asia/Kolkata'
      })
    }
  }, [settings])

  const handleSave = async () => {
    try {
      const res = await updateSettings(form).unwrap()
      dispatch(updateGymSettings(res.data))
      toast.success('System settings saved!')
    } catch { toast.error('Failed to save') }
  }

  return (
    <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="form-group">
        <label className="label" htmlFor="currency">Currency Code</label>
        <input className="input" id="currency" value={form.currency} onChange={e => set('currency', e.target.value)} placeholder="INR, USD, EUR..." />
      </div>
      <div className="form-group">
        <label className="label" htmlFor="currency-symbol">Currency Symbol</label>
        <input className="input" id="currency-symbol" value={form.currencySymbol} onChange={e => set('currencySymbol', e.target.value)} placeholder="₹, $, €..." />
      </div>
      <div className="form-group">
        <label className="label" htmlFor="timezone">Timezone</label>
        <input className="input" id="timezone" value={form.timezone} onChange={e => set('timezone', e.target.value)} placeholder="Asia/Kolkata" />
      </div>
      <button className="btn btn-primary" onClick={handleSave} disabled={isLoading} id="save-system" style={{ alignSelf: 'flex-start' }}>
        {isLoading ? <Loader size={16} className="spin" /> : <><Save size={16} /> Save</>}
      </button>
    </div>
  )
}

function StaffTab() {
  const { data: staffData } = useGetStaffQuery()
  const [addStaff, { isLoading }] = useAddStaffMutation()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'receptionist' })
  const staff = staffData?.data || []
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await addStaff(form).unwrap()
      toast.success('Staff member added!')
      setShowForm(false)
      setForm({ name: '', email: '', password: '', role: 'receptionist' })
    } catch (err) { toast.error(err?.data?.message || 'Failed to add staff') }
  }

  const roleColors = { gymowner: '#6366f1', manager: '#10b981', trainer: '#3b82f6', receptionist: '#f59e0b' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} id="add-staff-btn">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Add Staff Member</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required id="staff-name" />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required id="staff-email" />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} id="staff-password" />
            </div>
            <div className="form-group">
              <label className="label">Role</label>
              <SearchableSelect
                options={[
                  { value: 'manager', label: 'Manager' },
                  { value: 'trainer', label: 'Trainer' },
                  { value: 'receptionist', label: 'Receptionist' },
                ]}
                value={form.role}
                onChange={val => set('role', val)}
                id="staff-role"
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isLoading} id="staff-submit">
                {isLoading ? <Loader size={16} className="spin" /> : 'Add Staff'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead><tr><th>Staff Member</th><th>Role</th><th>Email</th><th>Status</th><th>Last Login</th></tr></thead>
            <tbody>
              {staff.map(s => (
                <tr key={s._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{s.name.charAt(0)}</div>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: (roleColors[s.role] || '#6366f1') + '20', color: roleColors[s.role] || '#6366f1' }}>{s.role}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{s.email}</td>
                  <td><span className={`badge badge-${s.isActive ? 'active' : 'inactive'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{s.lastLogin ? new Date(s.lastLogin).toLocaleDateString() : 'Never'}</td>
                </tr>
              ))}
              {staff.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No staff members added yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Gym Profile')
  const { data } = useGetSettingsQuery()
  const settings = data?.data || {}

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your gym management system</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--color-bg-secondary)', padding: '0.25rem', borderRadius: 10, border: '1px solid var(--color-bg-border)', width: 'fit-content', maxWidth: '100%', overflowX: 'auto' }}>
        {[{ label: 'Gym Profile', icon: Building }, { label: 'System', icon: SettingsIcon }, { label: 'Staff', icon: Users }].map(({ label, icon: Icon }) => (
          <button key={label} id={`settings-tab-${label.toLowerCase().replace(' ', '-')}`} onClick={() => setActiveTab(label)}
            style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', background: activeTab === label ? 'var(--color-accent)' : 'transparent', color: activeTab === label ? '#fff' : 'var(--color-text-muted)', transition: 'all 0.2s' }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab === 'Gym Profile' && <GymProfileTab settings={settings} />}
        {activeTab === 'System' && <SystemTab settings={settings} />}
        {activeTab === 'Staff' && <StaffTab />}
      </div>
    </div>
  )
}
