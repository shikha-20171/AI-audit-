# Reflection

## 1. The hardest bug you hit this week, and how you debugged it

The hardest bug was not in the audit logic itself, but in getting the app to build reliably in this environment. After the first implementation pass, linting passed only after I excluded generated artifacts from the temporary scaffold directory, but the production build still failed in two different ways. First, `next/font/google` could not fetch remote fonts because the environment blocked that network access. My first hypothesis was that I had broken the layout or CSS import chain, but the error text was explicit about Google Fonts fetches, so I replaced remote font loading with local-first font stacks to remove that dependency. After that, the build still failed, but now with a Turbopack panic tied to CSS processing and an “Operation not permitted” port-binding error.

At that point I formed two hypotheses: either my Tailwind setup was malformed, or Turbopack itself was tripping over the sandbox. To test that, I ran the same production build through the Webpack path instead of Turbopack. Webpack compiled successfully, which ruled out the app code and pointed directly at an environment-specific Turbopack issue. The fix that actually worked was updating the build script to `next build --webpack` so the repo has a reliable verification path. That debugging sequence mattered because it prevented me from “fixing” app code that was not actually broken.

## 2. A decision you reversed mid-week, and what made you reverse it

The clearest reversal was around how much AI should influence the core product output. At the beginning, it is tempting to let the model generate richer recommendations, suggest alternative vendors, and even participate in the pricing analysis. That sounds powerful, but as the product took shape, it became obvious that the audit’s core value is not eloquence. It is trust. A founder or engineering manager has to believe that the savings number came from rules they could defend to a finance lead, not from an LLM improvising over a prompt.

So I reversed that direction and pushed the product into a stricter split. The audit math became entirely rule-based, with explicit checks for minimum seats, solo-team downgrade logic, overlapping tools, and low-volume API use. AI was kept only for the personalized summary paragraph. That reversal made the product better in two ways. First, it reduced the chance of unsupported recommendations. Second, it made testing possible. Once the logic lived in deterministic functions, I could add targeted tests that prove the same input produces the same output every time. The result is less flashy than an AI-heavy system, but much more defensible as an actual spend-audit product.

## 3. What you would build in week 2 if you had it

If I had a second week, I would focus less on broadening the feature list and more on turning the MVP into a real operating system for lead quality. The first addition would be benchmark mode. Right now the audit answers “what should this team change?” Week 2 should add “how does this team compare to similar companies?” That means building a derived metric like AI spend per developer, grouping by company stage and primary use case, and showing a percentile-style comparison. That would make the report feel less like a calculator and more like category intelligence.

The second priority would be richer lead qualification. Today the app captures email, company, role, and team size, but it does not score lead quality deeply. I would add an internal lead score based on monthly savings, API spend share, team size, and whether the stack suggests credit-buying potential. That would let Credex route high-intent leads faster and avoid over-following low-savings cases.

Third, I would harden the operational side: Redis-backed rate limiting, async email delivery, deployment analytics, and real event instrumentation from landing to audit completion to share clicks. Finally, I would use real user interviews to rewrite the copy and maybe narrow the target persona. The current product is broad enough to be useful, but week 2 should make it sharper and more opinionated.

## 4. How you used AI tools

I used AI as a coding partner, not as an authority. The main tool I used was this coding assistant environment to scaffold the Next.js app, reason through architecture, write implementation code, and generate documentation drafts. I also used AI selectively for writing support, especially in shaping product-facing copy and the fallback logic around the personalized summary experience. Where AI helped most was speed: it reduced the time needed to go from blank repo to functioning MVP with routes, storage abstraction, docs, and tests.

What I did not trust AI with was the core audit logic and the truth-sensitive artifacts. I did not let AI decide pricing data, infer unsupported vendor claims, or invent user interviews. I also did not trust it to backfill a fake seven-day work log. Those are exactly the areas where polished nonsense is more dangerous than slow manual work.

One specific time the AI was wrong was during the initial build verification phase. The implementation used remote Google fonts through Next’s font helper, which looked fine at the code level, but it failed in this environment because the font fetches were blocked. If I had treated the generated setup as automatically correct, I would have blamed unrelated parts of the app. Instead, I verified the error, replaced the font strategy, and then separated a real app issue from a Turbopack-specific sandbox failure. That was a good reminder that AI-generated code still needs adversarial checking.

## 5. Self-rating on a 1–10 scale

**Discipline: 6/10.** I shipped a coherent MVP quickly, but the repo does not honestly meet the multi-day cadence and contemporaneous devlog standard, which matters.

**Code quality: 7/10.** The code is typed, reasonably modular, and covered by audit-engine tests, but the product still uses lightweight fallbacks and would benefit from stronger production hardening.

**Design sense: 7/10.** The interface has a clearer point of view than a default template and supports the screenshot/share use case, though it still needs real user feedback to refine conversion and trust signals.

**Problem-solving: 8/10.** I was able to get from an empty workspace to a working MVP, debug environment-specific build issues, and keep the audit logic deterministic where that mattered most.

**Entrepreneurial thinking: 6/10.** The docs now cover positioning, metrics, GTM, and economics, but without real interviews and live traction, the founder thinking is still more reasoned than proven.
