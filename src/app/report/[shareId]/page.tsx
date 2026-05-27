import Link from "next/link";
import { notFound } from "next/navigation";

import { getAuditById } from "@/lib/storage";
import { currency } from "@/lib/utils";

type Props = {
  params: Promise<{ shareId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { shareId } = await params;
  const stored = await getAuditById(shareId);

  if (!stored) {
    return {};
  }

  const savings = currency(stored.publicReport.totals.monthlySavings);

  return {
    title: `${savings}/mo in AI savings | SpendSignal`,
    description: stored.publicReport.summaryFallback,
    openGraph: {
      title: `${savings}/mo in AI savings | SpendSignal`,
      description: stored.publicReport.summaryFallback,
      images: [`/report/${shareId}/opengraph-image`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${savings}/mo in AI savings | SpendSignal`,
      description: stored.publicReport.summaryFallback,
      images: [`/report/${shareId}/opengraph-image`],
    },
  };
}

export default async function ReportPage({ params }: Props) {
  const { shareId } = await params;
  const stored = await getAuditById(shareId);

  if (!stored) {
    notFound();
  }

  const { publicReport: report } = stored;

  return (
    <main className="min-h-screen px-5 py-10 md:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="glass overflow-hidden rounded-[32px] border border-[var(--line)] p-8 shadow-[0_30px_80px_rgba(16,34,41,0.12)]">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--ink-soft)]">
            Public audit
          </p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-semibold md:text-6xl">
                {currency(report.totals.monthlySavings)}
                <span className="text-[var(--ink-soft)]"> / month saved</span>
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-[var(--ink-soft)]">
                {report.summaryFallback}
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--line)] bg-[var(--card-strong)] px-5 py-4">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--ink-soft)]">
                Annual upside
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {currency(report.totals.annualSavings)}
              </p>
            </div>
          </div>
        </div>

        <section className="grid gap-4">
          {report.lines.map((line) => (
            <article
              key={line.toolKey}
              className="glass rounded-[28px] border border-[var(--line)] p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">{line.toolLabel}</h2>
                  <p className="text-sm text-[var(--ink-soft)]">
                    {line.currentPlanLabel} to {line.recommendedPlanLabel}
                  </p>
                  <p className="max-w-3xl text-[var(--ink-soft)]">{line.reason}</p>
                  {line.creditsNote ? (
                    <p className="rounded-2xl bg-[rgba(138,214,173,0.2)] px-4 py-3 text-sm">
                      {line.creditsNote}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-[22px] bg-[var(--card-strong)] px-5 py-4 text-right">
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                    Impact
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {currency(line.savingsMonthly)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    {currency(line.currentSpend)} to {currency(line.recommendedSpend)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <div className="flex flex-col gap-3 rounded-[28px] border border-[var(--line)] bg-[#102229] px-6 py-7 text-[#fff7ef] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#c9e7d5]">
              Want your own audit?
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Run your stack through SpendSignal.</h2>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[#fff7ef] px-5 py-3 font-semibold text-[#102229]"
          >
            Start a free audit
          </Link>
        </div>
      </div>
    </main>
  );
}
