import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dumbbell,
  Utensils,
  Sparkles,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader,
  BookOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  useGetWorkoutTemplatesQuery,
  useSelectWorkoutTemplateMutation,
  useGetDietTemplatesQuery,
  useSelectDietTemplateMutation,
} from '../../services/templates.api'

const goalFilterOptions = [
  { value: 'all', label: 'All Goals' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'lean_bulk', label: 'Lean Bulk' },
  { value: 'other', label: 'General Fitness' },
]

const goalBadges = {
  weight_loss: { label: 'Weight Loss', color: '#ef4444' },
  muscle_gain: { label: 'Muscle Gain', color: '#3b82f6' },
  maintenance: { label: 'Maintenance', color: '#10b981' },
  lean_bulk: { label: 'Lean Bulk', color: '#8b5cf6' },
  other: { label: 'General Fitness', color: '#6b7280' },
}

export default function PortalTemplateLibraryPage() {
  const [searchParams] = useSearchParams()
  const goalParam = searchParams.get('goal')

  const [activeTab, setActiveTab] = useState(goalParam ? 'diet' : 'workout')
  const [selectedGoal, setSelectedGoal] = useState(goalParam || 'all')

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen color="var(--color-accent)" size={24} /> Template Library
          </h1>
          <p className="page-subtitle">
            Browse plans designed by certified trainers and choose one to activate for your fitness journey.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-bg-border)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'workout' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('workout')}
        >
          <Dumbbell size={16} /> Workout Plans
        </button>
        <button
          className={`btn ${activeTab === 'diet' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('diet')}
        >
          <Utensils size={16} /> Diet Plans
        </button>
      </div>

      {/* Goal Filter Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
          Filter Goal:
        </span>
        {goalFilterOptions.map((opt) => {
          const isSelected = selectedGoal === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setSelectedGoal(opt.value)}
              className="btn btn-ghost"
              style={{
                borderRadius: '20px',
                padding: '0.3rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 500,
                background: isSelected ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                color: isSelected ? '#fff' : 'var(--color-text-muted)',
                border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-bg-border)'}`,
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeTab === 'workout' && <MemberWorkoutTemplates selectedGoal={selectedGoal} />}
      {activeTab === 'diet' && <MemberDietTemplates selectedGoal={selectedGoal} />}
    </div>
  )
}

function MemberWorkoutTemplates({ selectedGoal }) {
  const navigate = useNavigate()
  const { data: res, isLoading } = useGetWorkoutTemplatesQuery()
  const [selectWorkoutTemplate, { isLoading: isSelecting }] = useSelectWorkoutTemplateMutation()
  const [expandedId, setExpandedId] = useState(null)
  const [selectingId, setSelectingId] = useState(null)

  const templates = (res?.data || []).filter((t) => {
    if (selectedGoal === 'all') return true
    return t.goalTag === selectedGoal
  })

  const handleSelectPlan = async (id, name) => {
    setSelectingId(id)
    try {
      await selectWorkoutTemplate(id).unwrap()
      toast.success(`"${name}" is now your active workout plan!`)
      navigate('/portal/workout-plan')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to select workout plan')
    } finally {
      setSelectingId(null)
    }
  }

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading workout templates...</div>
  }

  if (templates.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
        No workout templates found for the selected goal filter.
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
      {templates.map((tpl) => {
        const badge = goalBadges[tpl.goalTag] || goalBadges.other
        const totalExercises = (tpl.days || []).reduce((acc, d) => acc + (d.exercises?.length || 0), 0)
        const isExpanded = expandedId === tpl._id
        const isCurrentSelecting = isSelecting && selectingId === tpl._id

        return (
          <div
            key={tpl._id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              gap: '1rem',
              border: '1px solid var(--color-bg-border)',
              transition: 'border-color 0.2s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                  {tpl.templateName || tpl.name}
                </h3>
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
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

              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                {tpl.templateDescription || tpl.description || 'Custom workout split created by gym trainers.'}
              </p>

              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600, borderTop: '1px solid var(--color-bg-border)', paddingTop: '0.5rem' }}>
                <div>🗓️ {tpl.days?.length || 0} Days / week</div>
                <div>🏋️ {totalExercises} Exercises</div>
              </div>
            </div>

            {isExpanded && (
              <div style={{ borderTop: '1px solid var(--color-bg-border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                {(tpl.days || []).map((d, dIdx) => (
                  <div key={dIdx} style={{ background: 'var(--color-bg-subtle, rgba(255,255,255,0.02))', padding: '0.5rem 0.75rem', borderRadius: 6 }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {d.dayName} {d.focus ? `— ${d.focus}` : ''} {d.isRestDay ? '(Rest Day)' : ''}
                    </div>
                    {!d.isRestDay && (
                      <ul style={{ paddingLeft: '1.2rem', margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)' }}>
                        {(d.exercises || []).map((ex, eIdx) => (
                          <li key={eIdx}>
                            {ex.name} ({ex.sets} sets × {ex.reps})
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
                {isExpanded ? <><ChevronUp size={14} /> Hide Schedule</> : <><ChevronDown size={14} /> View Schedule</>}
              </button>

              <button
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                disabled={isSelecting}
                onClick={() => handleSelectPlan(tpl._id, tpl.templateName || tpl.name)}
              >
                {isCurrentSelecting ? <Loader size={15} className="spin" /> : <Sparkles size={15} />} Use This Plan
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MemberDietTemplates({ selectedGoal }) {
  const navigate = useNavigate()
  const { data: res, isLoading } = useGetDietTemplatesQuery()
  const [selectDietTemplate, { isLoading: isSelecting }] = useSelectDietTemplateMutation()
  const [expandedId, setExpandedId] = useState(null)
  const [selectingId, setSelectingId] = useState(null)

  const templates = (res?.data || []).filter((t) => {
    if (selectedGoal === 'all') return true
    return (t.goalTag || t.goal) === selectedGoal
  })

  const handleSelectPlan = async (id, name) => {
    setSelectingId(id)
    try {
      await selectDietTemplate(id).unwrap()
      toast.success(`"${name}" is now your active diet plan!`)
      navigate('/portal/diet-plan')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to select diet plan')
    } finally {
      setSelectingId(null)
    }
  }

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading diet templates...</div>
  }

  if (templates.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
        No diet templates found for the selected goal filter.
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
      {templates.map((tpl) => {
        const badge = goalBadges[tpl.goalTag || tpl.goal] || goalBadges.other
        const totalItems = (tpl.meals || []).reduce((acc, m) => acc + (m.items?.length || 0), 0)
        const isExpanded = expandedId === tpl._id
        const isCurrentSelecting = isSelecting && selectingId === tpl._id

        return (
          <div
            key={tpl._id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              gap: '1rem',
              border: '1px solid var(--color-bg-border)',
              transition: 'border-color 0.2s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                  {tpl.templateName || tpl.name}
                </h3>
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
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

              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                {tpl.templateDescription || tpl.notes || 'Nutritional plan tailored for optimal body composition.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center', background: 'var(--color-bg-subtle, rgba(255,255,255,0.03))', padding: '0.5rem', borderRadius: 8, marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                <div>
                  <div style={{ color: 'var(--color-text-muted)' }}>Target</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{tpl.dailyCalorieTarget || 0} kcal</div>
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

              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                <div>🥗 {tpl.meals?.length || 0} Meals</div>
                <div>🍎 {totalItems} Food Items</div>
              </div>
            </div>

            {isExpanded && (
              <div style={{ borderTop: '1px solid var(--color-bg-border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                {(tpl.meals || []).map((m, mIdx) => (
                  <div key={mIdx} style={{ background: 'var(--color-bg-subtle, rgba(255,255,255,0.02))', padding: '0.5rem 0.75rem', borderRadius: 6 }}>
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
                {isExpanded ? <><ChevronUp size={14} /> Hide Meals</> : <><ChevronDown size={14} /> View Meals</>}
              </button>

              <button
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                disabled={isSelecting}
                onClick={() => handleSelectPlan(tpl._id, tpl.templateName || tpl.name)}
              >
                {isCurrentSelecting ? <Loader size={15} className="spin" /> : <Sparkles size={15} />} Use This Plan
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
