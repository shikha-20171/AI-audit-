export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolKey =
  | "cursor"
  | "copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "v0";

export type PlanPriceType = "seat" | "account" | "custom" | "usage";

export type PlanDefinition = {
  key: string;
  label: string;
  priceMonthly: number | null;
  priceType: PlanPriceType;
  minimumSeats?: number;
  bestFor: UseCase[];
  sourceUrl: string;
  sourceNote: string;
};

export type ToolDefinition = {
  key: ToolKey;
  label: string;
  vendor: string;
  category: "assistant" | "api" | "builder";
  supportsCreditsHint: boolean;
  plans: PlanDefinition[];
};

export type ToolSpendInput = {
  toolKey: ToolKey;
  enabled: boolean;
  planKey: string;
  monthlySpend: number;
  seats: number;
};

export type AuditInput = {
  teamSize: number;
  useCase: UseCase;
  tools: ToolSpendInput[];
};

export type AuditLine = {
  toolKey: ToolKey;
  toolLabel: string;
  currentSpend: number;
  recommendedSpend: number;
  savingsMonthly: number;
  currentPlanLabel: string;
  recommendedPlanLabel: string;
  action: string;
  reason: string;
  creditsNote?: string;
};

export type AuditTotals = {
  monthlySpend: number;
  optimizedMonthlySpend: number;
  monthlySavings: number;
  annualSavings: number;
  savingsPerDeveloper: number;
};

export type AuditResult = {
  input: AuditInput;
  lines: AuditLine[];
  totals: AuditTotals;
  summaryFallback: string;
  outlook: "high" | "modest" | "healthy";
  createdAt: string;
};

export type StoredAudit = {
  id: string;
  publicReport: AuditResult;
  companyName?: string;
  email?: string;
  role?: string;
};

export type LeadCapturePayload = {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  honeypot?: string;
};
