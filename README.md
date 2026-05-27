# SpendSignal

SpendSignal is a free AI spend audit web app built for Credex. It is designed for startup founders, engineering managers, and finance-conscious operators who want a fast second opinion on whether they are overspending on ChatGPT, Claude, Cursor, Copilot, Gemini, v0, and direct API usage.

The product gives users value before asking for an email: they enter their stack, get an on-screen audit with verified savings logic, and can then save or share the result through a public report URL. For Credex, it doubles as a lead-generation surface for teams with meaningful savings potential.

## Deployed URL

- Deployment pending. Add your live link here after deploy: `https://your-domain.example`

## Product Walkthrough

- Screenshot 1: Landing page + value proposition
- Screenshot 2: Spend input form with tool, plan, spend, and seat fields
- Screenshot 3: Audit results view with savings hero, per-tool recommendations, and lead capture
- Optional 30-second recording: add Loom or YouTube link here

Note: this repo snapshot does not yet include exported screenshots or a recording asset.

## Quick Start

### Install

```bash
npm install
```

### Run locally

```bash
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

### Environment variables

Fill `.env.local` with the services you have available:

- `NEXT_PUBLIC_APP_URL`: base URL for metadata and share links
- `ANTHROPIC_API_KEY`: enables personalized summary generation
- `SUPABASE_URL`: Supabase project base URL
- `SUPABASE_SERVICE_ROLE_KEY`: server-side write access for audits and leads
- `SUPABASE_AUDITS_TABLE`: audits table name
- `SUPABASE_LEADS_TABLE`: leads table name
- `RESEND_API_KEY`: transactional email delivery
- `RESEND_FROM_EMAIL`: sender address for audit confirmation emails

The app still runs without optional providers:

- Summary generation falls back to a deterministic template
- Storage falls back to local `.data/*.json`
- Email sending is skipped

### Deploy

Vercel is the intended deployment target.

```bash
npm run build
```

Then:

1. Push the repo to GitHub.
2. Import the repo into Vercel.
3. Add the same environment variables from `.env.local` into the Vercel project settings.
4. Redeploy and set `NEXT_PUBLIC_APP_URL` to the production domain.

## Decisions

1. I used a rule-based audit engine instead of AI for pricing math because savings recommendations need to be deterministic, explainable, and finance-friendly.
2. I used Next.js App Router instead of a client-only SPA because the project needs public share URLs, server routes, and Open Graph previews in the same app.
3. I made email capture post-value instead of gating the form up front because the product brief explicitly prioritizes trust and usefulness over lead friction.
4. I added Supabase and Resend as optional integrations with local JSON fallback so the MVP still works end to end in development before external services are provisioned.
5. I kept abuse protection lightweight with an in-memory rate limiter plus honeypot because it avoids captcha friction on a cold-traffic landing page while still handling basic launch-week abuse.

## Supporting Docs

- `ARCHITECTURE.md`
- `PRICING_DATA.md`
- `PROMPTS.md`

## Repository

- GitHub: `https://github.com/shikha-20171/AI-audit-.git`
