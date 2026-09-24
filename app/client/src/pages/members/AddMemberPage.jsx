import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader, User, HeartPulse, Shield, CreditCard,
  Lock, Eye, EyeOff, Sparkles, CheckCircle2, RefreshCw, Calendar, Phone, Mail, MapPin, KeyRound
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { selectGymSettings } from '../../redux/slices/authSlice'
import { useCreateMemberMutation } from '../../services/members.api'
import { useGetActivePlansQuery } from '../../services/api'
import SearchableSelect from '../../components/common/SearchableSelect'

const BLOOD_GROUPS = [
  { value: '', label: 'Select Blood Group' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
]

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

function Field({ label, id, error, hint, children }) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="label" htmlFor={id}>{label}</label>
        {hint && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{hint}</span>}
      </div>
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export default function AddMemberPage() {
  const navigate = useNavigate()
  const gymSettings = useSelector(selectGymSettings)
  const sym = gymSettings?.currencySymbol || '₹'

  const [createMember, { isLoading }] = useCreateMemberMutation()
  const { data: plansData } = useGetActivePlansQuery()
  const plans = plansData?.data || []

  const [form, setForm] = useState({
    fullName: '', gender: 'male', dob: '', phone: '', email: '', address: '',
    bloodGroup: '', medicalConditions: '', emergencyContact: { name: '', phone: '', relation: '' },
    notes: '', planId: '', password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setEc = (key, val) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, [key]: val } }))

  const selectedPlan = plans.find(p => p._id === form.planId)

  const planOptions = [
    { value: '', label: 'No Plan Selected (Optional)' },
    ...plans.map(p => ({
      value: p._id,
      label: p.name,
      sublabel: `${sym}${p.price?.toLocaleString()} • ${p.durationDays} days`,
    })),
  ]

  const generateRandomKey = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    const lowercase = 'abcdefghijkmnpqrstuvwxyz'
    const numbers = '23456789'
    const symbols = '!@#$%'
    const all = uppercase + lowercase + numbers + symbols

    let token = ''
    token += uppercase[Math.floor(Math.random() * uppercase.length)]
    token += lowercase[Math.floor(Math.random() * lowercase.length)]
    token += numbers[Math.floor(Math.random() * numbers.length)]
    token += symbols[Math.floor(Math.random() * symbols.length)]
    for (let i = 0; i < 4; i++) {
      token += all[Math.floor(Math.random() * all.length)]
    }
    const shuffled = token.split('').sort(() => 0.5 - Math.random()).join('')
    set('password', shuffled)
    setShowPassword(true)
    toast.success('Generated random password!')
  }

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.gender) e.gender = 'Gender is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!validate()) {
      toast.error('Please fill in required fields')
      return
    }
    try {
      const member = await createMember(form).unwrap()
      toast.success(`Member "${form.fullName}" registered successfully!`)
      navigate(`/members/${member.data._id}`)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create member')
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/members')} style={{ padding: '0.5rem' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">Add New Member</h1>
            <p className="page-subtitle">Register a new gym member, assign an initial plan, and configure portal access</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/members')}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={isLoading} id="top-add-member-submit">
            {isLoading ? <Loader size={16} className="spin" /> : <><CheckCircle2 size={16} /> Create Member</>}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* ================= LEFT COLUMN ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 1. Basic Information */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={17} color="var(--color-accent)" /> Personal Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
                <Field label="Full Name *" id="fullName" error={errors.fullName}>
                  <input className="input" id="fullName" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="e.g. John Doe" autoFocus />
                </Field>

                <Field label="Phone Number *" id="phone" error={errors.phone}>
                  <input className="input" id="phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="e.g. +91 98765 43210" />
                </Field>

                <Field label="Email Address" id="email" hint="Used for portal login">
                  <input className="input" id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" />
                </Field>

                <Field label="Date of Birth" id="dob">
                  <input className="input" id="dob" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
                </Field>

                <Field label="Gender *" id="gender" error={errors.gender}>
                  <SearchableSelect
                    options={GENDERS}
                    value={form.gender}
                    onChange={val => set('gender', val)}
                    id="gender"
                  />
                </Field>

                <Field label="Blood Group" id="bloodGroup">
                  <SearchableSelect
                    options={BLOOD_GROUPS}
                    value={form.bloodGroup}
                    onChange={val => set('bloodGroup', val)}
                    placeholder="Select Blood Group..."
                    id="bloodGroup"
                  />
                </Field>

                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Street / Residential Address" id="address">
                    <input className="input" id="address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. 123 Fitness Ave, Apt 4B, City" />
                  </Field>
                </div>
              </div>
            </div>

            {/* 2. Health & Medical Notes */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HeartPulse size={17} color="#ef4444" /> Health & Medical Profile
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Field label="Medical Conditions / Allergies" id="medical" hint="Asthma, blood pressure, surgery, etc.">
                  <input className="input" id="medical" value={form.medicalConditions} onChange={e => set('medicalConditions', e.target.value)} placeholder="e.g. Mild asthma, lower back sensitivity, or None" />
                </Field>
                <Field label="Fitness Goals & Internal Notes" id="notes" hint="Target weight, trainer notes, referral source">
                  <textarea
                    className="input"
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    placeholder="e.g. Goal is 10kg fat loss, referred by Alex, prefers morning workouts..."
                    style={{ resize: 'vertical' }}
                  />
                </Field>
              </div>
            </div>

            {/* 3. Emergency Contact */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={17} color="#f59e0b" /> Emergency Contact
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <Field label="Contact Person Name" id="ec-name">
                  <input className="input" id="ec-name" value={form.emergencyContact.name} onChange={e => setEc('name', e.target.value)} placeholder="e.g. Jane Doe" />
                </Field>
                <Field label="Contact Phone" id="ec-phone">
                  <input className="input" id="ec-phone" value={form.emergencyContact.phone} onChange={e => setEc('phone', e.target.value)} placeholder="e.g. +91 98765 00000" />
                </Field>
                <Field label="Relationship" id="ec-relation">
                  <input className="input" id="ec-relation" value={form.emergencyContact.relation} onChange={e => setEc('relation', e.target.value)} placeholder="Spouse, Parent, Sibling..." />
                </Field>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 4. Membership Plan */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={17} color="var(--color-accent)" /> Initial Membership Plan
              </h3>
              <Field label="Select Plan" id="planId" hint="Can also be assigned later">
                <SearchableSelect
                  options={planOptions}
                  value={form.planId}
                  onChange={val => set('planId', val)}
                  placeholder="Select Plan (Optional)..."
                  searchPlaceholder="Search available plans..."
                  id="planId"
                />
              </Field>

              {selectedPlan ? (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1.1rem',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.04))',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                        {selectedPlan.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                        {selectedPlan.durationDays} Days Duration
                      </div>
                    </div>
                    <span className="badge badge-active" style={{ fontSize: '0.75rem' }}>
                      Active Upon Creation
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Membership Fee</span>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-accent-light)' }}>
                      {sym}{selectedPlan.price?.toLocaleString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    <span>Estimated Validity</span>
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                      Today → {new Date(Date.now() + selectedPlan.durationDays * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 10,
                  background: 'var(--color-bg-secondary)',
                  border: '1px dashed var(--color-bg-border)',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <Sparkles size={15} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                  <span>No plan selected. The member will be registered with an open profile and a plan can be assigned later.</span>
                </div>
              )}
            </div>

            {/* 5. Member Portal Credentials */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={17} color="#10b981" /> Member Portal Access
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                Allows the member to sign in to their mobile-friendly Fitpulse portal to view workouts, diet plans, and QR check-in.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Login Identifier</div>
                  <div style={{
                    padding: '0.6rem 0.85rem',
                    borderRadius: 8,
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-bg-border)',
                    fontSize: '0.85rem',
                    color: form.email ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    fontFamily: 'monospace',
                  }}>
                    {form.email ? form.email : 'Uses Member ID (generated on save)'}
                  </div>
                </div>

                <Field label="Portal Initial Password" id="password" hint="Optional">
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        className="input"
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => set('password', e.target.value)}
                        placeholder="Enter password or click Auto"
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={generateRandomKey}
                      title="Generate secure password"
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', flexShrink: 0 }}
                    >
                      <RefreshCw size={14} /> Auto
                    </button>
                  </div>
                </Field>
              </div>
            </div>

            {/* 6. Registration Summary & Actions */}
            <div className="card" style={{
              background: 'linear-gradient(180deg, var(--color-bg-card), var(--color-bg-secondary))',
              border: '1px solid var(--color-bg-border)',
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={17} color="var(--color-accent)" /> Registration Overview
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem', fontSize: '0.83rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Name:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{form.fullName || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Contact:</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{form.phone || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Plan:</span>
                  <span style={{ fontWeight: 600, color: selectedPlan ? 'var(--color-accent-light)' : 'var(--color-text-muted)' }}>
                    {selectedPlan ? selectedPlan.name : 'None selected'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Portal Access:</span>
                  <span style={{ color: form.password ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {form.password ? 'Password configured' : 'No password set'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="add-member-submit"
                  disabled={isLoading}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
                >
                  {isLoading ? <Loader size={18} className="spin" /> : <><CheckCircle2 size={18} /> Register Member</>}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/members')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

