import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Loader, Check, X, Dumbbell, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useGetPlansQuery, useCreatePlanMutation, useUpdatePlanMutation, useDeletePlanMutation } from '../../services/api'
import SearchableSelect from '../../components/common/SearchableSelect'

const PRESET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']

function PlanCard({ plan, onEdit, onDelete }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: plan.color || '#6366f1' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{plan.name}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{plan.durationDays} days</p>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button className="btn btn-ghost" style={{ padding: '0.375rem' }} onClick={() => onEdit(plan)}><Edit size={14} /></button>
          <button className="btn btn-ghost" style={{ padding: '0.375rem', color: 'var(--color-danger)' }} onClick={() => onDelete(plan._id, plan.name)}><Trash2 size={14} /></button>
        </div>
      </div>

      <div style={{ fontSize: '2rem', fontWeight: 900, color: plan.color || '#6366f1', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
        ₹{plan.price?.toLocaleString()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
        {(plan.features || []).map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            <Check size={12} color="var(--color-success)" style={{ flexShrink: 0 }} />
            {f}
          </div>
        ))}
        {plan.personalTrainingIncluded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-accent-light)' }}>
            <Dumbbell size={12} /> Personal Training Included
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
        <span>Max freeze: {plan.maxFreezeDays || 0} days</span>
        <span className={`badge badge-${plan.status}`}>{plan.status}</span>
      </div>
    </motion.div>
  )
}

function PlanForm({ plan, onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState(plan || { name: '', durationDays: 30, price: 0, features: '', personalTrainingIncluded: false, maxFreezeDays: 0, status: 'active', color: '#6366f1' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, features: typeof form.features === 'string' ? form.features.split('\n').filter(Boolean) : form.features, price: Number(form.price), durationDays: Number(form.durationDays), maxFreezeDays: Number(form.maxFreezeDays) })
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal slide-up" onClick={e => e.stopPropagation()}>
        <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>{plan?._id ? 'Edit Plan' : 'Create Plan'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Plan Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Monthly Premium" />
            </div>
            <div className="form-group">
              <label className="label">Duration (days) *</label>
              <input className="input" type="number" value={form.durationDays} onChange={e => set('durationDays', e.target.value)} required min={1} />
            </div>
            <div className="form-group">
              <label className="label">Price (₹) *</label>
              <input className="input" type="number" value={form.price} onChange={e => set('price', e.target.value)} required min={0} />
            </div>
            <div className="form-group">
              <label className="label">Max Freeze Days</label>
              <input className="input" type="number" value={form.maxFreezeDays} onChange={e => set('maxFreezeDays', e.target.value)} min={0} />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Features (one per line)</label>
            <textarea className="input" rows={4} value={typeof form.features === 'string' ? form.features : (form.features || []).join('\n')} onChange={e => set('features', e.target.value)} placeholder="Unlimited access&#10;Locker included&#10;Guest passes" style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1 1 180px' }}>
              <label className="label">Status</label>
              <SearchableSelect
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                value={form.status}
                onChange={val => set('status', val)}
                id="plan-status"
              />
            </div>
            <div className="form-group">
              <label className="label">Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                {PRESET_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => set('color', c)}
                    style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: form.color === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>
            </div>
            <div className="form-group" style={{ flexShrink: 0 }}>
              <label className="label">Personal Training</label>
              <input type="checkbox" checked={form.personalTrainingIncluded} onChange={e => set('personalTrainingIncluded', e.target.checked)} style={{ width: 20, height: 20, marginTop: '0.4rem', cursor: 'pointer' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? <Loader size={16} className="spin" /> : plan?._id ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PlansPage() {
  const [showForm, setShowForm] = useState(false)
  const [editPlan, setEditPlan] = useState(null)
  const { data, isLoading } = useGetPlansQuery()
  const [createPlan, { isLoading: creating }] = useCreatePlanMutation()
  const [updatePlan, { isLoading: updating }] = useUpdatePlanMutation()
  const [deletePlan] = useDeletePlanMutation()
  const plans = data?.data || []

  const handleCreate = async (form) => {
    try {
      await createPlan(form).unwrap()
      toast.success('Plan created!')
      setShowForm(false)
    } catch (err) { toast.error(err?.data?.message || 'Failed') }
  }

  const handleUpdate = async (form) => {
    try {
      await updatePlan({ id: editPlan._id, ...form }).unwrap()
      toast.success('Plan updated!')
      setEditPlan(null)
    } catch (err) { toast.error(err?.data?.message || 'Failed') }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete plan "${name}"?`)) return
    try {
      await deletePlan(id).unwrap()
      toast.success('Plan deleted')
    } catch (err) { toast.error(err?.data?.message || 'Cannot delete plan with active members') }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Membership Plans</h1>
          <p className="page-subtitle">{plans.length} plans configured</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} id="add-plan-btn">
          <Plus size={16} /> Add Plan
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {plans.map(plan => (
            <PlanCard key={plan._id} plan={plan} onEdit={setEditPlan} onDelete={handleDelete} />
          ))}
          {plans.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
              No plans yet. Create your first membership plan.
            </div>
          )}
        </div>
      )}

      {(showForm || editPlan) && (
        <PlanForm
          plan={editPlan}
          onSubmit={editPlan ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditPlan(null) }}
          isLoading={editPlan ? updating : creating}
        />
      )}
    </div>
  )
}
