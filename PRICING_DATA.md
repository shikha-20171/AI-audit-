# Pricing Data

All prices below were checked against official vendor pricing pages during submission week and encoded into `src/lib/pricing.ts`.

## Cursor

- Hobby: $0
- Pro: $20/month
- Teams: $40/user/month
- Enterprise: custom
- Source: https://cursor.com/pricing

## GitHub Copilot

- Individual / Pro: $10/month
- Business: $19/user/month
- Enterprise: $39/user/month
- Source: https://github.com/features/copilot/plans

## Claude

- Free: $0
- Pro: $20/month billed monthly
- Max: starts at $100/month
- Team: $30/member/month billed monthly, 5-seat minimum
- Enterprise: custom
- Claude API: usage-based and billed separately from Claude subscriptions
- Sources:
  - https://claude.com/pricing
  - https://support.anthropic.com/en/articles/9267289-how-is-my-bill-calculated

## ChatGPT / OpenAI

- ChatGPT Plus: $20/month
- ChatGPT Business: $25/user/month billed annually or $30/user/month billed monthly
- ChatGPT Enterprise: custom
- OpenAI API: usage-based and billed separately from ChatGPT subscriptions
- Sources:
  - https://openai.com/chatgpt/pricing
  - https://openai.com/api/pricing

## Gemini

- Google AI Pro: $19.99/month
- Google AI Ultra: starts at $99.99/month
- Gemini API: usage-based
- Sources:
  - https://gemini.google/us/subscriptions/?hl=en
  - https://ai.google.dev/gemini-api/docs/pricing?hl=en

## v0

- Free: $0/month
- Team: $30/user/month
- Business: $100/user/month
- Enterprise: custom
- Source: https://v0.dev/docs/pricing

## Notes on audit logic

- Savings totals include only verified plan-fit optimizations based on official list pricing.
- Potential savings from secondary-market credits are mentioned qualitatively in the report for high-spend cases, but are not added to the hero total because Credex pricing is private and varies by deal.
- API recommendations are intentionally conservative. The engine only recommends replacing direct API usage with a subscription when spend is low and the use case appears primarily interactive rather than production-embedded.
