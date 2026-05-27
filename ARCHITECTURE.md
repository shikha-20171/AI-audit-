# Architecture

## Why Next.js + TypeScript

I chose Next.js App Router with TypeScript because this MVP needs both a polished landing experience and server capabilities in one deployable codebase:

- Public marketing page and audit app in the same project
- Route handlers for audit creation and lead capture
- Dynamic public report URLs with metadata and Open Graph previews
- First-party support for server rendering and OG image generation
- Strong type safety around pricing data and audit rules

This is a better fit than a pure SPA because the viral share loop depends on server-rendered report pages and link previews.

## Core flow

1. A visitor enters tool, plan, spend, seats, team size, and use case.
2. Form state persists in `localStorage`.
3. The client posts the payload to `POST /api/audits`.
4. The server runs the rule-based audit engine, stores a public audit record, and tries to generate a personalized summary with Anthropic.
5. The client renders the result instantly and surfaces a share URL.
6. After value is shown, the visitor can submit email details to `POST /api/leads`.
7. The lead is stored and a confirmation email is sent if Resend is configured.

## Storage choice

The production backend target is Supabase via its REST API and a service role key. That keeps setup lightweight while still giving us a real hosted database.

The code also includes a local JSON-file fallback under `.data/` so the MVP still runs end to end in development without provisioning infrastructure first. That fallback is for local/dev only, not the recommended production mode.

## Audit engine design

The audit math is intentionally rule-based rather than AI-generated:

- Team-tier minimum checks
- Solo or very small team downgrade rules
- Enterprise-to-business step-down checks
- Duplicate tool overlap checks
- Low-volume API-to-subscription checks

This keeps the savings math deterministic, debuggable, and finance-friendly.

## Abuse protection

This MVP uses:

- IP-based rate limiting in memory for audit and lead endpoints
- A honeypot field on the lead form

Why this choice:

- Invisible to legitimate users
- No captcha friction on a cold-traffic landing page
- Good enough for a lightweight public launch

If traffic scales, the next step would be moving rate limiting to Redis or an edge KV store.
