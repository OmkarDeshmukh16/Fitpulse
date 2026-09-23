# AI Diet & Workout Assistant — integration notes

Built to match Fitpulse's existing conventions (`gymId` multi-tenancy on `req.user`,
`authenticate`/`authorize` middleware, RTK Query `apiSlice`). Drop the files into the
matching folders and wire up the four things below.

## 1. Server

```bash
cd app/server
npm install openai
```

Add to `app/server/.env`:
```
GROQ_API_KEY=gsk_...
```
Get a free key (no credit card) at https://console.groq.com/keys.

Copy in:
- `models/AIConversation.model.js`
- `services/ai.service.js`
- `controllers/ai.controller.js`
- `routes/ai.routes.js`

Register the route in `app/server/app.js` next to the others:
```js
const aiRoutes = require('./routes/ai.routes');
...
app.use('/api/ai', aiRoutes);
```

Note: `ai.controller.js` assumes a `member`-role `User` is linked to a `Member` doc via
`Member.userId` — that's the same link your `Member.model.js` already has for portal
logins. If your member portal auth works differently, adjust `getMemberRecord`.

## 2. Client

Copy in:
- `services/ai.api.js` → `app/client/src/services/`
- `components/AIPlanAssistant.jsx` → wherever your Diet Plan page's components live

Add `'AIConversation'` to the `tagTypes` array in `app/client/src/services/apiSlice.js`
(it's currently `['Member', 'Plan', 'Membership', 'Payment', 'Attendance', 'Settings', 'Dashboard']`).

## 3. Wire it into the Diet Plan tab

In whatever component renders the member's Diet Plan tab, render it alongside (or as a
second sub-tab next to) the existing calculator, passing the same inputs the calculator
already collects so the member isn't asked twice:

```jsx
<AIPlanAssistant
  initialProfile={{
    age: form.age,
    weightKg: form.weight,
    heightCm: form.height,
    gender: form.gender,
    activityLevel: form.activityLevel,
  }}
/>
```

## 4. What it does

- Member picks a goal + sends a first message ("lose fat, vegetarian, only dumbbells at
  home") → `POST /api/ai/conversations` starts a thread and Claude returns a plan.
- Follow-ups ("swap chicken for tofu", "make it 4 days not 5") → `POST
  /api/ai/conversations/:id/messages`. Claude re-calls its `propose_plan` tool only when
  it's actually changing the plan, so casual back-and-forth doesn't overwrite it with
  nothing.
- The plan lands in `currentPlan` on the conversation doc in the same shape every time,
  which is what the right-hand panel in `AIPlanAssistant.jsx` renders.

## Things worth deciding before this ships

- **Cost/abuse control**: nothing here rate-limits how many messages a member can send.
  Your global `express-rate-limit` on `/api/` will apply, but you may want a tighter
  per-member daily cap on `/api/ai/*` specifically, since each message is a paid API call.
- **No trainer review step**, per your call — members get plans instantly. If you
  change your mind later, the natural point to add it is: don't let the AI-set
  `currentPlan` become the member's *active* plan directly; instead add an "adopt this
  plan" action that copies it into whatever schema your admin-authored plans already use,
  and gate that action on trainer approval.
- **Model choice**: using Groq's free tier (`llama-3.3-70b-versatile`) — no cost, but a
  real ceiling: roughly 30 requests/minute and a daily cap in the low thousands (check
  current numbers at console.groq.com/settings/limits, they do change). Fine for a
  student project or early users; if you outgrow it, the `continueConversation` function
  signature is the same shape as the Claude version, so swapping back to a paid provider
  later is a small, contained change to `ai.service.js` only — nothing else in the stack
  needs to change.
- **Occasional malformed tool output**: free-tier open models are somewhat less reliable
  than Claude at strictly following the tool schema. The service already fails soft (logs
  nothing broken, just skips the plan update that turn) — if you see it happening a lot,
  tightening the tool description or lowering `max_tokens` usually helps.