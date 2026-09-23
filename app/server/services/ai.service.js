const OpenAI = require('openai');

// Groq's API is OpenAI-compatible, so the official `openai` SDK works as-is —
// just point it at Groq's base URL and use a Groq API key (free, no credit card:
// https://console.groq.com/keys).
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Free tier as of writing: ~30 requests/min, daily caps in the thousands depending
// on model. Llama 3.3 70B is the best-quality model currently on the free tier and
// supports tool calling. Check console.groq.com/settings/limits for current numbers.
const MODEL = 'llama-3.3-70b-versatile';

const PLAN_TOOL = {
  type: 'function',
  function: {
    name: 'propose_plan',
    description:
      "Call this whenever you are giving the member a concrete diet and/or workout plan (initial generation, or an update after they ask for a change like swapping a meal or changing workout days). Don't call it for pure conversation (e.g. answering a question) with no plan change.",
    parameters: {
      type: 'object',
      properties: {
        diet: {
          type: 'object',
          properties: {
            dailyCalories: { type: 'number' },
            proteinGrams: { type: 'number' },
            carbsGrams: { type: 'number' },
            fatGrams: { type: 'number' },
            fiberGrams: { type: 'number' },
            meals: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  items: { type: 'array', items: { type: 'string' } },
                  calories: { type: 'number' },
                },
                required: ['name', 'items'],
              },
            },
            notes: { type: 'string' },
          },
        },
        workout: {
          type: 'object',
          properties: {
            daysPerWeek: { type: 'number' },
            schedule: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string' },
                  focus: { type: 'string' },
                  exercises: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        sets: { type: 'number' },
                        reps: { type: 'string' },
                      },
                      required: ['name'],
                    },
                  },
                },
                required: ['day', 'focus', 'exercises'],
              },
            },
            notes: { type: 'string' },
          },
        },
      },
    },
  },
};

function buildSystemPrompt({ profileSnapshot, goal, medicalConditions }) {
  return `You are Fitpulse's in-app fitness and nutrition assistant, helping a gym member build a diet and workout plan.

Member profile:
- Age: ${profileSnapshot.age}
- Weight: ${profileSnapshot.weightKg} kg
- Height: ${profileSnapshot.heightCm} cm
- Gender: ${profileSnapshot.gender}
- Activity level: ${profileSnapshot.activityLevel}
- Goal: ${goal}
${medicalConditions ? `- Reported medical conditions: ${medicalConditions} — be conservative and suggest they confirm specifics with their doctor or trainer before starting.` : ''}

Guidelines:
- Keep daily calorie targets within safe, sustainable ranges for the stated goal — never suggest extreme deficits/surpluses.
- Be specific and practical (real foods, real exercises with sets/reps), not vague.
- When you give or update a concrete plan, call the propose_plan tool with the full current plan (not just the delta).
- For everything else — answering questions, clarifying preferences, acknowledging a request — just reply normally in plain text.
- You are not a doctor. For anything medical, recommend they check with their trainer or a physician.
- Keep replies conversational and concise; the structured plan goes in the tool call, not repeated in prose.`;
}

/**
 * Continue (or start) an AI plan conversation.
 * @param {object} params
 * @param {object} params.profileSnapshot - { age, weightKg, heightCm, gender, activityLevel }
 * @param {string} params.goal
 * @param {string} [params.medicalConditions]
 * @param {Array<{role: 'user'|'assistant', content: string}>} params.history - prior turns, oldest first
 * @param {string} params.userMessage - the new message from the member
 * @returns {Promise<{ assistantMessage: string, planUpdate: object|null }>}
 */
async function continueConversation({ profileSnapshot, goal, medicalConditions, history, userMessage }) {
  const messages = [
    { role: 'system', content: buildSystemPrompt({ profileSnapshot, goal, medicalConditions }) },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const response = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 1500,
    tools: [PLAN_TOOL],
    messages,
  });

  const choice = response.choices[0].message;
  let assistantMessage = choice.content || '';
  let planUpdate = null;

  const toolCall = choice.tool_calls?.find((t) => t.function.name === 'propose_plan');
  if (toolCall) {
    try {
      planUpdate = JSON.parse(toolCall.function.arguments);
    } catch {
      // Occasionally a free-tier model returns slightly malformed JSON — fail soft
      // rather than crashing the request; the member just won't see a plan update
      // this turn and can ask again.
      planUpdate = null;
    }
  }

  if (!assistantMessage) {
    assistantMessage = planUpdate
      ? "Here's your updated plan — check it out on the right."
      : "Sorry, I didn't quite catch that — could you rephrase?";
  }

  return { assistantMessage, planUpdate };
}

module.exports = { continueConversation };