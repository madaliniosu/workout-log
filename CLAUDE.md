# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next` core-web-vitals + typescript, with `eslint-config-prettier` to defer style to Prettier)
- Formatting: no npm script is wired up; run `npx prettier --write .` directly. Config is in `.prettierrc` (semicolons, single quotes).
- No test suite or test runner is configured yet.

### Database (Drizzle ORM + Neon Postgres)

There are no `db:*` npm scripts; drive `drizzle-kit` directly via npx, using the config in `drizzle.config.ts`:
- `npx drizzle-kit generate` — generate SQL migrations from `src/db/schema.ts` into `./drizzle`
- `npx drizzle-kit push` — push schema changes straight to the database (no migration files)
- `npx drizzle-kit studio` — browse the database

`drizzle.config.ts` loads `DATABASE_URL` from `.env.local` via `dotenv`; the same variable is required at runtime by `src/db/index.ts`.

## Architecture

This is an early-stage app: the scaffolding from `create-next-app` is still in place (`src/app/page.tsx` is the default template) and the only real implementation so far is the database layer.

- **Next.js App Router**, TypeScript strict mode, `@/*` path alias resolves to `src/*`.
- **Database client** (`src/db/index.ts`): Drizzle ORM over Neon's serverless HTTP driver (`drizzle-orm/neon-http` + `@neondatabase/serverless`), not a persistent connection pool — keep this in mind for transaction semantics.
- **Schema** (`src/db/schema.ts`), four tables:
  - `users` — id/name/email/passwordHash.
  - `exercises` — `userId` is nullable: `null` means a global/shared exercise, a set value means a user's custom exercise. Any query listing exercises for a user needs to account for both cases.
  - `workoutSessions` — belongs to a user, one per workout (date + notes).
  - `workoutSets` — belongs to a `workoutSession` (`onDelete: 'cascade'`) and an `exercise`; carries `setOrder`, `reps`, `weight`, `rpe`.
  - No Drizzle `relations()` are defined yet, so relational query helpers (`db.query.x.findMany({ with: ... })`) aren't available — joins must be written manually until those are added.
- **Styling**: Tailwind CSS v4 via the `@tailwindcss/postcss` plugin, global styles in `src/app/globals.css`; Geist fonts loaded with `next/font/google` in the root layout.
