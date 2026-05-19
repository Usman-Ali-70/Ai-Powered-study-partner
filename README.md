# StudyMind AI 🧠

> Your AI-powered academic companion

## Problem

Students struggle to study efficiently — re-reading notes passively, cramming before exams, and lacking personalized feedback.

## Solution

StudyMind AI transforms your lecture notes into an interactive study experience: chat with your notes, generate targeted quizzes, create AI flashcards with spaced repetition, and get a personalized study plan.

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + Turbopack, TypeScript, Tailwind CSS v4, Framer Motion
- **3D / Landing animation:** Three.js (custom particle-sphere shader)
- **Backend:** Next.js API Routes, Supabase (PostgreSQL + Storage)
- **AI:** Google Gemini (`gemini-1.5-pro`)
- **Auth:** Supabase Auth (Email/Password + Google OAuth)
- **State:** Zustand
- **Charts:** Recharts
- **PDF Processing:** pdf-parse

> Swapping the AI provider — every AI call is centralised in `lib/gemini.ts` and `lib/prompts/*`. To switch to another LLM (e.g. Claude/OpenAI), replace `lib/gemini.ts` with a client of your choice and call it the same way from the API routes.

## AI Features

1. **Notes Chat** — Streaming AI tutor that answers questions strictly from your uploaded notes
2. **Quiz Generator** — Generates MCQ / True-False / Short-Answer quizzes with difficulty and topic control
3. **Flashcard Generator** — Extracts key concepts into a deck of flashcards
4. **Study Planner** — Builds a date-aware, deadline-prioritised day-by-day plan
5. **Weak Area Analysis** — Analyses wrong answers and surfaces recommended focus areas
6. **Auto Summarization** — Produces a structured summary of every uploaded PDF/note

## Product Features

- 📄 PDF upload — text extraction + AI summary saved to your library
- 💬 Chat with your notes (streaming responses)
- 🧠 Configurable quiz generation, timed session, keyboard-driven UX
- 🃏 3D flip flashcards with SM-2 spaced repetition (Anki algorithm)
- 📅 AI-generated weekly study planner with drag-friendly task cards
- 📊 Analytics — score trend chart, study hours bar chart, 30-day activity heatmap, streak counter
- 🔐 Supabase Auth (email + Google OAuth) with RLS-secured rows
- 🌌 Animated Three.js particle-sphere hero on the landing page
- 📱 Fully responsive — desktop sidebar + mobile bottom-nav

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in your keys
npm run dev
```

Open `http://localhost:3000`.

### Environment variables (`.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server only) |
| `GEMINI_API_KEY` | Google Gemini API key |

## Database

Run [`supabase/schema.sql`](supabase/schema.sql) once in the Supabase SQL editor. It creates:

- 5 tables — `notes`, `quizzes`, `flashcard_decks`, `flashcards`, `study_tasks`
- Row-Level Security policies so every user can only read/write their own rows
- A service-role bypass policy so server API routes can run privileged inserts
- The `notes` storage bucket for PDF uploads
- Indexes on `user_id`, `next_review`, and `(user_id, study_date)` for hot queries

### Auth setup (Google OAuth)

In your Supabase dashboard → **Authentication → Providers → Google**, paste your Google OAuth Client ID/Secret and add `http://localhost:3000/auth/callback` (and your prod domain) to the redirect URL allow-list.

## Architecture notes

- **Auth flow:** the client uses `supabase.auth.signInWithPassword` / `signInWithOAuth`. The dashboard layout (`app/(dashboard)/layout.tsx`) checks `auth.getSession()` on mount and redirects to `/login` if missing.
- **API auth:** mutating API routes call `getUserIdFromRequest(req)` (in `lib/supabase/server.ts`), which reads the user's Supabase JWT from the `Authorization: Bearer ...` header. Client code uses `authedFetch()` (`lib/api.ts`) which attaches the token automatically.
- **DB writes:** server routes use the service-role key, but every insert is scoped with the JWT-derived `user_id`, so RLS still effectively contains each user.
- **AI prompts** live in `lib/prompts/*.ts` and return JSON in the structures the UI consumes.
- **SM-2 spaced repetition:** implemented in `lib/utils.ts` (`sm2()`). Each rating updates `ease_factor`, `interval`, `repetitions`, and `next_review` on the flashcard row.

## Scripts

```bash
npm run dev     # start dev server (Turbopack)
npm run build   # production build
npm run start   # serve production build
npm run lint    # eslint
```

## License

MIT

---

**StudyMind AI** — Your AI-powered study companion
