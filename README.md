# PureGym Support Hub

Internal support website for PureGym KSA/UAE agents.

> **Stack:** Next.js 14 (App Router) · TypeScript · Prisma · PostgreSQL (Neon) · Groq/Gemini-compatible AI · Gmail SMTP
> **Hosting:** Vercel · **Database:** Neon

## Features

- Login / Sign up with email verification (Gmail SMTP)
- User / Admin / Super Admin roles
- Scripts dashboard with KSA/UAE + Arabic/English filters
- One small AI spelling-correction button inside the script box
- Admin script editor that updates scripts for everyone
- AI Support Chatbot with built-in style filters: KSA Arabic, KSA English, UAE Arabic, UAE English
- Per-user "Quick Scripts" and script favorites
- Calculation Tool rebuilt from the uploaded Excel workbook

## Script rules implemented

- KSA/UAE agent scripts have opening greetings removed from the body (e.g. `حياك الله`).
- WhatsApp scripts are ignored.
- Google Reviews scripts use the logged-in employee name.
- New App FAQs are converted into ready reply scripts instead of Q&A format.
- Freeze Policy is included as a membership policy summary.
- Action Templates are included as direct action scripts.

## Local setup

```bash
npm install
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
# Fill DATABASE_URL, AUTH_SECRET, JWT_SECRET, SMTP, AI, and admin values.
npm run db:push             # create tables in your Neon database
npm run db:seed             # seed scripts + initial admin
npm run smoke               # smoke-check pages and API protections
npm run dev
```

Open http://localhost:3000

## Deploying to Vercel

1. Push this repo to GitHub (already connected to `origin`).
2. In Vercel, import the GitHub repo (Framework preset: **Next.js**).
3. Create a **Neon** Postgres database and copy the pooled connection string.
4. In **Vercel > Settings > Environment Variables**, add every value from `.env.example`
   (set `DATABASE_URL` to the Neon pooled URL, and `NODE_ENV=production`, `COOKIE_SECURE=true`).
5. Deploy. The build runs `prisma generate && next build` automatically.

### First-time database setup

Run these once against the Neon database (locally with the production `DATABASE_URL`, or via a one-off script):

```bash
npm run db:push
npm run db:seed
```

> Every push to `main` triggers a production deploy. Pushing any other branch creates a Vercel **Preview** deployment — safe for testing before merging.

## Gmail SMTP

Use a Gmail **App Password**, not your normal Gmail password.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

## Admin

Set these before running the seed:

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME_AR=
ADMIN_NAME_EN=
```

The account whose email matches `SUPER_ADMIN_EMAIL` (or `ADMIN_EMAIL`) is always treated as `SUPER_ADMIN`.

## AI Provider

The app defaults to **Groq** instead of OpenAI to keep AI cost near zero on the free tier:

```env
AI_PROVIDER=groq
GROQ_API_KEY=
AI_MODEL=llama-3.1-8b-instant
```

Gemini is also supported through its OpenAI-compatible endpoint:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=
AI_MODEL=gemini-2.0-flash
```

OpenAI remains available only as an optional fallback by setting `AI_PROVIDER=openai`.

## Security notes

- Auth uses signed JWT cookies (`httpOnly`, `secure` in production).
- Rate limiting protects `login`, `signup`, `request-password-reset`, and `ai/chat` against brute-force and runaway AI quota/spend (`lib/rate-limit.ts`).
- AI memory summarization runs after the response via `waitUntil` so it completes on Vercel serverless (`lib/after.ts`).
- `/api/health` reports database, AI config, live-offer freshness, and cron configuration. Set `HEALTH_SECRET` or `CRON_SECRET` to protect it for external monitors.
- Security headers are set in `next.config.mjs`.

## Notes

The project ships with seeded scripts so the site works immediately after database setup. Admins can update scripts later from the Admin Editor without code changes.

Useful maintenance commands:

```bash
npm run docs:generate
npm run db:audit-legacy-quick-scripts
npm run db:cleanup-legacy-quick-scripts
```
