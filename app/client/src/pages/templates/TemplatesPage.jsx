import { useState } from 'react'
import {
  Dumbbell,
  Utensils,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Loader,
  Layers,
  Flame,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  useGetWorkoutTemplatesQuery,
  useCreateWorkoutTemplateMutation,
  useUpdateWorkoutTemplateMutation,
  useDeleteWorkoutTemplateMutation,
  useGetDietTemplatesQuery,
  useCreateDietTemplateMutation,
  useUpdateDietTemplateMutation,
  useDeleteDietTemplateMutation,
} from '../../services/templates.api'

const goalBadges = {
  weight_loss: { label: 'Weight Loss', color: '#ef4444' },
  muscle_gain: { label: 'Muscle Gain', color: '#3b82f6' },
  maintenance: { label: 'Maintenance', color: '#10b981' },
  lean_bulk: { label: 'Lean Bulk', color: '#8b5cf6' },
  other: { label: 'General Fitness', color: '#6b7280' },
}

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('workout')

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers color="var(--color-accent)" size={24} /> Template Library Management
          </h1>
          <p className="page-subtitle">
            Create reusable workout and diet templates for gym members to self-select in their portal.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-bg-border)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'workout' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('workout')}
        >
          <Dumbbell size={16} /> Workout Templates
        </button>
        <button
          className={`btn ${activeTab === 'diet' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('diet')}
        >
          <Utensils size={16} /> Diet Templates
        </button>
      </div>

      {activeTab === 'workout' && <WorkoutTemplatesList />}
      {activeTab === 'diet' && <DietTemplatesList />}
    </div>
  )
}

function WorkoutTemplatesList() {
  const { data: res, isLoading } = useGetWorkoutTemplatesQuery()
  const [deleteTemplate] = useDeleteWorkoutTemplateMutation()
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const templates = res?.data || []

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete template "${name}"?`)) return
    try {
      await deleteTemplate(id).unwrap()
      toast.success('Workout template deleted')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete template')
    }
  }

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading workout templates...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => { setEditingTemplate(null); setIsCreating(true); }}>
          <Plus size={16} /> Create Workout Template
        </button>
      </div>

      {isCreating || editingTemplate ? (
        <WorkoutTemplateForm
          initialData={editingTemplate}
          onClose={() => { setIsCreating(false); setEditingTemplate(null); }}
        />
      ) : null}

      {templates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          No workout templates created yet. Click "Create Workout Template" to add one.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {templates.map((tpl) => {
            const badge = goalBadges[tpl.goalTag] || goalBadges.other
            const totalExercises = (tpl.days || []).reduce((acc, d) => acc + (d.exercises?.length || 0), 0)
            const isExpanded = expandedId === tpl._id

            return (
              <div key={tpl._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                      {tpl.templateName || tpl.name}
                    </h3>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: `${badge.color}20`,
                        color: badge.color,
                        border: `1px solid ${badge.color}40`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    {tpl.templateDescription || tpl.description || 'No description provided.'}
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500, borderTop: '1px solid var(--color-bg-border)', paddingTop: '0.5rem' }}>
                    <div>🗓️ {tpl.days?.length || 0} Days / week</div>
                    <div>🏋️ {totalExercises} Exercises</div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--color-bg-border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                    {(tpl.days || []).map((d, dIdx) => (
                      <div key={dIdx} style={{ background: 'var(--color-bg-subtle, rgba(255,255,255,0.02))', padding: '0.5rem', borderRadius: 6 }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {d.dayName} {d.focus ? `— ${d.focus}` : ''} {d.isRestDay ? '(Rest)' : ''}
                        </div>
                        {!d.isRestDay && (
                          <ul style={{ paddingLeft: '1.2rem', margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)' }}>
                            {(d.exercises || []).map((ex, eIdx) => (
                              <li key={eIdx}>
                                {ex.name} — {ex.sets} sets × {ex.reps} {ex.restSeconds ? `(${ex.restSeconds}s rest)` : ''}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-bg-border)', paddingTop: '0.75rem' }}>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => setExpandedId(isExpanded ? null : tpl._id)}
                  >
                    {isExpanded ? <><ChevronUp size={14} /> Hide Preview</> : <><ChevronDown size={14} /> Preview Plan</>}
                  </button>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => setEditingTemplate(tpl)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-ghost" style={{ color: 'var(--color-danger)', padding: '0.4rem' }} onClick={() => handleDelete(tpl._id, tpl.templateName || tpl.name)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function WorkoutTemplateForm({ initialData, onClose }) {
  const [createTemplate, { isLoading: isCreating }] = useCreateWorkoutTemplateMutation()
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateWorkoutTemplateMutation()

  const [templateName, setTemplateName] = useState(initialData?.templateName || initialData?.name || '')
  const [templateDescription, setTemplateDescription] = useState(initialData?.templateDescription || initialData?.description || '')
  const [goalTag, setGoalTag] = useState(initialData?.goalTag || 'maintenance')
  const [days, setDays] = useState(
    initialData?.days?.length
      ? initialData.days
      : [{ dayName: 'Day 1 - Push', focus: 'Chest, Shoulders & Triceps', isRestDay: false, exercises: [{ name: 'Bench Press', sets: 3, reps: '10-12', restSeconds: 60, notes: '' }] }]
  )

  const isSaving = isCreating || isUpdating

  const addDay = () => {
    setDays([...days, { dayName: `Day ${days.length + 1}`, focus: '', isRestDay: false, exercises: [{ name: '', sets: 3, reps: '12', restSeconds: 60, notes: '' }] }])
  }

  const removeDay = (dIdx) => {
    if (days.length === 1) return toast.error('Template must have at least 1 day')
    setDays(days.filter((_, idx) => idx !== dIdx))
  }

  const updateDay = (dIdx, field, val) => {
    setDays(days.map((d, idx) => (idx === dIdx ? { ...d, [field]: val } : d)))
  }

  const addExercise = (dIdx) => {
    setDays(days.map((d, idx) => (idx === dIdx ? { ...d, exercises: [...(d.exercises || []), { name: '', sets: 3, reps: '12', restSeconds: 60, notes: '' }] } : d)))
  }

  const removeExercise = (dIdx, eIdx) => {
    setDays(days.map((d, idx) => (idx === dIdx ? { ...d, exercises: d.exercises.filter((_, i) => i !== eIdx) } : d)))
  }

  const updateExercise = (dIdx, eIdx, field, val) => {
    setDays(
      days.map((d, idx) =>
        idx === dIdx
          ? { ...d, exercises: d.exercises.map((ex, i) => (i === eIdx ? { ...ex, [field]: val } : ex)) }
          : d
      )
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!templateName.trim()) return toast.error('Template name is required')

    const cleanedDays = days.map((d, dIdx) => ({
      ...d,
      dayName: (d.dayName || '').trim() || `Day ${dIdx + 1}`,
      exercises: (d.exercises || []).filter((ex) => ex && ex.name && ex.name.trim()),
    }))

    const payload = { templateName: templateName.trim(), templateDescription: templateDescription.trim(), goalTag, days: cleanedDays }
    try {
      if (initialData?._id) {
        await updateTemplate({ id: initialData._id, ...payload }).unwrap()
        toast.success('Workout template updated successfully!')
      } else {
        await createTemplate(payload).unwrap()
        toast.success('Workout template created successfully!')
      }
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save template')
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid var(--color-accent)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-bg-border)', paddingBottom: '0.75rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
          {initialData ? 'Edit Workout Template' : 'Create Workout Template'}
        </h3>
        <button type="button" className="btn btn-ghost" style={{ padding: '0.35rem' }} onClick={onClose}><X size={18} /></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div>
          <label className="label">Template Name *</label>
          <input className="input" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g. 4-Day Hypertrophy Split" required />
        </div>
        <div>
          <label className="label">Goal Category</label>
          <select className="input" value={goalTag} onChange={(e) => setGoalTag(e.target.value)}>
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="maintenance">Maintenance</option>
            <option value="lean_bulk">Lean Bulk</option>
            <option value="other">General Fitness</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">Template Description</label>
          <input className="input" value={templateDescription} onChange={(e) => setTemplateDescription(e.target.value)} placeholder="e.g. Best suited for intermediate lifters targeting 4 sessions a week" />
        </div>
      </div>

      {/* Days & Exercises */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {days.map((day, dIdx) => (
          <div key={dIdx} style={{ background: 'var(--color-bg-subtle, rgba(255,255,255,0.02))', border: '1px solid var(--color-bg-border)', padding: '0.85rem', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
                <input className="input" style={{ width: '140px', fontWeight: 600 }} value={day.dayName} onChange={(e) => updateDay(dIdx, 'dayName', e.target.value)} placeholder="Day Name" />
                <input className="input" style={{ flex: 1 }} value={day.focus || ''} onChange={(e) => updateDay(dIdx, 'focus', e.target.value)} placeholder="Focus area" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={!!day.isRestDay} onChange={(e) => updateDay(dIdx, 'isRestDay', e.target.checked)} /> Rest Day
                </label>
                <button type="button" className="btn btn-ghost" style={{ color: 'var(--color-danger)', padding: '0.35rem' }} onClick={() => removeDay(dIdx)}><Trash2 size={16} /></button>
              </div>
            </div>

            {!day.isRestDay && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(day.exercises || []).map((ex, eIdx) => (
                  <div key={eIdx} style={{ display: 'grid', gridTemplateColumns: '2fr 70px 80px 80px 1.5fr auto', gap: '0.4rem', alignItems: 'center' }}>
                    <input className="input" style={{ fontSize: '0.85rem' }} value={ex.name} onChange={(e) => updateExercise(dIdx, eIdx, 'name', e.target.value)} placeholder="Exercise Name" />
                    <input className="input" type="number" style={{ fontSize: '0.85rem' }} value={ex.sets} onChange={(e) => updateExercise(dIdx, eIdx, 'sets', Number(e.target.value) || 0)} placeholder="Sets" />
                    <input className="input" style={{ fontSize: '0.85rem' }} value={ex.reps} onChange={(e) => updateExercise(dIdx, eIdx, 'reps', e.target.value)} placeholder="Reps" />
                    <input className="input" type="number" style={{ fontSize: '0.85rem' }} value={ex.restSeconds} onChange={(e) => updateExercise(dIdx, eIdx, 'restSeconds', Number(e.target.value) || 0)} placeholder="Rest(s)" />
                    <input className="input" style={{ fontSize: '0.85rem' }} value={ex.notes || ''} onChange={(e) => updateExercise(dIdx, eIdx, 'notes', e.target.value)} placeholder="Notes" />
                    <button type="button" className="btn btn-ghost" style={{ color: 'var(--color-danger)', padding: '0.3rem' }} onClick={() => removeExercise(dIdx, eIdx)}><Trash2 size={14} /></button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', alignSelf: 'flex-start' }} onClick={() => addExercise(dIdx)}>
                  <Plus size={14} /> Add Exercise
                </button>
              </div>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={addDay}>
          <Plus size={16} /> Add Day
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--color-bg-border)', paddingTop: '0.75rem' }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? <Loader size={16} className="spin" /> : <Save size={16} />} Save Template
        </button>
      </div>
    </form>
  )
}

function DietTemplatesList() {
  const { data: res, isLoading } = useGetDietTemplatesQuery()
  const [deleteTemplate] = useDeleteDietTemplateMutation()
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const templates = res?.data || []

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete diet template "${name}"?`)) return
    try {
      await deleteTemplate(id).unwrap()
      toast.success('Diet template deleted')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete template')
    }
  }

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading diet templates...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => { setEditingTemplate(null); setIsCreating(true); }}>
          <Plus size={16} /> Create Diet Template
        </button>
      </div>

      {isCreating || editingTemplate ? (
        <DietTemplateForm
          initialData={editingTemplate}
          onClose={() => { setIsCreating(false); setEditingTemplate(null); }}
        />
      ) : null}

      {templates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          No diet templates created yet. Click "Create Diet Template" to add one.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {templates.map((tpl) => {
            const badge = goalBadges[tpl.goalTag || tpl.goal] || goalBadges.other
            const totalItems = (tpl.meals || []).reduce((acc, m) => acc + (m.items?.length || 0), 0)
            const isExpanded = expandedId === tpl._id

            return (
              <div key={tpl._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                      {tpl.templateName || tpl.name}
                    </h3>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: `${badge.color}20`,
                        color: badge.color,
                        border: `1px solid ${badge.color}40`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    {tpl.templateDescription || tpl.notes || 'No description provided.'}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center', background: 'var(--color-bg-subtle, rgba(255,255,255,0.03))', padding: '0.5rem', borderRadius: 8, marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                    <div>
                      <div style={{ color: 'var(--color-text-muted)' }}>Calories</div>
                      <div style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{tpl.dailyCalorieTarget || 0}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-text-muted)' }}>Protein</div>
                      <div style={{ fontWeight: 700 }}>{tpl.dailyProteinTarget || 0}g</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-text-muted)' }}>Carbs</div>
                      <div style={{ fontWeight: 700 }}>{tpl.dailyCarbsTarget || 0}g</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-text-muted)' }}>Fats</div>
                      <div style={{ fontWeight: 700 }}>{tpl.dailyFatsTarget || 0}g</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    <div>🥗 {tpl.meals?.length || 0} Meals</div>
                    <div>🍎 {totalItems} Food Items</div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--color-bg-border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                    {(tpl.meals || []).map((m, mIdx) => (
                      <div key={mIdx} style={{ background: 'var(--color-bg-subtle, rgba(255,255,255,0.02))', padding: '0.5rem', borderRadius: 6 }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {m.mealName} {m.time ? `(${m.time})` : ''}
                        </div>
                        <ul style={{ paddingLeft: '1.2rem', margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)' }}>
                          {(m.items || []).map((it, iIdx) => (
                            <li key={iIdx}>
                              {it.name} {it.quantity ? `— ${it.quantity}` : ''} ({it.calories} kcal)
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-bg-border)', paddingTop: '0.75rem' }}>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => setExpandedId(isExpanded ? null : tpl._id)}
                  >
                    {isExpanded ? <><ChevronUp size={14} /> Hide Preview</> : <><ChevronDown size={14} /> Preview Plan</>}
                  </button>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => setEditingTemplate(tpl)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-ghost" style={{ color: 'var(--color-danger)', padding: '0.4rem' }} onClick={() => handleDelete(tpl._id, tpl.templateName || tpl.name)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DietTemplateForm({ initialData, onClose }) {
  const [createTemplate, { isLoading: isCreating }] = useCreateDietTemplateMutation()
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateDietTemplateMutation()

  const [templateName, setTemplateName] = useState(initialData?.templateName || initialData?.name || '')
  const [templateDescription, setTemplateDescription] = useState(initialData?.templateDescription || initialData?.notes || '')
  const [goalTag, setGoalTag] = useState(initialData?.goalTag || initialData?.goal || 'maintenance')
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(initialData?.dailyCalorieTarget ?? 2000)
  const [dailyProteinTarget, setDailyProteinTarget] = useState(initialData?.dailyProteinTarget ?? 150)
  const [dailyCarbsTarget, setDailyCarbsTarget] = useState(initialData?.dailyCarbsTarget ?? 200)
  const [dailyFatsTarget, setDailyFatsTarget] = useState(initialData?.dailyFatsTarget ?? 60)
  const [meals, setMeals] = useState(
    initialData?.meals?.length
      ? initialData.meals
      : [{ mealName: 'Breakfast', time: '08:00 AM', notes: '', items: [{ name: 'Oatmeal & Milk', quantity: '1 bowl', calories: 350, protein: 12, carbs: 60, fats: 6 }] }]
  )

  const isSaving = isCreating || isUpdating

  const addMeal = () => {
    setMeals([...meals, { mealName: `Meal ${meals.length + 1}`, time: '08:00 AM', notes: '', items: [{ name: '', quantity: '', calories: 0, protein: 0, carbs: 0, fats: 0 }] }])
  }

  const removeMeal = (mIdx) => {
    if (meals.length === 1) return toast.error('Template must have at least 1 meal')
    setMeals(meals.filter((_, idx) => idx !== mIdx))
  }

  const updateMeal = (mIdx, field, val) => {
    setMeals(meals.map((m, idx) => (idx === mIdx ? { ...m, [field]: val } : m)))
  }

  const addFoodItem = (mIdx) => {
    setMeals(meals.map((m, idx) => (idx === mIdx ? { ...m, items: [...(m.items || []), { name: '', quantity: '', calories: 0, protein: 0, carbs: 0, fats: 0 }] } : m)))
  }

  const removeFoodItem = (mIdx, iIdx) => {
    setMeals(meals.map((m, idx) => (idx === mIdx ? { ...m, items: m.items.filter((_, i) => i !== iIdx) } : m)))
  }

  const updateFoodItem = (mIdx, iIdx, field, val) => {
    setMeals(
      meals.map((m, idx) =>
        idx === mIdx
          ? { ...m, items: m.items.map((it, i) => (i === iIdx ? { ...it, [field]: val } : it)) }
          : m
      )
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!templateName.trim()) return toast.error('Template name is required')

    const cleanedMeals = meals.map((m, mIdx) => ({
      ...m,
      mealName: (m.mealName || '').trim() || `Meal ${mIdx + 1}`,
      items: (m.items || []).filter((it) => it && it.name && it.name.trim()),
    }))

    const payload = {
      templateName: templateName.trim(),
      templateDescription: templateDescription.trim(),
      goalTag,
      dailyCalorieTarget: Number(dailyCalorieTarget) || 0,
      dailyProteinTarget: Number(dailyProteinTarget) || 0,
      dailyCarbsTarget: Number(dailyCarbsTarget) || 0,
      dailyFatsTarget: Number(dailyFatsTarget) || 0,
      meals: cleanedMeals,
      notes: templateDescription.trim(),
    }

    try {
      if (initialData?._id) {
        await updateTemplate({ id: initialData._id, ...payload }).unwrap()
        toast.success('Diet template updated successfully!')
      } else {
        await createTemplate(payload).unwrap()
        toast.success('Diet template created successfully!')
      }
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save template')
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid var(--color-accent)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-bg-border)', paddingBottom: '0.75rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
          {initialData ? 'Edit Diet Template' : 'Create Diet Template'}
        </h3>
        <button type="button" className="btn btn-ghost" style={{ padding: '0.35rem' }} onClick={onClose}><X size={18} /></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
          <label className="label">Template Name *</label>
          <input className="input" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g. High Protein Muscle Gain" required />
        </div>
        <div>
          <label className="label">Goal Category</label>
          <select className="input" value={goalTag} onChange={(e) => setGoalTag(e.target.value)}>
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="maintenance">Maintenance</option>
            <option value="lean_bulk">Lean Bulk</option>
            <option value="other">General Fitness</option>
          </select>
        </div>
        <div>
          <label className="label">Calorie Target (kcal)</label>
          <input className="input" type="number" value={dailyCalorieTarget} onChange={(e) => setDailyCalorieTarget(e.target.value)} placeholder="2000" />
        </div>
        <div>
          <label className="label">Protein Target (g)</label>
          <input className="input" type="number" value={dailyProteinTarget} onChange={(e) => setDailyProteinTarget(e.target.value)} placeholder="150" />
        </div>
        <div>
          <label className="label">Carbs Target (g)</label>
          <input className="input" type="number" value={dailyCarbsTarget} onChange={(e) => setDailyCarbsTarget(e.target.value)} placeholder="200" />
        </div>
        <div>
          <label className="label">Fats Target (g)</label>
          <input className="input" type="number" value={dailyFatsTarget} onChange={(e) => setDailyFatsTarget(e.target.value)} placeholder="60" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">Template Description / Guidelines</label>
          <input className="input" value={templateDescription} onChange={(e) => setTemplateDescription(e.target.value)} placeholder="e.g. Focus on clean protein sources, split into 4 balanced meals" />
        </div>
      </div>

      {/* Meals & Food Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {meals.map((meal, mIdx) => (
          <div key={mIdx} style={{ background: 'var(--color-bg-subtle, rgba(255,255,255,0.02))', border: '1px solid var(--color-bg-border)', padding: '0.85rem', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
                <input className="input" style={{ width: '140px', fontWeight: 600 }} value={meal.mealName} onChange={(e) => updateMeal(mIdx, 'mealName', e.target.value)} placeholder="Meal Name" />
                <input className="input" style={{ width: '120px' }} value={meal.time || ''} onChange={(e) => updateMeal(mIdx, 'time', e.target.value)} placeholder="Time" />
                <input className="input" style={{ flex: 1 }} value={meal.notes || ''} onChange={(e) => updateMeal(mIdx, 'notes', e.target.value)} placeholder="Notes" />
              </div>
              <button type="button" className="btn btn-ghost" style={{ color: 'var(--color-danger)', padding: '0.35rem' }} onClick={() => removeMeal(mIdx)}><Trash2 size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(meal.items || []).map((it, iIdx) => (
                <div key={iIdx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 70px 70px 70px 70px auto', gap: '0.4rem', alignItems: 'center' }}>
                  <input className="input" style={{ fontSize: '0.85rem' }} value={it.name} onChange={(e) => updateFoodItem(mIdx, iIdx, 'name', e.target.value)} placeholder="Food Item" />
                  <input className="input" style={{ fontSize: '0.85rem' }} value={it.quantity || ''} onChange={(e) => updateFoodItem(mIdx, iIdx, 'quantity', e.target.value)} placeholder="Qty" />
                  <input className="input" type="number" style={{ fontSize: '0.85rem' }} value={it.calories || 0} onChange={(e) => updateFoodItem(mIdx, iIdx, 'calories', Number(e.target.value) || 0)} placeholder="kcal" title="Calories" />
                  <input className="input" type="number" style={{ fontSize: '0.85rem' }} value={it.protein || 0} onChange={(e) => updateFoodItem(mIdx, iIdx, 'protein', Number(e.target.value) || 0)} placeholder="P(g)" title="Protein" />
                  <input className="input" type="number" style={{ fontSize: '0.85rem' }} value={it.carbs || 0} onChange={(e) => updateFoodItem(mIdx, iIdx, 'carbs', Number(e.target.value) || 0)} placeholder="C(g)" title="Carbs" />
                  <input className="input" type="number" style={{ fontSize: '0.85rem' }} value={it.fats || 0} onChange={(e) => updateFoodItem(mIdx, iIdx, 'fats', Number(e.target.value) || 0)} placeholder="F(g)" title="Fats" />
                  <button type="button" className="btn btn-ghost" style={{ color: 'var(--color-danger)', padding: '0.3rem' }} onClick={() => removeFoodItem(mIdx, iIdx)}><Trash2 size={14} /></button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', alignSelf: 'flex-start' }} onClick={() => addFoodItem(mIdx)}>
                <Plus size={14} /> Add Food Item
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={addMeal}>
          <Plus size={16} /> Add Meal
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--color-bg-border)', paddingTop: '0.75rem' }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? <Loader size={16} className="spin" /> : <Save size={16} />} Save Template
        </button>
      </div>
    </form>
  )
}
