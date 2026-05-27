# Prompts

## Summary Generation Prompt

This is the full prompt shape used for the personalized audit summary:

```text
You are writing a concise audit summary for a startup's AI tooling spend.
Explain the biggest source of waste, the strongest recommendation, and the expected monthly savings.
Be honest and concrete. Keep it around 100 words. No hype.
Use case: {useCase}
Team size: {teamSize}
Current monthly spend: ${monthlySpend}
Potential monthly savings: ${monthlySavings}
Potential annual savings: ${annualSavings}
Audit lines: {serialized audit lines}
```

## Why I Wrote It This Way

- "Concise audit summary" narrows the task away from broad marketing copy.
- "Biggest source of waste" forces prioritization instead of a laundry list.
- "Strongest recommendation" makes the paragraph actionable.
- "Be honest and concrete" reduces the tendency to oversell savings.
- "No hype" is there because this product should sound financially credible, not like a growth landing page.
- Including serialized audit lines gives the model enough structured context to speak specifically about the result without asking it to invent pricing logic.

## What I Did Not Trust AI With

- I did not use AI to calculate savings.
- I did not use AI to choose plan pricing.
- I did not use AI to decide whether a downgrade is valid.

Those parts are rule-based because the product’s core promise is defensible audit math.

## What I Tried That Did Not Work

I explicitly avoided a looser prompt style like "write a persuasive summary of this audit" because that framing tends to produce sales copy, generic praise, or inflated certainty. For this product, that is the wrong tone. The summary needs to read like a careful recommendation, not a conversion script.

I also avoided asking the model to recommend new tools from scratch. In early drafts of the prompt design, that kind of phrasing increases the chance that the model makes unsupported claims beyond the deterministic audit rules already computed by the server.
