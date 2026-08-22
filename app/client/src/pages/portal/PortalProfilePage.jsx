import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, QrCode, Phone, Mail, MapPin, Calendar, HeartPulse,
  ShieldCheck, Download, Edit, X, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useGetPortalProfileQuery, useUpdatePortalProfileMutation } from '../../services/portal.api'

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

export default function PortalProfilePage() {
  const { data, isLoading, isError, refetch } = useGetPortalProfileQuery()
  const [updateProfile, { isLoading: isUpdating }] = useUpdatePortalProfileMutation()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFullQR, setShowFullQR] = useState(false)

  const member = data?.data || null
  const membership = member?.activeMembership || null
  const plan = member?.currentPlanId || membership?.planId || null
  const gym = member?.gym || null

  const [editForm, setEditForm] = useState({
    phone: '',
    email: '',
    address: '',
    medicalConditions: '',
    emergencyContact: { name: '', phone: '', relation: '' },
  })

  const openEdit = () => {
    if (!member) return
    setEditForm({
      phone: member.phone || '',
      email: member.email || '',
      address: member.address || '',
      medicalConditions: member.medicalConditions || '',
      emergencyContact: {
        name: member.emergencyContact?.name || '',
        phone: member.emergencyContact?.phone || '',
        relation: member.emergencyContact?.relation || '',
      },
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(editForm).unwrap()
      toast.success('Account details updated!')
      setShowEditModal(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update account details')
    }
  }

  const handleDownloadQR = () => {
    if (!member?.qrCode) return
    const a = document.createElement('a')
    a.href = member.qrCode
    a.download = `fitpulse-pass-${member.memberId || 'member'}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success('Digital Gym Pass downloaded!')
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spin" style={{ width: 36, height: 36, border: '3px solid var(--color-bg-border)', borderTopColor: '#10b981', borderRadius: '50%' }} />
      </div>
    )
  }

  if (isError || !member) {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center', padding: '3rem' }}>
        <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Could not load account profile</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Please try refreshing or re-logging into your member account.
        </p>
        <button className="btn btn-primary" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    )
  }

  const daysRemaining = membership?.endDate
    ? Math.max(0, Math.ceil((new Date(membership.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            My Account & Digital Pass
          </h1>
          <p className="page-subtitle">
            View your gym pass, personal profile, and active membership details
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={openEdit}>
            <Edit size={16} /> Edit Contact Info
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowFullQR(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
            }}
          >
            <QrCode size={16} /> Open QR Scanner Pass
          </button>
        </div>
      </div>

      {/* Grid: Left Column (Digital Pass Card) | Right Column (Details) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '1.75rem', alignItems: 'start' }}>
        {/* LEFT: DIGITAL GYM PASS CARD */}
        <motion.div
          {...fadeUp}
          className="card"
          style={{
            background: 'linear-gradient(145deg, #12122a 0%, #0e0e1c 100%)',
            border: '1px solid rgba(16,185,129,0.3)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Card Accent Top Line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #10b981, #6366f1)' }} />

          {/* Gym & Badge Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {gym?.name || 'Fitpulse Member Pass'}
            </span>
            <span className={`badge badge-${member.membershipStatus === 'active' ? 'active' : 'inactive'}`}>
              {member.membershipStatus?.toUpperCase()}
            </span>
          </div>

          {/* Member Avatar */}
          <div style={{
            width: 76, height: 76, borderRadius: '50%', margin: '0 auto 0.75rem',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(99,102,241,0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 800, color: '#10b981',
            border: '2px solid rgba(16,185,129,0.4)',
          }}>
            {member.photo ? (
              <img src={member.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              member.fullName?.charAt(0) || 'M'
            )}
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.2rem' }}>
            {member.fullName}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginBottom: '1.25rem' }}>
            ID: {member.memberId}
          </p>

          {/* QR Code Container */}
          <div
            onClick={() => setShowFullQR(true)}
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '1.25rem',
              margin: '0 auto 1rem',
              width: 210,
              height: 210,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="Click to expand QR Code"
          >
            {member.qrCode ? (
              <img src={member.qrCode} alt="Member QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ color: '#0f172a', fontSize: '0.8rem', fontWeight: 600 }}>
                Generating QR...
              </div>
            )}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            Scan at front desk scanner for entry / exit
          </p>

          {/* Pass Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.45rem' }}
              onClick={() => setShowFullQR(true)}
            >
              <QrCode size={14} /> Fullscreen
            </button>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.45rem' }}
              onClick={handleDownloadQR}
            >
              <Download size={14} /> Save Pass
            </button>
          </div>
        </motion.div>

        {/* RIGHT: PERSONAL DETAILS & MEMBERSHIP INFO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Membership Plan Summary */}
          <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="#10b981" /> Active Membership
              </h3>
              {daysRemaining !== null && (
                <span className={`badge ${daysRemaining <= 7 ? 'badge-frozen' : 'badge-active'}`}>
                  {daysRemaining} Days Left
                </span>
              )}
            </div>

            {plan ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-bg-border)' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Plan Name</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>{plan.name}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Price & Duration</span>
                  <span style={{ fontWeight: 600, color: '#10b981', fontSize: '0.9rem' }}>₹{plan.price?.toLocaleString()} / {plan.durationDays} days</span>
                </div>
                {membership?.startDate && (
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Validity</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {format(new Date(membership.startDate), 'dd MMM yyyy')} - {membership.endDate ? format(new Date(membership.endDate), 'dd MMM yyyy') : '—'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No active plan assigned.</p>
            )}
          </motion.div>

          {/* Personal Information */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} color="var(--color-accent)" /> Personal Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Full Name</span>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{member.fullName}</div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Member Code</span>
                <div style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-accent-light)' }}>{member.memberId}</div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Phone</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                  <Phone size={14} color="var(--color-accent-light)" /> {member.phone || '—'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Email</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                  <Mail size={14} color="var(--color-accent-light)" /> {member.email || '—'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Gender</span>
                <div style={{ textTransform: 'capitalize', fontWeight: 500 }}>{member.gender || '—'}</div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Date of Birth</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                  <Calendar size={14} color="var(--color-accent-light)" />
                  {member.dob ? format(new Date(member.dob), 'dd MMM yyyy') : '—'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Blood Group</span>
                <div style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{member.bloodGroup || 'Not specified'}</div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Join Date</span>
                <div style={{ fontWeight: 500 }}>
                  {member.joinDate ? format(new Date(member.joinDate), 'dd MMM yyyy') : '—'}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Address</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                  <MapPin size={14} color="var(--color-accent-light)" /> {member.address || 'No address provided'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Health & Emergency Contact Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Emergency Contact */}
            <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={15} color="#f59e0b" /> Emergency Contact
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Name</span>
                  <div style={{ fontWeight: 600 }}>{member.emergencyContact?.name || 'Not provided'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Phone</span>
                  <div style={{ fontWeight: 500 }}>{member.emergencyContact?.phone || '—'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Relationship</span>
                  <div style={{ fontWeight: 500 }}>{member.emergencyContact?.relation || '—'}</div>
                </div>
              </div>
            </motion.div>

            {/* Medical Notes */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HeartPulse size={15} color="#ef4444" /> Medical Notes
              </h3>
              <p style={{ fontSize: '0.85rem', color: member.medicalConditions ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}>
                {member.medicalConditions || 'No medical conditions or allergies reported.'}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN QR MODAL */}
      <AnimatePresence>
        {showFullQR && (
          <div className="modal-overlay" onClick={() => setShowFullQR(false)} style={{ zIndex: 110 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal"
              style={{
                maxWidth: 400, width: '92%', textAlign: 'center', padding: '2.25rem 2rem',
                background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-border)',
                borderRadius: 24, boxShadow: '0 25px 70px rgba(0,0,0,0.8)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} color="#10b981" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Digital Gym Pass
                  </span>
                </div>
                <button className="btn btn-ghost" onClick={() => setShowFullQR(false)} style={{ padding: '0.35rem', borderRadius: 8 }}>
                  <X size={18} />
                </button>
              </div>

              {/* Large QR Display */}
              <div style={{
                background: '#ffffff', borderRadius: 20, padding: '1.5rem',
                margin: '0 auto 1.5rem', width: 250, height: 250,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              }}>
                {member.qrCode && (
                  <img src={member.qrCode} alt="Member QR Pass" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                )}
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                {member.fullName}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginBottom: '1rem' }}>
                ID: {member.memberId}
              </p>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                onClick={handleDownloadQR}
              >
                <Download size={16} /> Download Digital Pass Image
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)} style={{ zIndex: 110 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal slide-up"
              style={{ maxWidth: 500, width: '95%', background: 'var(--color-bg-card)', padding: '1.75rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Edit Contact Information
                </h3>
                <button className="btn btn-ghost" onClick={() => setShowEditModal(false)} style={{ padding: '0.35rem' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="label">Phone *</label>
                    <input
                      className="input"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Email</label>
                    <input
                      className="input"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Address</label>
                  <input
                    className="input"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Residential address..."
                  />
                </div>

                <div className="form-group">
                  <label className="label">Medical Conditions / Health Notes</label>
                  <input
                    className="input"
                    value={editForm.medicalConditions}
                    onChange={(e) => setEditForm({ ...editForm, medicalConditions: e.target.value })}
                    placeholder="None or list conditions..."
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--color-bg-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <label className="label" style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Emergency Contact</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    <input
                      className="input"
                      placeholder="Contact Name"
                      value={editForm.emergencyContact.name}
                      onChange={(e) => setEditForm({ ...editForm, emergencyContact: { ...editForm.emergencyContact, name: e.target.value } })}
                    />
                    <input
                      className="input"
                      placeholder="Phone"
                      value={editForm.emergencyContact.phone}
                      onChange={(e) => setEditForm({ ...editForm, emergencyContact: { ...editForm.emergencyContact, phone: e.target.value } })}
                    />
                    <input
                      className="input"
                      placeholder="Relation"
                      value={editForm.emergencyContact.relation}
                      onChange={(e) => setEditForm({ ...editForm, emergencyContact: { ...editForm.emergencyContact, relation: e.target.value } })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
