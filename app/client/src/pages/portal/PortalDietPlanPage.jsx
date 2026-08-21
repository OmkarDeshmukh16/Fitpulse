import { motion } from 'framer-motion'
import { Apple, Flame, Beef, Wheat, Droplets, Calendar, Clock } from 'lucide-react'
import { useGetPortalDietPlanQuery } from '../../services/portal.api'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const goalLabels = {
  weight_loss: '🔥 Weight Loss',
  muscle_gain: '💪 Muscle Gain',
  maintenance: '⚖️ Maintenance',
  lean_bulk: '📈 Lean Bulk',
  other: 'Custom',
}

const mealColors = ['#10b981', '#f59e0b', '#6366f1', '#3b82f6', '#ef4444', '#8b5cf6']

export default function PortalDietPlanPage() {
  const { data, isLoading } = useGetPortalDietPlanQuery()
  const plan = data?.data

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
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Apple size={32} color="#10b981" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>No Diet Plan Assigned</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Ask your trainer to create a diet plan for you.</p>
      </div>
    )
  }

  // Calculate total macros from meals
  const totalCals = plan.meals?.reduce((s, m) => s + m.items.reduce((ss, it) => ss + (it.calories || 0), 0), 0) || 0
  const totalProtein = plan.meals?.reduce((s, m) => s + m.items.reduce((ss, it) => ss + (it.protein || 0), 0), 0) || 0
  const totalCarbs = plan.meals?.reduce((s, m) => s + m.items.reduce((ss, it) => ss + (it.carbs || 0), 0), 0) || 0
  const totalFats = plan.meals?.reduce((s, m) => s + m.items.reduce((ss, it) => ss + (it.fats || 0), 0), 0) || 0

  const macros = [
    { label: 'Calories', value: totalCals, target: plan.dailyCalorieTarget, unit: 'kcal', icon: Flame, color: '#ef4444' },
    { label: 'Protein', value: totalProtein, target: plan.dailyProteinTarget, unit: 'g', icon: Beef, color: '#10b981' },
    { label: 'Carbs', value: totalCarbs, target: plan.dailyCarbsTarget, unit: 'g', icon: Wheat, color: '#f59e0b' },
    { label: 'Fats', value: totalFats, target: plan.dailyFatsTarget, unit: 'g', icon: Droplets, color: '#6366f1' },
  ]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Plan Header */}
      <motion.div {...fadeUp} className="card" style={{
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.03))',
        border: '1px solid rgba(16,185,129,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Apple size={24} color="#10b981" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{plan.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <span style={{
                padding: '0.2rem 0.5rem', borderRadius: 99,
                background: 'rgba(16,185,129,0.1)', color: '#10b981',
                fontSize: '0.7rem', fontWeight: 600,
              }}>
                {goalLabels[plan.goal] || plan.goal}
              </span>
              {plan.trainerId && (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>by {plan.trainerId.name}</span>
              )}
            </div>
          </div>
        </div>
        {plan.notes && (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '0.75rem' }}>{plan.notes}</p>
        )}
      </motion.div>

      {/* Daily Macro Summary */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {macros.map((m, i) => {
          const pct = m.target > 0 ? Math.min((m.value / m.target) * 100, 100) : 0
          return (
            <motion.div key={m.label} {...fadeUp} transition={{ delay: 0.05 * (i + 2) }} className="card-sm" style={{ textAlign: 'center' }}>
              <m.icon size={20} color={m.color} style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {m.value}
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}> {m.unit}</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                {m.label}{m.target > 0 ? ` / ${m.target}${m.unit}` : ''}
              </div>
              {m.target > 0 && (
                <div style={{ width: '100%', height: 4, borderRadius: 99, background: 'var(--color-bg-border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: m.color, transition: 'width 0.5s ease' }} />
                </div>
              )}
            </motion.div>
          )
        })}
      </motion.div>

      {/* Meals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {plan.meals?.map((meal, mealIndex) => {
          const color = mealColors[mealIndex % mealColors.length]
          const mealCals = meal.items.reduce((s, it) => s + (it.calories || 0), 0)
          const mealProtein = meal.items.reduce((s, it) => s + (it.protein || 0), 0)

          return (
            <motion.div
              key={mealIndex}
              {...fadeUp}
              transition={{ delay: 0.05 * (mealIndex + 4) }}
              className="card"
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, transparent)` }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1rem' }}>
                      {mealIndex === 0 ? '🌅' : mealIndex === 1 ? '☀️' : mealIndex === 2 ? '🌙' : mealIndex === 3 ? '⚡' : '🍽️'}
                    </span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{meal.mealName}</h4>
                    {meal.time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        <Clock size={10} /> {meal.time}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{mealCals}</span> kcal · <span style={{ color: '#10b981' }}>{mealProtein}g protein</span>
                </div>
              </div>

              {/* Food Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {meal.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-bg-border)',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.name}</div>
                      {item.quantity && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{item.quantity}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, fontSize: '0.7rem' }}>
                      {item.calories > 0 && <span style={{ color: '#ef4444' }}>{item.calories} cal</span>}
                      {item.protein > 0 && <span style={{ color: '#10b981' }}>{item.protein}g P</span>}
                      {item.carbs > 0 && <span style={{ color: '#f59e0b' }}>{item.carbs}g C</span>}
                      {item.fats > 0 && <span style={{ color: '#6366f1' }}>{item.fats}g F</span>}
                    </div>
                  </div>
                ))}
              </div>

              {meal.notes && (
                <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-secondary)', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  💡 {meal.notes}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
