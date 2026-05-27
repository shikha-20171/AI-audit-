# SpendSignal

SpendSignal is a free AI spend audit app built for Credex. It helps founders and engineering managers see whether they are overpaying for AI subscriptions and API usage, then turns the result into a shareable public report.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you have.

- `ANTHROPIC_API_KEY`: enables personalized summaries
- `SUPABASE_*`: enables hosted storage for audits and leads
- `RESEND_*`: enables confirmation emails
- `NEXT_PUBLIC_APP_URL`: used for share URLs and metadata

The app still works without these values:

- Audit summaries fall back to a template
- Storage falls back to local JSON files in `.data/`
- Emails are skipped

## Production notes

- Use Supabase tables for `audits` and `leads`
- Add `NEXT_PUBLIC_APP_URL` for correct OG URLs
- Deploy on Vercel or any Node-capable host that supports Next.js App Router

## Documents

- `ARCHITECTURE.md`
- `PRICING_DATA.md`
- `PROMPTS.md`
