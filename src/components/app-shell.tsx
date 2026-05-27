"use client";

import { useEffect, useMemo, useState } from "react";

import { toolCatalog } from "@/lib/pricing";
import { AuditInput, AuditResult, ToolSpendInput, UseCase } from "@/lib/types";
import { currency } from "@/lib/utils";

const storageKey = "spend-signal-form-v1";

const defaultTools: ToolSpendInput[] = [
  { toolKey: "cursor", enabled: false, planKey: "pro", monthlySpend: 20, seats: 1 },
  { toolKey: "copilot", enabled: false, planKey: "individual", monthlySpend: 10, seats: 1 },
  { toolKey: "claude", enabled: false, planKey: "pro", monthlySpend: 20, seats: 1 },
  { toolKey: "chatgpt", enabled: false, planKey: "plus", monthlySpend: 20, seats: 1 },
  { toolKey: "anthropic_api", enabled: false, planKey: "direct", monthlySpend: 150, seats: 1 },
  { toolKey: "openai_api", enabled: false, planKey: "direct", monthlySpend: 150, seats: 1 },
  { toolKey: "gemini", enabled: false, planKey: "pro", monthlySpend: 19.99, seats: 1 },
  { toolKey: "v0", enabled: false, planKey: "team", monthlySpend: 30, seats: 1 },
];

function buildDefaultInput(): AuditInput {
  return {
    teamSize: 4,
    useCase: "coding",
    tools: defaultTools,
  };
}

type ApiAuditResponse = {
  id: string;
  report: AuditResult;
  summary: string;
  summaryUsedFallback: boolean;
};

export function AppShell() {
  const [input, setInput] = useState<AuditInput>(() => {
    if (typeof window === "undefined") {
      return buildDefaultInput();
    }

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return buildDefaultInput();
    }

    try {
      return JSON.parse(raw) as AuditInput;
    } catch {
      window.localStorage.removeItem(storageKey);
      return buildDefaultInput();
    }
  });
  const [loading, setLoading] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [summaryUsedFallback, setSummaryUsedFallback] = useState(false);
  const [report, setReport] = useState<AuditResult | null>(null);
  const [leadState, setLeadState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [leadFields, setLeadFields] = useState({
    email: "",
    companyName: "",
    role: "",
    honeypot: "",
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(input));
  }, [input]);

  const shareUrl = useMemo(() => {
    if (!auditId || typeof window === "undefined") return "";
    return `${window.location.origin}/report/${auditId}`;
  }, [auditId]);

  async function handleAuditSubmit() {
    setLoading(true);
    setLeadState("idle");
    try {
      const response = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("Audit request failed.");
      }

      const payload = (await response.json()) as ApiAuditResponse;
      setAuditId(payload.id);
      setReport(payload.report);
      setSummary(payload.summary);
      setSummaryUsedFallback(payload.summaryUsedFallback);
    } catch {
      setLeadState("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleLeadSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auditId) return;
    setLeadState("saving");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          email: leadFields.email,
          companyName: leadFields.companyName,
          role: leadFields.role,
          teamSize: input.teamSize,
          honeypot: leadFields.honeypot,
        }),
      });

      if (!response.ok) {
        throw new Error("Lead save failed.");
      }

      setLeadState("saved");
    } catch {
      setLeadState("error");
    }
  }

  function updateTool(toolKey: string, partial: Partial<ToolSpendInput>) {
    setInput((current) => ({
      ...current,
      tools: current.tools.map((tool) =>
        tool.toolKey === toolKey ? { ...tool, ...partial } : tool,
      ),
    }));
  }

  const outlookLabel =
    report?.outlook === "high"
      ? "High savings opportunity"
      : report?.outlook === "healthy"
        ? "Already disciplined"
        : "Moderate optimization";

  return (
    <main className="px-4 py-4 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass overflow-hidden rounded-[36px] border border-(--line) p-7 shadow-[0_40px_100px_rgba(16,34,41,0.14)] md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#102229] px-4 py-2 font-mono text-xs uppercase tracking-[0.24em] text-[#fff7ef]">
                Free audit
              </span>
              <span className="rounded-full border border-(--line-strong) px-4 py-2 font-mono text-xs uppercase tracking-[0.24em] text-(--ink-soft)">
                No login required
              </span>
            </div>
            <h1 className="mt-8 max-w-3xl text-5xl font-semibold tracking-tighter md:text-7xl">
              SpendSignal
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-(--ink-soft) md:text-xl">
              Audit your AI stack like a finance lead, not a vibes-based founder. We show
              where you are overpaying on plan tier, duplicate tools, and low-volume API
              usage, then package the result into a shareable public report.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <MetricCard label="Typical output" value="30 sec" note="Instant on-screen audit" />
              <MetricCard label="What we check" value="8 tools" note="Plans, spend, seats, fit" />
              <MetricCard label="Lead capture" value="After value" note="Email gate only post-audit" />
            </div>
          </div>

          <aside className="glass rounded-[36px] border border-(--line) p-7 md:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-(--ink-soft)">
              What this catches
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-(--ink-soft)">
              <p>Team plans with too few seats to justify them.</p>
              <p>Two coding copilots solving the same problem for the same developers.</p>
              <p>Retail API spend that is too light to beat a standard subscription.</p>
              <p>Overlapping chat assistants where one paid default is enough.</p>
            </div>
            <div className="mt-8 rounded-[28px] border border-(--line) bg-(--card-strong) p-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-(--ink-soft)">
                Abuse protection
              </p>
              <p className="mt-3 text-sm leading-7 text-(--ink-soft)">
                This MVP uses a honeypot field plus IP-based rate limiting. It is lightweight,
                invisible to good users, and strong enough for a Product Hunt-style launch.
              </p>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="glass rounded-[36px] border border-(--line) p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-(--ink-soft)">
                  Stack input
                </p>
                <h2 className="mt-2 text-3xl font-semibold">Tell us what you are paying for.</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInput(buildDefaultInput());
                  setReport(null);
                  setAuditId(null);
                }}
                className="rounded-full border border-(--line-strong) px-4 py-2 text-sm font-medium"
              >
                Reset
              </button>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <Field label="Team size">
                <input
                  type="number"
                  min={1}
                  value={input.teamSize}
                  onChange={(event) =>
                    setInput((current) => ({
                      ...current,
                      teamSize: Number(event.target.value) || 1,
                    }))
                  }
                  className="w-full rounded-2xl border border-(--line) bg-white/80 px-4 py-3"
                />
              </Field>
              <Field label="Primary use case">
                <select
                  value={input.useCase}
                  onChange={(event) =>
                    setInput((current) => ({
                      ...current,
                      useCase: event.target.value as UseCase,
                    }))
                  }
                  className="w-full rounded-2xl border border-(--line) bg-white/80 px-4 py-3"
                >
                  <option value="coding">Coding</option>
                  <option value="writing">Writing</option>
                  <option value="data">Data</option>
                  <option value="research">Research</option>
                  <option value="mixed">Mixed</option>
                </select>
              </Field>
            </div>

            <div className="mt-7 grid gap-4">
              {toolCatalog.map((tool) => {
                const row = input.tools.find((entry) => entry.toolKey === tool.key)!;
                return (
                  <article
                    key={tool.key}
                    className="rounded-[28px] border border-(--line) bg-[rgba(255,255,255,0.66)] p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <input
                            checked={row.enabled}
                            onChange={(event) =>
                              updateTool(tool.key, { enabled: event.target.checked })
                            }
                            type="checkbox"
                            className="h-5 w-5 rounded border-(--line-strong)"
                          />
                          <h3 className="text-xl font-semibold">{tool.label}</h3>
                        </div>
                        <p className="mt-2 text-sm text-(--ink-soft)">
                          {tool.vendor} · {tool.category}
                        </p>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <select
                          disabled={!row.enabled}
                          value={row.planKey}
                          onChange={(event) =>
                            updateTool(tool.key, { planKey: event.target.value })
                          }
                          className="rounded-2xl border border-(--line) bg-white/85 px-4 py-3 disabled:opacity-50"
                        >
                          {tool.plans.map((plan) => (
                            <option key={plan.key} value={plan.key}>
                              {plan.label}
                            </option>
                          ))}
                        </select>
                        <input
                          disabled={!row.enabled}
                          type="number"
                          min={0}
                          step="0.01"
                          value={row.monthlySpend}
                          onChange={(event) =>
                            updateTool(tool.key, {
                              monthlySpend: Number(event.target.value) || 0,
                            })
                          }
                          className="rounded-2xl border border-(--line) bg-white/85 px-4 py-3 disabled:opacity-50"
                          placeholder="Monthly spend"
                        />
                        <input
                          disabled={!row.enabled}
                          type="number"
                          min={1}
                          value={row.seats}
                          onChange={(event) =>
                            updateTool(tool.key, { seats: Number(event.target.value) || 1 })
                          }
                          className="rounded-2xl border border-(--line) bg-white/85 px-4 py-3 disabled:opacity-50"
                          placeholder="Seats"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleAuditSubmit}
              disabled={loading}
              className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#102229] px-6 py-4 text-base font-semibold text-[#fff7ef] transition hover:-translate-y-px disabled:opacity-60"
            >
              {loading ? "Running audit..." : "Run my audit"}
            </button>
          </section>

          <section className="glass rounded-[36px] border border-(--line) p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-(--ink-soft)">
                  Results
                </p>
                <h2 className="mt-2 text-3xl font-semibold">Your audit shows up here.</h2>
              </div>
              {report ? (
                <span className="rounded-full bg-[rgba(138,214,173,0.32)] px-4 py-2 text-sm font-medium">
                  {outlookLabel}
                </span>
              ) : null}
            </div>

            {!report ? (
              <div className="mt-10 rounded-[30px] border border-dashed border-(--line-strong) px-6 py-16 text-center text-(--ink-soft)">
                Start with the tools you actually pay for. The audit appears after value is
                calculated, and only then do we ask for an email.
              </div>
            ) : (
              <div className="mt-7 space-y-5">
                <div className="rounded-[30px] bg-[#102229] p-6 text-[#fff7ef]">
                  <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#c9e7d5]">
                        Verified savings
                      </p>
                      <h3 className="mt-3 text-5xl font-semibold tracking-tighter">
                        {currency(report.totals.monthlySavings)}
                        <span className="text-xl text-[#c9e7d5]"> / month</span>
                      </h3>
                      <p className="mt-3 max-w-xl text-[#e5efe9]">
                        {summary}
                        {summaryUsedFallback ? " This summary used the fail-safe template because the live model was unavailable." : ""}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-[#17343d] px-5 py-4">
                      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#c9e7d5]">
                        Annual savings
                      </p>
                      <p className="mt-2 text-3xl font-semibold">
                        {currency(report.totals.annualSavings)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {report.lines.map((line) => (
                    <article
                      key={line.toolKey}
                      className="rounded-[28px] border border-(--line) bg-[rgba(255,255,255,0.66)] p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold">{line.toolLabel}</h3>
                            <span className="rounded-full bg-[rgba(255,200,97,0.28)] px-3 py-1 text-xs font-mono uppercase tracking-[0.18em]">
                              {line.action}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-(--ink-soft)">
                            {line.currentPlanLabel} to {line.recommendedPlanLabel}
                          </p>
                          <p className="mt-3 text-sm leading-7 text-(--ink-soft)">
                            {line.reason}
                          </p>
                          {line.creditsNote ? (
                            <p className="mt-3 rounded-2xl bg-[rgba(138,214,173,0.24)] px-4 py-3 text-sm">
                              {line.creditsNote}
                            </p>
                          ) : null}
                        </div>
                        <div className="rounded-[22px] bg-(--card-strong) px-5 py-4 text-right">
                          <p className="font-mono text-xs uppercase tracking-[0.22em] text-(--ink-soft)">
                            Savings
                          </p>
                          <p className="mt-2 text-2xl font-semibold">
                            {currency(line.savingsMonthly)}
                          </p>
                          <p className="mt-1 text-sm text-(--ink-soft)">
                            {currency(line.currentSpend)} to {currency(line.recommendedSpend)}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="rounded-[28px] border border-(--line) bg-(--card-strong) p-5">
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-(--ink-soft)">
                    Shareable report
                  </p>
                  <div className="mt-3 flex flex-col gap-3 md:flex-row">
                    <input
                      readOnly
                      value={shareUrl}
                      className="w-full rounded-2xl border border-(--line) bg-white px-4 py-3"
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(shareUrl)}
                      className="rounded-full bg-[#102229] px-5 py-3 font-semibold text-[#fff7ef]"
                    >
                      Copy link
                    </button>
                  </div>
                </div>

                <form
                  onSubmit={handleLeadSubmit}
                  className="rounded-[30px] border border-(--line) bg-[rgba(255,255,255,0.75)] p-6"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.22em] text-(--ink-soft)">
                        Capture the report
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold">
                        {report.totals.monthlySavings >= 500
                          ? "Email this report and let Credex reach out on bigger savings."
                          : "Email this report and get notified when better optimizations appear."}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <Field label="Work email">
                      <input
                        required
                        type="email"
                        value={leadFields.email}
                        onChange={(event) =>
                          setLeadFields((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-(--line) bg-white px-4 py-3"
                      />
                    </Field>
                    <Field label="Company name">
                      <input
                        value={leadFields.companyName}
                        onChange={(event) =>
                          setLeadFields((current) => ({
                            ...current,
                            companyName: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-(--line) bg-white px-4 py-3"
                      />
                    </Field>
                    <Field label="Role">
                      <input
                        value={leadFields.role}
                        onChange={(event) =>
                          setLeadFields((current) => ({
                            ...current,
                            role: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-(--line) bg-white px-4 py-3"
                      />
                    </Field>
                    <div className="hidden">
                      <label htmlFor="website-field">Website</label>
                      <input
                        id="website-field"
                        tabIndex={-1}
                        autoComplete="off"
                        value={leadFields.honeypot}
                        onChange={(event) =>
                          setLeadFields((current) => ({
                            ...current,
                            honeypot: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={leadState === "saving"}
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-(--mint-deep) px-5 py-3 font-semibold text-white"
                  >
                    {leadState === "saving" ? "Sending..." : "Email me this audit"}
                  </button>

                  {leadState === "saved" ? (
                    <p className="mt-3 text-sm text-(--mint-deep)">
                      Your audit has been saved. Check your inbox for the confirmation email.
                    </p>
                  ) : null}
                  {leadState === "error" ? (
                    <p className="mt-3 text-sm text-(--coral)">
                      Something went wrong. Please try again.
                    </p>
                  ) : null}
                </form>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[26px] border border-(--line) bg-(--card-strong) p-5">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-(--ink-soft)">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-(--ink-soft)">{note}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}
