import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const reportSchema = z.object({
  assetId: z.string().uuid(),
  reason: z.enum([
    "copyright",
    "no-model-release",
    "inappropriate",
    "not-african-content",
    "other",
  ]),
  details: z.string().trim().max(1000).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const session = await getSession();
  await db.insert(reports).values({
    assetId: parsed.data.assetId,
    reporterId: session?.user.id ?? null,
    reason: parsed.data.reason,
    details: parsed.data.details ?? null,
  });

  return NextResponse.json({ ok: true });
}
