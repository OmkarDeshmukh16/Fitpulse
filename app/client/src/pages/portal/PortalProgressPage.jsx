import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Plus, Scale, Ruler, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useGetPortalProgressQuery, useAddPortalProgressMutation } from '../../services/portal.api'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const emptyForm = { weight: '', bodyFat: '', chest: '', waist: '', hips: '', biceps: '', thighs: '', notes: '' }

export default function PortalProgressPage() {
  const { data, isLoading } = useGetPortalProgressQuery()
  const [addProgress, { isLoading: adding }] = useAddPortalProgressMutation()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })

  const entries = data?.data || []

  // Chart data (reverse for chronological order)
  const chartData = [...entries].reverse().map((e) => ({
    date: new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    weight: e.weight,
    bodyFat: e.bodyFat,
    waist: e.waist,
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const body = {}
    Object.entries(form).forEach(([key, val]) => {
      if (val !== '' && val !== null) {
        body[key] = key === 'notes' ? val : parseFloat(val)
      }
    })
    if (Object.keys(body).length === 0 || (Object.keys(body).length === 1 && body.notes)) {
      return toast.error('Please enter at least one measurement')
    }
    try {
      await addProgress(body).unwrap()
      toast.success('Progress logged! 📈')
      setForm({ ...emptyForm })
      setShowForm(false)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to log progress')
    }
  }

  const onChange = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spin" style={{ width: 32, height: 32, border: '3px solid var(--color-bg-border)', borderTopColor: '#10b981', borderRadius: '50%' }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Progress Tracker</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Track your body measurements over time</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}
        >
          <Plus size={16} /> Log Progress
        </button>
      </div>

      {/* Log Form */}
      {showForm && (
        <motion.div {...fadeUp} className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Log New Measurements</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { key: 'weight', label: 'Weight (kg)', icon: Scale },
                { key: 'bodyFat', label: 'Body Fat %', icon: TrendingUp },
                { key: 'chest', label: 'Chest (cm)', icon: Ruler },
                { key: 'waist', label: 'Waist (cm)', icon: Ruler },
                { key: 'hips', label: 'Hips (cm)', icon: Ruler },
                { key: 'biceps', label: 'Biceps (cm)', icon: Ruler },
                { key: 'thighs', label: 'Thighs (cm)', icon: Ruler },
              ].map((f) => (
                <div key={f.key} className="form-group">
                  <label className="label">{f.label}</label>
                  <input
                    className="input"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={form[f.key]}
                    onChange={onChange(f.key)}
                  />
                </div>
              ))}
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="label">Notes</label>
              <input className="input" placeholder="How are you feeling?" value={form.notes} onChange={onChange('notes')} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" type="submit" disabled={adding} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}>
                {adding ? <Loader size={16} className="spin" /> : 'Save Entry'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Charts */}
      {chartData.length >= 2 && (
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>Trends</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={{ stroke: 'var(--color-bg-border)' }} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={{ stroke: 'var(--color-bg-border)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-bg-border)',
                    borderRadius: 10,
                    color: 'var(--color-text-primary)',
                    fontSize: '0.8rem',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name="Weight (kg)" connectNulls />
                <Line type="monotone" dataKey="bodyFat" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} name="Body Fat %" connectNulls />
                <Line type="monotone" dataKey="waist" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} name="Waist (cm)" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Latest Stats */}
      {entries.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.15 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
          {[
            { label: 'Weight', value: entries[0].weight, unit: 'kg', color: '#10b981', prev: entries[1]?.weight },
            { label: 'Body Fat', value: entries[0].bodyFat, unit: '%', color: '#f59e0b', prev: entries[1]?.bodyFat },
            { label: 'Chest', value: entries[0].chest, unit: 'cm', color: '#6366f1', prev: entries[1]?.chest },
            { label: 'Waist', value: entries[0].waist, unit: 'cm', color: '#3b82f6', prev: entries[1]?.waist },
            { label: 'Hips', value: entries[0].hips, unit: 'cm', color: '#8b5cf6', prev: entries[1]?.hips },
            { label: 'Biceps', value: entries[0].biceps, unit: 'cm', color: '#ec4899', prev: entries[1]?.biceps },
            { label: 'Thighs', value: entries[0].thighs, unit: 'cm', color: '#ef4444', prev: entries[1]?.thighs },
          ].filter((s) => s.value != null).map((s) => {
            const diff = s.prev != null ? (s.value - s.prev).toFixed(1) : null
            return (
              <div key={s.label} className="card-sm" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {s.value}<span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{s.unit}</span>
                </div>
                {diff !== null && diff !== '0.0' && (
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: parseFloat(diff) > 0 ? '#ef4444' : '#10b981', marginTop: '0.25rem' }}>
                    {parseFloat(diff) > 0 ? '↑' : '↓'} {Math.abs(parseFloat(diff))}{s.unit}
                  </div>
                )}
              </div>
            )
          })}
        </motion.div>
      )}

      {/* History Table */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>History</h3>
        {entries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            No progress entries yet. Click "Log Progress" to get started!
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Body Fat</th>
                  <th>Chest</th>
                  <th>Waist</th>
                  <th>Hips</th>
                  <th>Biceps</th>
                  <th>Thighs</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e._id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                      {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td>{e.weight != null ? `${e.weight} kg` : '—'}</td>
                    <td>{e.bodyFat != null ? `${e.bodyFat}%` : '—'}</td>
                    <td>{e.chest != null ? `${e.chest} cm` : '—'}</td>
                    <td>{e.waist != null ? `${e.waist} cm` : '—'}</td>
                    <td>{e.hips != null ? `${e.hips} cm` : '—'}</td>
                    <td>{e.biceps != null ? `${e.biceps} cm` : '—'}</td>
                    <td>{e.thighs != null ? `${e.thighs} cm` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
