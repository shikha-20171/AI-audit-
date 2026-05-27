import { AuditResult } from "@/lib/types";

export async function generateSummary(result: AuditResult) {
  const prompt = [
    "You are writing a concise audit summary for a startup's AI tooling spend.",
    "Explain the biggest source of waste, the strongest recommendation, and the expected monthly savings.",
    "Be honest and concrete. Keep it around 100 words. No hype.",
    `Use case: ${result.input.useCase}`,
    `Team size: ${result.input.teamSize}`,
    `Current monthly spend: $${result.totals.monthlySpend}`,
    `Potential monthly savings: $${result.totals.monthlySavings}`,
    `Potential annual savings: $${result.totals.annualSavings}`,
    `Audit lines: ${JSON.stringify(result.lines)}`,
  ].join("\n");

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      summary: result.summaryFallback,
      usedFallback: true,
    };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
        max_tokens: 220,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic request failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };

    const text = payload.content?.find((item) => item.type === "text")?.text?.trim();

    if (!text) {
      throw new Error("Anthropic returned no text.");
    }

    return {
      summary: text,
      usedFallback: false,
    };
  } catch {
    return {
      summary: result.summaryFallback,
      usedFallback: true,
    };
  }
}
