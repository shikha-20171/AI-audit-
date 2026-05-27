# Anthropic Summary Prompt

The app sends the following prompt shape to Anthropic when an API key is configured:

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

## Failure handling

If Anthropic is unavailable, the request fails, or the response is empty, the app falls back to a deterministic templated summary generated from the audit totals and outlook tier.
