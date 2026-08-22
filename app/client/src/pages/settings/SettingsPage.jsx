import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader, Building, Settings as SettingsIcon, Users, Plus, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useGetSettingsQuery, useUpdateSettingsMutation, useGetStaffQuery, useAddStaffMutation } from '../../services/api'
import { useDispatch } from 'react-redux'
import { updateGymSettings } from '../../redux/slices/authSlice'
import SearchableSelect from '../../components/common/SearchableSelect'

const tabs = ['Gym Profile', 'System', 'Staff']

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
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation()
  const dispatch = useDispatch()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    try {
      const res = await updateSettings(form).unwrap()
      dispatch(updateGymSettings(res.data))
      toast.success('Gym profile saved!')
    } catch (err) { toast.error('Failed to save settings') }
  }



  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={isLoading} id="save-gym-profile">
          {isLoading ? <Loader size={16} className="spin" /> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>
    </div>
  )
}

function SystemTab({ settings }) {
  const [form, setForm] = useState({ currency: settings?.currency || 'INR', currencySymbol: settings?.currencySymbol || '₹', timezone: settings?.timezone || 'Asia/Kolkata' })
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation()
  const dispatch = useDispatch()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

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
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
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
      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--color-bg-secondary)', padding: '0.25rem', borderRadius: 10, border: '1px solid var(--color-bg-border)', width: 'fit-content' }}>
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
