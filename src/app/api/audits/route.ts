import { NextRequest, NextResponse } from "next/server";

import { runAudit } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateSummary } from "@/lib/summary";
import { saveAudit } from "@/lib/storage";
import { AuditInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const rate = checkRateLimit(`audit:${ip}`, 12, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many audits. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  const input = (await request.json()) as AuditInput;
  const report = runAudit(input);
  const stored = await saveAudit(report);
  const summary = await generateSummary(report);

  return NextResponse.json({
    id: stored.id,
    report,
    summary: summary.summary,
    summaryUsedFallback: summary.usedFallback,
  });
}
