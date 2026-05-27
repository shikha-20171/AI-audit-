import { promises as fs } from "node:fs";
import path from "node:path";

import { AuditResult, LeadCapturePayload, StoredAudit } from "@/lib/types";
import { slugId } from "@/lib/utils";

const dataDir = path.join(process.cwd(), ".data");
const auditsPath = path.join(dataDir, "audits.json");
const leadsPath = path.join(dataDir, "leads.json");

async function ensureDataFile(filePath: string) {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]", "utf8");
  }
}

async function readJson<T>(filePath: string): Promise<T[]> {
  await ensureDataFile(filePath);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T[];
}

async function writeJson<T>(filePath: string, value: T[]) {
  await ensureDataFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

function hasSupabaseConfig() {
  return Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_AUDITS_TABLE &&
      process.env.SUPABASE_LEADS_TABLE,
  );
}

async function supabaseInsert(table: string, payload: Record<string, unknown>) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Supabase insert failed with ${response.status}`);
  }

  return response.json();
}

async function supabaseSelectById<T>(table: string, id: string) {
  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/${table}?id=eq.${id}&select=*`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Supabase select failed with ${response.status}`);
  }

  const rows = (await response.json()) as T[];
  return rows[0] ?? null;
}

export async function saveAudit(report: AuditResult) {
  const stored: StoredAudit = {
    id: slugId(),
    publicReport: report,
  };

  if (hasSupabaseConfig()) {
    await supabaseInsert(process.env.SUPABASE_AUDITS_TABLE!, stored);
    return stored;
  }

  const existing = await readJson<StoredAudit>(auditsPath);
  existing.unshift(stored);
  await writeJson(auditsPath, existing);
  return stored;
}

export async function getAuditById(id: string) {
  if (hasSupabaseConfig()) {
    return supabaseSelectById<StoredAudit>(process.env.SUPABASE_AUDITS_TABLE!, id);
  }

  const audits = await readJson<StoredAudit>(auditsPath);
  return audits.find((audit) => audit.id === id) ?? null;
}

export async function saveLead(payload: LeadCapturePayload) {
  const record = {
    id: slugId(),
    ...payload,
    createdAt: new Date().toISOString(),
  };

  if (hasSupabaseConfig()) {
    await supabaseInsert(process.env.SUPABASE_LEADS_TABLE!, record);
    return record;
  }

  const existing = await readJson<Record<string, unknown>>(leadsPath);
  existing.unshift(record);
  await writeJson(leadsPath, existing);
  return record;
}
