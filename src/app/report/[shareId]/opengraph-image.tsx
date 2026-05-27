import { ImageResponse } from "next/og";

import { getAuditById } from "@/lib/storage";
import { currency } from "@/lib/utils";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type Props = {
  params: Promise<{ shareId: string }>;
};

export default async function Image({ params }: Props) {
  const { shareId } = await params;
  const stored = await getAuditById(shareId);
  const report = stored?.publicReport;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #fff9f3 0%, #f4ecdf 55%, #d8f0df 100%)",
          color: "#102229",
          padding: "48px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              opacity: 0.72,
            }}
          >
            SpendSignal
          </div>
          <div style={{ fontSize: 86, fontWeight: 700, lineHeight: 1 }}>
            {currency(report?.totals.monthlySavings ?? 0)}/mo
          </div>
          <div style={{ fontSize: 34, maxWidth: 900, lineHeight: 1.3 }}>
            Verified AI tooling savings for a {report?.input.teamSize ?? 0}-person team
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ fontSize: 28, maxWidth: 760, opacity: 0.82 }}>
            {report?.summaryFallback ?? "See where your startup is overspending on AI tools."}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "8px",
            }}
          >
            <div style={{ fontSize: 18, textTransform: "uppercase", letterSpacing: "0.24em" }}>
              Annual upside
            </div>
            <div style={{ fontSize: 42, fontWeight: 700 }}>
              {currency(report?.totals.annualSavings ?? 0)}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
