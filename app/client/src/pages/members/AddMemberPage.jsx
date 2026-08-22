import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader, User } from 'lucide-react'
import toast from 'react-hot-toast'
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

function Field({ label, id, error, children }) {
  return (
    <div className="form-group">
      <label className="label" htmlFor={id}>{label}</label>
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export default function AddMemberPage() {
  const navigate = useNavigate()
  const [createMember, { isLoading }] = useCreateMemberMutation()
  const { data: plansData } = useGetActivePlansQuery()
  const plans = plansData?.data || []

  const [form, setForm] = useState({
    fullName: '', gender: 'male', dob: '', phone: '', email: '', address: '',
    bloodGroup: '', medicalConditions: '', emergencyContact: { name: '', phone: '', relation: '' },
    notes: '', planId: '', password: '',
  })
  const [errors, setErrors] = useState({})

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setEc = (key, val) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, [key]: val } }))

  const planOptions = [
    { value: '', label: 'Select Plan (Optional)' },
    ...plans.map(p => ({
      value: p._id,
      label: p.name,
      sublabel: `₹${p.price?.toLocaleString()} • ${p.durationDays} days`,
    })),
  ]

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.gender) e.gender = 'Gender is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      const member = await createMember(form).unwrap()
      toast.success(`Member "${form.fullName}" created!`)
      navigate(`/members/${member.data._id}`)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create member')
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/members')} style={{ padding: '0.5rem' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">Add New Member</h1>
            <p className="page-subtitle">Fill in member details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Basic Info */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} color="var(--color-accent)" /> Basic Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              <Field label="Full Name *" id="fullName" error={errors.fullName}>
                <input className="input" id="fullName" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="John Doe" />
              </Field>
              <Field label="Gender *" id="gender" error={errors.gender}>
                <SearchableSelect
                  options={GENDERS}
                  value={form.gender}
                  onChange={val => set('gender', val)}
                  id="gender"
                />
              </Field>
              <Field label="Date of Birth" id="dob">
                <input className="input" id="dob" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
              </Field>
              <Field label="Phone *" id="phone" error={errors.phone}>
                <input className="input" id="phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
              </Field>
              <Field label="Email" id="email">
                <input className="input" id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" />
              </Field>
              <Field label="Password" id="password">
                <input className="input" id="password" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" />
              </Field>
              <Field label="Plan Selected" id="planId">
                <SearchableSelect
                  options={planOptions}
                  value={form.planId}
                  onChange={val => set('planId', val)}
                  placeholder="Select Plan..."
                  searchPlaceholder="Search plans..."
                  id="planId"
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
              <Field label="Address" id="address">
                <input className="input" id="address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St, City" />
              </Field>
              <Field label="Medical Conditions" id="medical">
                <input className="input" id="medical" value={form.medicalConditions} onChange={e => set('medicalConditions', e.target.value)} placeholder="None" />
              </Field>
              <Field label="Notes" id="notes">
                <input className="input" id="notes" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional notes..." />
              </Field>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Emergency Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Field label="Name" id="ec-name"><input className="input" id="ec-name" value={form.emergencyContact.name} onChange={e => setEc('name', e.target.value)} placeholder="Jane Doe" /></Field>
              <Field label="Phone" id="ec-phone"><input className="input" id="ec-phone" value={form.emergencyContact.phone} onChange={e => setEc('phone', e.target.value)} placeholder="+91 ..." /></Field>
              <Field label="Relation" id="ec-relation"><input className="input" id="ec-relation" value={form.emergencyContact.relation} onChange={e => setEc('relation', e.target.value)} placeholder="Spouse, Parent..." /></Field>
            </div>
          </div>

          {/* Submit */}
          <div className="card" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/members')}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="add-member-submit" disabled={isLoading}>
              {isLoading ? <Loader size={16} className="spin" /> : 'Create Member'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
