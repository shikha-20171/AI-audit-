import { NextRequest, NextResponse } from "next/server";

import { sendAuditEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { getAuditById, saveLead } from "@/lib/storage";
import { LeadCapturePayload } from "@/lib/types";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const rate = checkRateLimit(`lead:${ip}`, 6, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again shortly." },
      { status: 429 },
    );
  }

  const body = (await request.json()) as LeadCapturePayload;

  if (body.honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!body.auditId || !body.email) {
    return NextResponse.json({ error: "Audit ID and email are required." }, { status: 400 });
  }

  const audit = await getAuditById(body.auditId);
  if (!audit) {
    return NextResponse.json({ error: "Audit not found." }, { status: 404 });
  }

  await saveLead(body);
  const emailResult = await sendAuditEmail(body.email, body.auditId, audit.publicReport);

  return NextResponse.json({
    ok: true,
    highSavings: audit.publicReport.totals.monthlySavings >= 500,
    emailDelivered: emailResult.delivered,
  });
}
