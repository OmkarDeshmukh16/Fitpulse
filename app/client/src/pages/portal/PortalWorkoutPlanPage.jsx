import { motion } from 'framer-motion'
import { Dumbbell, Clock, RotateCcw, AlertCircle, Calendar } from 'lucide-react'
import { useGetPortalWorkoutPlanQuery } from '../../services/portal.api'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const dayColors = ['#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899']

export default function PortalWorkoutPlanPage() {
  const { data, isLoading } = useGetPortalWorkoutPlanQuery()
  const plan = data?.data

  const todayIndex = new Date().getDay() // 0=Sun
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayName = dayNames[todayIndex]

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spin" style={{ width: 32, height: 32, border: '3px solid var(--color-bg-border)', borderTopColor: '#10b981', borderRadius: '50%' }} />
      </div>
    )
  }

  if (!plan) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Dumbbell size={32} color="#6366f1" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>No Workout Plan Assigned</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Ask your trainer to create a workout plan for you.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Plan Header */}
      <motion.div {...fadeUp} className="card" style={{
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(79,70,229,0.03))',
        border: '1px solid rgba(99,102,241,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dumbbell size={24} color="#6366f1" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{plan.name}</h2>
            {plan.trainerId && (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>by {plan.trainerId.name}</p>
            )}
          </div>
        </div>
        {plan.description && (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.75rem' }}>{plan.description}</p>
        )}
        {plan.startDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            <Calendar size={14} />
            Started {new Date(plan.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}
      </motion.div>

      {/* Day Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {plan.days?.map((day, dayIndex) => {
          const isToday = day.dayName?.toLowerCase() === todayName.toLowerCase()
          const color = dayColors[dayIndex % dayColors.length]

          return (
            <motion.div
              key={dayIndex}
              {...fadeUp}
              transition={{ delay: 0.05 * dayIndex }}
              className="card"
              style={{
                border: isToday ? `1px solid ${color}` : '1px solid var(--color-bg-border)',
                boxShadow: isToday ? `0 0 20px ${color}25` : 'var(--shadow-card)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, transparent)` }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: day.isRestDay ? 0 : '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color }}>{dayIndex + 1}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{day.dayName}</h4>
                    {day.focus && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{day.focus}</span>}
                  </div>
                </div>
                {isToday && (
                  <span style={{
                    padding: '0.2rem 0.6rem', borderRadius: 99,
                    background: `${color}20`, color,
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    Today
                  </span>
                )}
                {day.isRestDay && (
                  <span style={{
                    padding: '0.2rem 0.6rem', borderRadius: 99,
                    background: 'rgba(148,163,184,0.1)', color: 'var(--color-text-muted)',
                    fontSize: '0.7rem', fontWeight: 600,
                  }}>
                    🛌 Rest Day
                  </span>
                )}
              </div>

              {/* Exercises */}
              {!day.isRestDay && day.exercises?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {day.exercises.map((ex, exIndex) => (
                    <div
                      key={exIndex}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-bg-border)',
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700, color, flexShrink: 0,
                      }}>
                        {exIndex + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{ex.name}</div>
                        {ex.notes && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>{ex.notes}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                        {ex.sets && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{ex.sets}</div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Sets</div>
                          </div>
                        )}
                        {ex.reps && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{ex.reps}</div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Reps</div>
                          </div>
                        )}
                        {ex.duration && (
                          <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} color="var(--color-text-muted)" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{ex.duration}</span>
                          </div>
                        )}
                        {ex.restSeconds > 0 && (
                          <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <RotateCcw size={12} color="var(--color-text-muted)" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{ex.restSeconds}s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
