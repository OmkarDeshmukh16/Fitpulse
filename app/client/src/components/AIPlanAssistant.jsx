import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, Loader2, Utensils, Dumbbell, RotateCcw } from 'lucide-react'
import {
  useGetActiveConversationQuery,
  useStartAIConversationMutation,
  useSendAIMessageMutation,
} from '../../services/ai.api'

const GOALS = [
  { value: 'weight_loss', label: 'Weight loss' },
  { value: 'muscle_gain', label: 'Muscle gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'general_fitness', label: 'General fitness' },
]

/**
 * Drop this into the member's Diet Plan / Workout Plan tab.
 * `initialProfile` should come from the same age/weight/height/gender/activityLevel
 * values the existing calculator form already collects, so the member doesn't
 * have to type them twice: { age, weightKg, heightCm, gender, activityLevel }
 */
export default function AIPlanAssistant({ initialProfile }) {
  const { data: activeConversation, isLoading: loadingActive } = useGetActiveConversationQuery()
  const [startConversation, { isLoading: starting }] = useStartAIConversationMutation()
  const [sendMessage, { isLoading: sending }] = useSendAIMessageMutation()

  const [goal, setGoal] = useState('general_fitness')
  const [profile, setProfile] = useState(
    initialProfile || { age: '', weightKg: '', heightCm: '', gender: 'male', activityLevel: 'moderate' }
  )
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)

  const conversation = activeConversation?.data
  const busy = starting || sending

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [conversation?.messages?.length])

  const handleStart = async () => {
    if (!draft.trim()) return
    await startConversation({ goal, profileSnapshot: profile, message: draft.trim() })
    setDraft('')
  }

  const handleSend = async () => {
    if (!draft.trim() || !conversation) return
    const text = draft.trim()
    setDraft('')
    await sendMessage({ id: conversation._id, message: text })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    conversation ? handleSend() : handleStart()
  }

  if (loadingActive) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="animate-spin" size={20} />
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      {/* Chat panel */}
      <div className="flex h-[520px] flex-col rounded-xl border bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Bot size={18} className="text-primary" />
          <span className="font-medium">AI Diet & Workout Assistant</span>
          {conversation && (
            <button
              type="button"
              onClick={() => window.location.reload() /* or lift a "start fresh" mutation call */}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              title="Start a new conversation"
            >
              <RotateCcw size={12} /> New chat
            </button>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {!conversation && (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Tell me your goal and anything I should know (diet restrictions, equipment you have, injuries), and I'll put together a plan you can adjust from here.</p>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGoal(g.value)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      goal === g.value ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {conversation?.messages?.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {busy && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="animate-spin" size={14} /> Thinking…
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={conversation ? 'Ask for a tweak, e.g. "swap chicken for tofu"' : "I want to lose fat, I'm vegetarian, gym 4x/week…"}
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Current plan panel */}
      <div className="space-y-4">
        {conversation?.currentPlan?.diet && (
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <Utensils size={16} className="text-primary" /> Diet
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Stat label="Calories" value={conversation.currentPlan.diet.dailyCalories} />
              <Stat label="Protein" value={`${conversation.currentPlan.diet.proteinGrams ?? '-'} g`} />
              <Stat label="Carbs" value={`${conversation.currentPlan.diet.carbsGrams ?? '-'} g`} />
              <Stat label="Fat" value={`${conversation.currentPlan.diet.fatGrams ?? '-'} g`} />
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {conversation.currentPlan.diet.meals?.map((meal, i) => (
                <li key={i}>
                  <span className="font-medium">{meal.name}</span>
                  <span className="text-muted-foreground"> — {meal.items?.join(', ')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {conversation?.currentPlan?.workout && (
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <Dumbbell size={16} className="text-primary" /> Workout
              <span className="ml-auto text-xs text-muted-foreground">
                {conversation.currentPlan.workout.daysPerWeek}x/week
              </span>
            </div>
            <div className="space-y-3 text-sm">
              {conversation.currentPlan.workout.schedule?.map((day, i) => (
                <div key={i}>
                  <div className="font-medium">
                    {day.day} — {day.focus}
                  </div>
                  <ul className="ml-4 list-disc text-muted-foreground">
                    {day.exercises?.map((ex, j) => (
                      <li key={j}>
                        {ex.name} {ex.sets && ex.reps ? `— ${ex.sets}x${ex.reps}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-muted px-2 py-1.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}
