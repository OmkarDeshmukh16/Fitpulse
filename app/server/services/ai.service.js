const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Cost-effective, fast model — good fit for a member-facing chat feature at scale.
// Bump to 'claude-sonnet-5' if you want noticeably higher-quality plans and don't
// mind the higher per-token cost.
const MODEL = 'claude-haiku-4-5-20251001';

const PLAN_TOOL = {
  name: 'propose_plan',
  description:
    "Call this whenever you are giving the member a concrete diet and/or workout plan (initial generation, or an update after they ask for a change like swapping a meal or changing workout days). Don't call it for pure conversation (e.g. answering a question) with no plan change.",
  input_schema: {
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
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: buildSystemPrompt({ profileSnapshot, goal, medicalConditions }),
    tools: [PLAN_TOOL],
    messages,
  });

  let assistantMessage = '';
  let planUpdate = null;

  for (const block of response.content) {
    if (block.type === 'text') {
      assistantMessage += block.text;
    } else if (block.type === 'tool_use' && block.name === 'propose_plan') {
      planUpdate = block.input;
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
