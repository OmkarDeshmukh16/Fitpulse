import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator, Flame, Beef, Wheat, Droplets, Apple, Save, Loader, Info, Sparkles, Utensils, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { calculateNutritionNeeds } from '../../utils/nutritionCalculator'
import { useGetBodyStatsQuery, useUpdateBodyStatsMutation } from '../../services/portal.api'
import { useGetDietTemplatesQuery, useSelectDietTemplateMutation } from '../../services/templates.api'

const activityOptions = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'light', label: 'Light (exercise 1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (exercise 3-5 days/week)' },
  { value: 'active', label: 'Active (exercise 6-7 days/week)' },
  { value: 'very_active', label: 'Very Active (intense exercise daily or physical job)' },
]

const goalOptions = [
  { value: 'weight_loss', label: 'Lose weight (-500 kcal)' },
  { value: 'muscle_gain', label: 'Build muscle (+300 kcal)' },
  { value: 'maintenance', label: 'Maintain (0 kcal)' },
  { value: 'lean_bulk', label: 'Lean bulk (+150 kcal)' },
  { value: 'other', label: 'Other (0 kcal)' },
]

export default function NutritionCalculator({ onSelectSuccess }) {
  const navigate = useNavigate()
  const { data: statsRes, isLoading: isFetchingStats } = useGetBodyStatsQuery()
  const [updateBodyStats, { isLoading: isSaving }] = useUpdateBodyStatsMutation()

  const [age, setAge] = useState(25)
  const [gender, setGender] = useState('male')
  const [weightKg, setWeightKg] = useState(70)
  const [heightCm, setHeightCm] = useState(175)
  const [activityLevel, setActivityLevel] = useState('moderate')
  const [goal, setGoal] = useState('maintenance')

  // Prefill form when saved stats exist
  useEffect(() => {
    if (statsRes?.data) {
      const s = statsRes.data
      if (s.age) setAge(s.age)
      if (s.gender) setGender(s.gender)
      if (s.weightKg) setWeightKg(s.weightKg)
      if (s.heightCm) setHeightCm(s.heightCm)
      if (s.activityLevel) setActivityLevel(s.activityLevel)
      if (s.goal) setGoal(s.goal)
    }
  }, [statsRes])

  // Live calculation using pure utility function
  const calcResponse = calculateNutritionNeeds({
    age,
    gender,
    weightKg,
    heightCm,
    activityLevel,
    goal,
  })

  const { isValid, errors, result } = calcResponse

  // Don't fetch templates until inputs are valid
  const { data: dietTemplatesRes, isLoading: isLoadingTemplates } = useGetDietTemplatesQuery(undefined, {
    skip: !isValid,
  })
  const [selectDietTemplate, { isLoading: isSelectingTemplate }] = useSelectDietTemplateMutation()
  const [selectingId, setSelectingId] = useState(null)

  const handleSave = async () => {
    if (!isValid) return toast.error('Please fix validation errors before saving.')
    try {
      await updateBodyStats({
        age: Number(age),
        gender,
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
        activityLevel,
        goal,
      }).unwrap()
      toast.success('Body stats saved successfully!')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save body stats.')
    }
  }

  const handleSelectPlan = async (templateId, templateName) => {
    setSelectingId(templateId)
    try {
      await selectDietTemplate(templateId).unwrap()
      toast.success(`"${templateName}" is now your active diet plan!`)
      if (onSelectSuccess) {
        onSelectSuccess()
      } else {
        navigate('/portal/diet-plan')
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to select diet plan')
    } finally {
      setSelectingId(null)
    }
  }

  // Filter & sort suggested templates
  const allTemplates = dietTemplatesRes?.data || []
  const suggestedTemplates = isValid && result
    ? allTemplates
        .filter((tpl) => {
          const tplGoal = tpl.goalTag || tpl.goal
          const matchesGoal = tplGoal === goal
          const targetCals = tpl.dailyCalorieTarget || 0
          const matchesCalorieRange = Math.abs(targetCals - result.calories) <= 150
          return matchesGoal && matchesCalorieRange
        })
        .sort((a, b) => Math.abs((a.dailyCalorieTarget || 0) - result.calories) - Math.abs((b.dailyCalorieTarget || 0) - result.calories))
        .slice(0, 3)
    : []

  if (isFetchingStats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader className="spin" size={24} color="#10b981" />
      </div>
    )
  }

  return (
    <div
      className="card"
      style={{
        background: 'var(--color-bg-card, #12161f)',
        border: '1px solid var(--color-bg-border, rgba(255,255,255,0.08))',
        borderRadius: 16,
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Component Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(16,185,129,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calculator size={22} color="#10b981" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Nutrition & Calorie Estimator
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Calculate estimated daily energy, macro, and hydration needs based on your body stats and fitness goal.
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!isValid || isSaving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          {isSaving ? <Loader size={16} className="spin" /> : <Save size={16} />} Save My Stats
        </button>
      </div>

      {/* Input Form */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          background: 'var(--color-bg-subtle, rgba(255,255,255,0.02))',
          padding: '1rem',
          borderRadius: 12,
          border: '1px solid var(--color-bg-border, rgba(255,255,255,0.05))',
        }}
      >
        {/* Age */}
        <div>
          <label className="label" style={{ fontSize: '0.8rem', marginBottom: '0.35rem', display: 'block' }}>
            Age (years)
          </label>
          <input
            type="number"
            className="input"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="10-100"
            style={{ width: '100%', fontSize: '0.85rem' }}
          />
          {errors.age && (
            <span style={{ fontSize: '0.725rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
              {errors.age}
            </span>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="label" style={{ fontSize: '0.8rem', marginBottom: '0.35rem', display: 'block' }}>
            Gender
          </label>
          <select
            className="input"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && (
            <span style={{ fontSize: '0.725rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
              {errors.gender}
            </span>
          )}
        </div>

        {/* Weight */}
        <div>
          <label className="label" style={{ fontSize: '0.8rem', marginBottom: '0.35rem', display: 'block' }}>
            Weight (kg)
          </label>
          <input
            type="number"
            className="input"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="20-300"
            style={{ width: '100%', fontSize: '0.85rem' }}
          />
          {errors.weightKg && (
            <span style={{ fontSize: '0.725rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
              {errors.weightKg}
            </span>
          )}
        </div>

        {/* Height */}
        <div>
          <label className="label" style={{ fontSize: '0.8rem', marginBottom: '0.35rem', display: 'block' }}>
            Height (cm)
          </label>
          <input
            type="number"
            className="input"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="100-250"
            style={{ width: '100%', fontSize: '0.85rem' }}
          />
          {errors.heightCm && (
            <span style={{ fontSize: '0.725rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
              {errors.heightCm}
            </span>
          )}
        </div>

        {/* Activity Level */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label" style={{ fontSize: '0.8rem', marginBottom: '0.35rem', display: 'block' }}>
            Daily Activity Level
          </label>
          <select
            className="input"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            {activityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.activityLevel && (
            <span style={{ fontSize: '0.725rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
              {errors.activityLevel}
            </span>
          )}
        </div>

        {/* Fitness Goal */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label" style={{ fontSize: '0.8rem', marginBottom: '0.35rem', display: 'block' }}>
            Fitness Goal
          </label>
          <select
            className="input"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            {goalOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Display */}
      {isValid && result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Estimated Daily Needs ({goalOptions.find(g => g.value === goal)?.label.split(' ')[0]} Target):
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {/* Calories Card */}
              <div className="card-sm" style={{ textAlign: 'center', padding: '0.85rem 0.5rem' }}>
                <Flame size={20} color="#ef4444" style={{ marginBottom: '0.35rem' }} />
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {result.calories}
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}> kcal</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Target Calories</div>
                {result.maintenanceCalories !== result.calories && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    Maint: {result.maintenanceCalories} kcal
                  </div>
                )}
              </div>

              {/* Protein Card */}
              <div className="card-sm" style={{ textAlign: 'center', padding: '0.85rem 0.5rem' }}>
                <Beef size={20} color="#10b981" style={{ marginBottom: '0.35rem' }} />
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {result.proteinG}
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}> g</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Protein</div>
              </div>

              {/* Carbs Card */}
              <div className="card-sm" style={{ textAlign: 'center', padding: '0.85rem 0.5rem' }}>
                <Wheat size={20} color="#f59e0b" style={{ marginBottom: '0.35rem' }} />
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {result.carbsG}
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}> g</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Carbohydrates</div>
              </div>

              {/* Fat Card */}
              <div className="card-sm" style={{ textAlign: 'center', padding: '0.85rem 0.5rem' }}>
                <Droplets size={20} color="#6366f1" style={{ marginBottom: '0.35rem' }} />
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {result.fatG}
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}> g</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Healthy Fats</div>
              </div>

              {/* Fibre Card */}
              <div className="card-sm" style={{ textAlign: 'center', padding: '0.85rem 0.5rem' }}>
                <Apple size={20} color="#8b5cf6" style={{ marginBottom: '0.35rem' }} />
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {result.fibreG}
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}> g</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Dietary Fibre</div>
              </div>

              {/* Water Card */}
              <div className="card-sm" style={{ textAlign: 'center', padding: '0.85rem 0.5rem' }}>
                <Droplets size={20} color="#3b82f6" style={{ marginBottom: '0.35rem' }} />
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {(result.waterMl / 1000).toFixed(1)}
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}> L</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Daily Water</div>
              </div>
            </div>
          </div>

          {/* Suggested Plans For You Section */}
          <div
            style={{
              borderTop: '1px solid var(--color-bg-border, rgba(255,255,255,0.08))',
              paddingTop: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} color="#10b981" /> Suggested Plans For You
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Target: {result.calories} kcal (±150 kcal match)
              </span>
            </div>

            {isLoadingTemplates ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <Loader size={16} className="spin" color="#10b981" /> Finding matching diet templates...
              </div>
            ) : suggestedTemplates.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                {suggestedTemplates.map((tpl) => {
                  const isCurrentSelecting = isSelectingTemplate && selectingId === tpl._id
                  return (
                    <div
                      key={tpl._id}
                      style={{
                        background: 'var(--color-bg-secondary, rgba(255,255,255,0.03))',
                        border: '1px solid var(--color-bg-border, rgba(255,255,255,0.08))',
                        borderRadius: 12,
                        padding: '0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                          {tpl.templateName || tpl.name}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          <span style={{ color: 'var(--color-accent, #10b981)', fontWeight: 600 }}>{tpl.dailyCalorieTarget || 0} kcal</span>
                          <span>·</span>
                          <span>{tpl.dailyProteinTarget || 0}g protein</span>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary"
                        onClick={() => handleSelectPlan(tpl._id, tpl.templateName || tpl.name)}
                        disabled={isSelectingTemplate}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        {isCurrentSelecting ? <Loader size={14} className="spin" /> : <Utensils size={14} />} Use This Plan
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--color-bg-subtle, rgba(255,255,255,0.02))',
                  padding: '1rem',
                  borderRadius: 12,
                  border: '1px solid var(--color-bg-border, rgba(255,255,255,0.05))',
                  textAlign: 'center',
                }}
              >
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  No exact match yet — browse the full library
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/portal/templates?goal=${goal}`)}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  Browse Full Diet Library <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Please correct the input errors above to view estimated daily needs.
        </div>
      )}

      {/* Informational Disclaimer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          borderTop: '1px solid var(--color-bg-border, rgba(255,255,255,0.05))',
          paddingTop: '0.75rem',
        }}
      >
        <Info size={14} style={{ flexShrink: 0 }} />
        <span>
          Note: These values represent estimated daily needs based on Mifflin-St Jeor nutritional formulas and are provided for informational guidance only.
        </span>
      </div>
    </div>
  )
}
