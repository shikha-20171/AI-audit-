import { AuditResult } from "@/lib/types";
import { currency } from "@/lib/utils";

export async function sendAuditEmail(email: string, auditId: string, result: AuditResult) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return { delivered: false, reason: "Resend env vars are not configured." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const highSavings = result.totals.monthlySavings >= 500;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #102229;">
      <h1 style="margin-bottom: 8px;">Your SpendSignal audit is ready</h1>
      <p>You are currently spending <strong>${currency(result.totals.monthlySpend)}</strong> per month on AI tools.</p>
      <p>We found <strong>${currency(result.totals.monthlySavings)}</strong> in monthly savings and <strong>${currency(result.totals.annualSavings)}</strong> per year in verified plan-fit optimizations.</p>
      <p>Public report: <a href="${appUrl}/report/${auditId}">${appUrl}/report/${auditId}</a></p>
      <p>${highSavings ? "Credex may be able to unlock additional savings through discounted credits, and the team may follow up." : "We will keep you posted when new pricing or optimization opportunities affect your stack."}</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to: [email],
      subject: "Your AI spend audit from SpendSignal",
      html,
    }),
  });

  return {
    delivered: response.ok,
    reason: response.ok ? undefined : `Resend returned ${response.status}`,
  };
}
