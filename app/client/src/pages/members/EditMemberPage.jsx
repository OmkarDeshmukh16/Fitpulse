import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useGetMemberQuery, useUpdateMemberMutation } from '../../services/members.api'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function Field({ label, id, error, children }) {
  return (
    <div className="form-group">
      <label className="label" htmlFor={id}>{label}</label>
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export default function EditMemberPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: memberRes, isLoading: fetchingMember, isError } = useGetMemberQuery(id)
  const [updateMember, { isLoading: updating }] = useUpdateMemberMutation()

  const [form, setForm] = useState({
    fullName: '',
    gender: 'male',
    dob: '',
    phone: '',
    email: '',
    address: '',
    bloodGroup: '',
    medicalConditions: '',
    membershipStatus: 'active',
    emergencyContact: { name: '', phone: '', relation: '' },
    notes: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (memberRes?.data) {
      const m = memberRes.data
      setForm({
        fullName: m.fullName || '',
        gender: m.gender || 'male',
        dob: m.dob ? m.dob.split('T')[0] : '',
        phone: m.phone || '',
        email: m.email || '',
        address: m.address || '',
        bloodGroup: m.bloodGroup || '',
        medicalConditions: m.medicalConditions || '',
        membershipStatus: m.membershipStatus || 'active',
        emergencyContact: {
          name: m.emergencyContact?.name || '',
          phone: m.emergencyContact?.phone || '',
          relation: m.emergencyContact?.relation || '',
        },
        notes: m.notes || '',
      })
    }
  }, [memberRes])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setEc = (key, val) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, [key]: val } }))

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
      await updateMember({ id, ...form }).unwrap()
      toast.success(`Member "${form.fullName}" updated successfully!`)
      navigate(`/members/${id}`)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update member')
    }
  }

  if (fetchingMember) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
        Loading member details...
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>Failed to load member profile for editing.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/members')}>
          <ArrowLeft size={16} /> Back to Members
        </button>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate(`/members/${id}`)} style={{ padding: '0.5rem' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">Edit Member</h1>
            <p className="page-subtitle">Update member information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Basic Info */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} color="var(--color-accent)" /> Basic Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <Field label="Full Name *" id="fullName" error={errors.fullName}>
                <input className="input" id="fullName" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="John Doe" />
              </Field>

              <Field label="Gender *" id="gender" error={errors.gender}>
                <select className="input" id="gender" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
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

              <Field label="Blood Group" id="bloodGroup">
                <select className="input" id="bloodGroup" value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>

              <Field label="Membership Status" id="membershipStatus">
                <select className="input" id="membershipStatus" value={form.membershipStatus} onChange={e => set('membershipStatus', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="frozen">Frozen</option>
                  <option value="expired">Expired</option>
                </select>
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
              <Field label="Name" id="ec-name">
                <input className="input" id="ec-name" value={form.emergencyContact.name} onChange={e => setEc('name', e.target.value)} placeholder="Jane Doe" />
              </Field>
              <Field label="Phone" id="ec-phone">
                <input className="input" id="ec-phone" value={form.emergencyContact.phone} onChange={e => setEc('phone', e.target.value)} placeholder="+91 ..." />
              </Field>
              <Field label="Relation" id="ec-relation">
                <input className="input" id="ec-relation" value={form.emergencyContact.relation} onChange={e => setEc('relation', e.target.value)} placeholder="Spouse, Parent..." />
              </Field>
            </div>
          </div>

          {/* Actions */}
          <div className="card" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/members/${id}`)}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="edit-member-submit" disabled={updating}>
              {updating ? <Loader size={16} className="spin" /> : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
