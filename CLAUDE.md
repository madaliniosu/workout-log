# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next` core-web-vitals + typescript, with `eslint-config-prettier` to defer style to Prettier)
- Formatting: no npm script is wired up; run `npx prettier --write .` directly. Config is in `.prettierrc` (semicolons, single quotes).
- `npm test` — Vitest (run mode). Currently covers `src/lib/validations.ts` only.
- CI (`.github/workflows/`) runs lint + test on every push/PR to `main`.

### Database (Drizzle ORM + Neon Postgres)

There are no `db:*` npm scripts; drive `drizzle-kit` directly via npx, using the config in `drizzle.config.ts`:
- `npx drizzle-kit generate` — generate SQL migrations from `src/db/schema.ts` into `./drizzle`
- `npx drizzle-kit push` — push schema changes straight to the database (no migration files)
- `npx drizzle-kit studio` — browse the database

`drizzle.config.ts` loads `DATABASE_URL` from `.env.local` via `dotenv`; the same variable is required at runtime by `src/db/index.ts`.

## Architecture

- **Next.js App Router**, TypeScript strict mode, `@/*` path alias resolves to `src/*`.
- **Auth** (`src/auth.ts`): Auth.js v5, credentials provider (email/password, bcrypt), JWT sessions. `src/proxy.ts` gates `/dashboard`, `/workouts`, `/exercises`, `/settings` and redirects unauthenticated requests to `/login`. Signup/login pages live in `src/app/signup/` and `src/app/login/`.
- **Database client** (`src/db/index.ts`): Drizzle ORM over Neon's serverless HTTP driver (`drizzle-orm/neon-http` + `@neondatabase/serverless`), not a persistent connection pool — keep this in mind for transaction semantics.
- **Schema** (`src/db/schema.ts`), four tables:
  - `users` — id/name/email/passwordHash.
  - `exercises` — `userId` is nullable: `null` means a global/shared exercise, a set value means a user's custom exercise. Any query listing exercises for a user needs to account for both cases. Defaults are seeded via `src/db/seed.ts` (`npm run db:seed`).
  - `workoutSessions` — belongs to a user, one per workout (date + notes).
  - `workoutSets` — belongs to a `workoutSession` (`onDelete: 'cascade'`) and an `exercise`; carries `setOrder`, `reps`, `weight`, `rpe`.
  - No Drizzle `relations()` are defined yet, so relational query helpers (`db.query.x.findMany({ with: ... })`) aren't available — joins are written manually in `src/db/queries/`.
- **Validation**: shared Zod schemas in `src/lib/validations.ts` (signup, exercise creation, workout sets/sessions), used by both API routes and forms.
- **Features implemented**: exercise library (list + add custom), workout CRUD (`/workouts`, `/workouts/new`, `/workouts/[id]` view+edit) backed by REST routes under `src/app/api/`, and a dashboard (`src/app/dashboard/`) with a volume-over-time chart (Recharts), personal records, and per-exercise progress (`src/db/queries/analytics.ts`).
- **Styling**: Tailwind CSS v4 via the `@tailwindcss/postcss` plugin, global styles in `src/app/globals.css`; Geist fonts loaded with `next/font/google` in the root layout.

### Known gaps (as of 2026-06-24)
- `src/app/page.tsx` and `src/app/layout.tsx` are still the unmodified `create-next-app` scaffold — no root redirect, no shared nav/sidebar across pages.
- `src/proxy.ts` protects `/settings`, but no `/settings` route exists yet.
