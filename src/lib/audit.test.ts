import { describe, expect, it } from "vitest";

import { runAudit } from "./audit";
import { AuditInput, ToolSpendInput } from "./types";

function makeTool(overrides: Partial<ToolSpendInput>): ToolSpendInput {
  return {
    toolKey: "cursor",
    enabled: false,
    planKey: "pro",
    monthlySpend: 20,
    seats: 1,
    ...overrides,
  };
}

function makeInput(overrides: Partial<AuditInput> = {}): AuditInput {
  return {
    teamSize: 4,
    useCase: "coding",
    tools: [],
    ...overrides,
  };
}

describe("runAudit", () => {
  it("downgrades Cursor Business for a two-seat team", () => {
    const result = runAudit(
      makeInput({
        teamSize: 2,
        useCase: "coding",
        tools: [
          makeTool({
            toolKey: "cursor",
            enabled: true,
            planKey: "business",
            monthlySpend: 80,
            seats: 2,
          }),
        ],
      }),
    );

    expect(result.totals.monthlySavings).toBe(40);
    expect(result.lines[0]?.recommendedPlanLabel).toBe("Cursor Pro");
    expect(result.lines[0]?.action).toBe("Downgrade to individual seats");
  });

  it("moves Claude Team under five seats to Claude Pro", () => {
    const result = runAudit(
      makeInput({
        teamSize: 3,
        useCase: "research",
        tools: [
          makeTool({
            toolKey: "claude",
            enabled: true,
            planKey: "team",
            monthlySpend: 90,
            seats: 3,
          }),
        ],
      }),
    );

    expect(result.totals.monthlySavings).toBe(30);
    expect(result.lines[0]?.recommendedPlanLabel).toBe("Claude Pro");
    expect(result.lines[0]?.action).toBe("Exit the team tier");
  });

  it("replaces low-volume OpenAI API spend with ChatGPT Plus for research use", () => {
    const result = runAudit(
      makeInput({
        teamSize: 1,
        useCase: "research",
        tools: [
          makeTool({
            toolKey: "openai_api",
            enabled: true,
            planKey: "direct",
            monthlySpend: 65,
            seats: 1,
          }),
        ],
      }),
    );

    expect(result.totals.monthlySavings).toBe(45);
    expect(result.lines[0]?.recommendedPlanLabel).toBe("ChatGPT Plus");
    expect(result.lines[0]?.action).toBe("Replace low-volume API usage with a subscription");
  });

  it("flags high recurring API spend as a credits opportunity without forcing fake savings", () => {
    const result = runAudit(
      makeInput({
        teamSize: 6,
        useCase: "data",
        tools: [
          makeTool({
            toolKey: "anthropic_api",
            enabled: true,
            planKey: "direct",
            monthlySpend: 700,
            seats: 6,
          }),
        ],
      }),
    );

    expect(result.totals.monthlySavings).toBe(0);
    expect(result.lines[0]?.creditsNote).toContain("secondary-market credits");
  });

  it("consolidates overlapping coding copilots when both Cursor and Copilot are enabled", () => {
    const result = runAudit(
      makeInput({
        teamSize: 2,
        useCase: "coding",
        tools: [
          makeTool({
            toolKey: "cursor",
            enabled: true,
            planKey: "pro",
            monthlySpend: 20,
            seats: 1,
          }),
          makeTool({
            toolKey: "copilot",
            enabled: true,
            planKey: "individual",
            monthlySpend: 10,
            seats: 1,
          }),
        ],
      }),
    );

    const copilotLine = result.lines.find((line) => line.toolKey === "copilot");

    expect(copilotLine?.recommendedSpend).toBe(0);
    expect(copilotLine?.action).toBe("Consolidate coding copilots");
    expect(result.totals.monthlySavings).toBe(10);
  });

  it("removes overlapping small-team chat subscriptions", () => {
    const result = runAudit(
      makeInput({
        teamSize: 2,
        useCase: "writing",
        tools: [
          makeTool({
            toolKey: "claude",
            enabled: true,
            planKey: "pro",
            monthlySpend: 20,
            seats: 1,
          }),
          makeTool({
            toolKey: "chatgpt",
            enabled: true,
            planKey: "plus",
            monthlySpend: 20,
            seats: 1,
          }),
        ],
      }),
    );

    expect(result.lines.every((line) => line.recommendedSpend === 0)).toBe(true);
    expect(result.totals.monthlySavings).toBe(40);
  });
});
