# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

InterPrep is a Next.js 15 (App Router) app for AI-driven job interviews: a recruiter generates interview questions with an LLM, shares a link, and a candidate does a live voice interview with an AI interviewer (Vapi). After the call, the transcript is scored by an LLM and the feedback is stored for the recruiter. It is a diploma (thesis) project. The UI and code comments are mostly in **Bosnian**: route names (`kreiraj-interview`, `zakazani-interviewi`, `svi-interviewi`, `postavke`, `zavrseno`) and user-facing strings. Keep new UI text and naming consistent with that.

Plain JavaScript/JSX (no TypeScript sources, even though TS is a devDependency). The path alias `@/*` maps to the project root (`jsconfig.json`).

## Commands

```bash
npm run dev     # dev server on http://localhost:3000
npm run build
npm run start
npm run lint    # next lint
```

There is no test suite. `npm run lint` has no ESLint config yet (it prompts interactively), so use `npm run build` to verify changes.

## Repository layout note

This `interprep/` directory is its own git repo, nested inside a parent repo (`interprep_diplomski/`) that tracks it as a gitlink. The parent also has a stray `package.json`/`node_modules` with a few deps; its lockfile makes Next.js warn about the workspace root. Run all npm commands from `interprep/`.

## Environment (`.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the Supabase client (`services/supabaseClient.js`)
- `OPENROUTER_API_KEY`, `NEXT_PUBLIC_SITE_URL`: question generation (`/api/ai-model`)
- `OPENAI_API_KEY`: feedback scoring (`/api/ai-feedback`). **Not currently present in `.env.local`**, so that route returns 500 until it is added.
- `NEXT_PUBLIC_VAPI_PUBLIC_KEY`: the Vapi web SDK for the voice interview. Azure transcription (bs-BA) and 11labs must be enabled in the Vapi account
- `GOOGLE_GENERATIVE_AI_API_KEY`: defined but not used by current code

## Architecture

**Data layer.** There is no backend beyond two API routes. All DB access and auth go directly from client components through the single anon Supabase client in `services/supabaseClient.js`. Supabase tables:
- `Users`: `name`, `email`, `picture`, `credits`. Rows are created lazily in `app/provider.jsx` on first load if no row matches the auth user's email.
- `Interviews`: `interview_id` (a client-generated UUID, unique), `userEmail`, `jobPosition`, `jobDescription`, `duration`, `type` (comma-joined string), `questionList` (JSON), `lang`.
- `interview-feedback`: `interview_id`, `userName`, `userEmail`, `feedback` (JSON), `recommended`.

**Context.**
- `UserDetailContext` is provided by the root `app/provider.jsx`; use the `useUser()` hook exported from there. The provider also acts as the auth guard: if there is no Supabase user, the `(main)` routes (`/dashboard`, `/postavke`, `/svi-interviewi`, `/zakazani-interviewi`) redirect to `/auth`. The candidate routes `/interview/*` stay public.
- `InterviewDataContext` (`interviewInfo`) is provided by `app/interview/layout.jsx` and shared between the candidate join page and the start page. If `/start` is opened without it (for example after a refresh), the page redirects back to the join page.

**Route groups.**
- `app/(main)/`: the recruiter dashboard, wrapped in the shadcn `SidebarProvider` with `AppSidebar` (`app/(main)/provider.js`). Sidebar entries live in `services/Constants.js` (`SideBarOptions`). Interview lists use the shared `dashboard/_components/InterviewGrid.jsx`, which handles the loading skeleton, the empty state and the grid.
- `app/interview/[interview_id]/`: the candidate flow. The join page loads the interview and sets `interviewInfo`. `start/` runs the Vapi call. `zavrseno/` is the "finished" page.
- `app/auth/`: Supabase auth (Google OAuth, email and password, password reset).

**AI flow.**
1. Question generation: `kreiraj-interview/_components/QuestionList.jsx` builds a prompt with `buildQuestionsPrompt()` from `services/Constants.js` and POSTs it to `app/api/ai-model/route.jsx`. That route calls OpenRouter (it tries `google/gemini-flash-1.5`, then `openai/gpt-4o-mini`). It always returns `{ content: "```json\n{...}\n```" }`, a fenced JSON string containing `interviewQuestions`, and falls back to hard-coded questions if the model fails. The client strips the fences and parses the JSON. Both the server and the client have fallback question lists.
2. Voice interview: `app/interview/[interview_id]/start/page.jsx` creates one `Vapi` instance in a ref. The inline assistant config is in Bosnian: an Azure `bs-BA` transcriber, 11labs `eleven_multilingual_v2` for the voice, and `gpt-4o`. Vapi listeners are registered once, so they read `interviewInfoRef` rather than state. On `call-end`, or on a manual stop with a timeout fallback, `finalizeOnce()` runs exactly once, guarded by `finalizedRef`.
3. Feedback: `finalizeOnce()` POSTs the conversation to `app/api/ai-feedback/route.jsx` (OpenAI SDK, `gpt-4o-mini`). It stores the parsed JSON `{ rating, summary, recommendation, recommendationMsg, transcript }` in `interview-feedback.feedback`. Older rows nest this one level deeper (`feedback.feedback`), so always read it through `getFeedback()` / `getScore()` in `lib/feedback.js`. The transcript is a JSON string of Vapi messages; `formatTranscript()` turns it into a readable dialogue.
4. PDF export (`detalji/_components`) uses `jspdf` and `jspdf-autotable` with the Roboto font registered by `lib/pdfFont.js` from `public/fonts/`. The built-in jsPDF fonts cannot render č/ć/đ, so always call `registrujFont(doc)` and use the `'Roboto'` font.

**Language.** The whole app, including AI prompts, voice and feedback, is **Bosnian only**. `LANG_RULE` in `services/Constants.js` is prepended to prompts, and `lang` is always saved as `'bs'`. Use `lib/moment.js` (preconfigured with the `bs` locale) instead of importing `moment` directly. Translate Supabase auth errors with `prevediGresku()` from `lib/prevodGresaka.js`.

**UI.** shadcn/ui ("new-york" style, JSX, lucide icons) in `components/ui/`, Tailwind v4 via `@tailwindcss/postcss` with theme variables in `app/globals.css`, and `sonner` for toasts (don't use `alert()`). Add shadcn components with `npx shadcn@latest add <name>`. The brand color is indigo (`--primary`). Button has an extra `variant="brand"` (a cyan→indigo gradient) for the main CTAs. Landing, auth and sidebar use a dark "neon" style; the dashboard content and candidate pages are light with white cards. Remote images are allowed only from `lh3.googleusercontent.com` (`next.config.mjs`).
