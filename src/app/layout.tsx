import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "SpendSignal | AI spend audits for modern teams",
  description:
    "Audit your AI tool stack, find overspend, and uncover practical savings across ChatGPT, Claude, Cursor, Copilot, Gemini, and API usage.",
  openGraph: {
    title: "SpendSignal | AI spend audits for modern teams",
    description:
      "See where your startup is overspending on AI tools and what to change next.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendSignal | AI spend audits for modern teams",
    description:
      "See where your startup is overspending on AI tools and what to change next.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
