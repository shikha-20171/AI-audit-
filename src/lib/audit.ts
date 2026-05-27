import { AuditInput, AuditLine, AuditResult, ToolSpendInput } from "@/lib/types";
import { getPlanDefinition, toolCatalog } from "@/lib/pricing";
import { clampMinimum, safeRound } from "@/lib/utils";

function normalizeSpend(tool: ToolSpendInput) {
  return clampMinimum(tool.monthlySpend, 0);
}

function recommendForRow(input: AuditInput, tool: ToolSpendInput): AuditLine | null {
  if (!tool.enabled) return null;

  const currentPlan = getPlanDefinition(tool.toolKey, tool.planKey);
  if (!currentPlan) return null;

  const currentSpend = normalizeSpend(tool);
  let recommendedSpend = currentSpend;
  let recommendedPlanLabel = currentPlan.label;
  let action = "Keep current setup";
  let reason = "Your current spend looks aligned with the plan tier you selected.";
  let creditsNote: string | undefined;

  const seats = Math.max(1, tool.seats || 1);
  const isSolo = seats <= 1 || input.teamSize <= 1;
  const lowSeatTeam = seats <= 2;

  if (tool.toolKey === "cursor") {
    if ((tool.planKey === "business" || tool.planKey === "enterprise") && lowSeatTeam) {
      recommendedSpend = 20 * seats;
      recommendedPlanLabel = "Cursor Pro";
      action = "Downgrade to individual seats";
      reason =
        "Cursor's team controls are hard to justify for one or two developers when Pro delivers the core coding workflow at half the seat cost.";
    } else if (tool.planKey === "pro" && currentSpend > 30) {
      recommendedSpend = 20;
      action = "Trim overage or unused add-ons";
      reason =
        "Cursor Pro is officially priced at $20/month, so spend above that usually means extra usage or an inactive seat worth reviewing.";
    }
  }

  if (tool.toolKey === "copilot") {
    if ((tool.planKey === "business" || tool.planKey === "enterprise") && lowSeatTeam) {
      recommendedSpend = 10 * seats;
      recommendedPlanLabel = "Copilot Individual";
      action = "Downgrade to individual seats";
      reason =
        "For one or two developers, Copilot's org management premium is usually unnecessary unless you explicitly need policy controls or codebase-wide knowledge.";
    } else if (tool.planKey === "enterprise" && input.teamSize < 25) {
      recommendedSpend = 19 * seats;
      recommendedPlanLabel = "Copilot Business";
      action = "Step down one tier";
      reason =
        "Copilot Enterprise earns its premium when a larger org needs GitHub-native knowledge and admin depth; smaller engineering teams often fit Business.";
    }
  }

  if (tool.toolKey === "claude") {
    if (tool.planKey === "team" && seats < 5) {
      recommendedSpend = 20 * seats;
      recommendedPlanLabel = "Claude Pro";
      action = "Exit the team tier";
      reason =
        "Claude Team has a five-seat minimum, so a sub-five-seat deployment is structurally overpriced versus matching Pro seats to actual headcount.";
    } else if (tool.planKey === "max" && input.useCase !== "research" && input.useCase !== "mixed") {
      recommendedSpend = 20;
      recommendedPlanLabel = "Claude Pro";
      action = "Downgrade from Max";
      reason =
        "Claude Max is best reserved for very heavy daily usage; for lighter coding, writing, or occasional analysis, Pro is usually the economic tier.";
    }
  }

  if (tool.toolKey === "chatgpt") {
    if (tool.planKey === "team" && isSolo) {
      recommendedSpend = 20;
      recommendedPlanLabel = "ChatGPT Plus";
      action = "Move to an individual seat";
      reason =
        "Workspace controls become expensive quickly for a single user. Plus is the efficient default unless you need shared billing, admins, or connectors.";
    } else if (tool.planKey === "enterprise" && input.teamSize < 20) {
      recommendedSpend = 30 * seats;
      recommendedPlanLabel = "ChatGPT Team / Business";
      action = "Test the business workspace first";
      reason =
        "Enterprise controls are valuable, but many sub-20-person teams can capture most of the workspace benefit on Business before paying for custom enterprise terms.";
    }
  }

  if (tool.toolKey === "gemini") {
    if (tool.planKey === "ultra" && input.useCase !== "research") {
      recommendedSpend = 19.99;
      recommendedPlanLabel = "Gemini Pro";
      action = "Downgrade from Ultra";
      reason =
        "Gemini Ultra is a premium limit tier. If the workload is not research-heavy or executive-level daily use, Pro is the more efficient default.";
    }
  }

  if (tool.toolKey === "v0") {
    if (tool.planKey === "business" && input.teamSize < 8) {
      recommendedSpend = 30 * seats;
      recommendedPlanLabel = "v0 Team";
      action = "Step down to Team";
      reason =
        "v0 Business mainly pays for privacy and admin controls. Smaller product teams often get the same output from Team without the 3x seat premium.";
    }
  }

  if (tool.toolKey === "anthropic_api" || tool.toolKey === "openai_api" || tool.toolKey === "gemini") {
    const apiLike =
      tool.toolKey === "anthropic_api" ||
      tool.toolKey === "openai_api" ||
      tool.planKey === "api";

    if (apiLike) {
      if (currentSpend < 80 && (input.useCase === "writing" || input.useCase === "research")) {
        recommendedSpend = 20;
        recommendedPlanLabel =
          tool.toolKey === "gemini" ? "Gemini Pro" : tool.toolKey === "anthropic_api" ? "Claude Pro" : "ChatGPT Plus";
        action = "Replace low-volume API usage with a subscription";
        reason =
          "If the team mostly uses AI interactively instead of embedding it into production software, a paid chat subscription is often cheaper than direct API spend at this level.";
      } else if (currentSpend >= 500) {
        creditsNote =
          "High recurring API spend is a good candidate for secondary-market credits. That upside is not counted in the savings total because credit pricing is deal-specific.";
      }
    }
  }

  const codingAssistants = input.tools.filter(
    (row) =>
      row.enabled &&
      ["cursor", "copilot"].includes(row.toolKey) &&
      input.useCase === "coding",
  );
  const cursorSpend = input.tools.find((row) => row.toolKey === "cursor")?.monthlySpend ?? 0;

  if (
    tool.toolKey === "copilot" &&
    codingAssistants.length > 1 &&
    currentSpend <= cursorSpend
  ) {
    recommendedSpend = 0;
    recommendedPlanLabel = "Remove duplicate seat set";
    action = "Consolidate coding copilots";
    reason =
      "Running both Cursor and Copilot for the same coding team often duplicates the core completion-and-chat workflow. Keep one primary editor assistant and retire the secondary spend.";
  }

  const chatTools = input.tools.filter(
    (row) =>
      row.enabled &&
      ["claude", "chatgpt", "gemini"].includes(row.toolKey) &&
      input.useCase !== "coding",
  );

  if (
    ["claude", "chatgpt", "gemini"].includes(tool.toolKey) &&
    chatTools.length > 1 &&
    seats <= 2 &&
    currentSpend <= 20
  ) {
    recommendedSpend = 0;
    recommendedPlanLabel = "Free or shared primary tool";
    action = "Remove overlapping chat subscriptions";
    reason =
      "For small teams, paying retail for multiple general-purpose chat assistants usually creates overlap faster than incremental value. Keep one paid default and cut the rest.";
  }

  const savingsMonthly = safeRound(Math.max(0, currentSpend - recommendedSpend));

  if (savingsMonthly === 0 && !creditsNote) {
    return {
      toolKey: tool.toolKey,
      toolLabel: toolCatalog.find((item) => item.key === tool.toolKey)?.label ?? tool.toolKey,
      currentSpend,
      recommendedSpend: currentSpend,
      savingsMonthly: 0,
      currentPlanLabel: currentPlan.label,
      recommendedPlanLabel,
      action,
      reason,
    };
  }

  return {
    toolKey: tool.toolKey,
    toolLabel: toolCatalog.find((item) => item.key === tool.toolKey)?.label ?? tool.toolKey,
    currentSpend,
    recommendedSpend,
    savingsMonthly,
    currentPlanLabel: currentPlan.label,
    recommendedPlanLabel,
    action,
    reason,
    creditsNote,
  };
}

export function buildFallbackSummary(result: AuditResult) {
  if (result.totals.monthlySavings >= 500) {
    return `Your stack has real savings headroom. The biggest wins come from excess team tiers, overlapping copilots, or chat subscriptions that can be consolidated without meaningfully reducing capability. Tightening the stack would save ${result.totals.monthlySavings.toFixed(
      0,
    )} per month before any private credit discounts.`;
  }

  if (result.totals.monthlySavings < 100) {
    return "Your current setup is already fairly disciplined. There are a few light optimizations to watch, but this audit did not find enough verified savings to justify a disruptive stack change today.";
  }

  return `Your AI stack is mostly sensible, but there are a few clear pricing mismatches. The strongest opportunities come from matching plan type to team size and cutting overlapping tools, which would save about ${result.totals.monthlySavings.toFixed(
    0,
  )} per month.`;
}

export function runAudit(input: AuditInput): AuditResult {
  const lines = input.tools.map((tool) => recommendForRow(input, tool)).filter(Boolean) as AuditLine[];
  const monthlySpend = safeRound(lines.reduce((sum, line) => sum + line.currentSpend, 0));
  const monthlySavings = safeRound(lines.reduce((sum, line) => sum + line.savingsMonthly, 0));
  const optimizedMonthlySpend = safeRound(Math.max(0, monthlySpend - monthlySavings));
  const annualSavings = safeRound(monthlySavings * 12);
  const savingsPerDeveloper = safeRound(monthlySavings / Math.max(input.teamSize, 1));
  const outlook =
    monthlySavings >= 500 ? "high" : monthlySavings < 100 ? "healthy" : "modest";

  const result: AuditResult = {
    input,
    lines,
    totals: {
      monthlySpend,
      optimizedMonthlySpend,
      monthlySavings,
      annualSavings,
      savingsPerDeveloper,
    },
    summaryFallback: "",
    outlook,
    createdAt: new Date().toISOString(),
  };

  result.summaryFallback = buildFallbackSummary(result);
  return result;
}
