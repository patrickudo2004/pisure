import { NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { assets, profiles } from "@/db/schema";
import { publicUrl, deleteObjects } from "@/lib/r2";
import { requireAdminApi } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db
    .select({
      id: assets.id,
      title: assets.title,
      description: assets.description,
      category: assets.category,
      tags: assets.tags,
      storage: {
        originalKey: assets.originalKey,
        webKey: assets.webKey,
        thumbKey: assets.thumbKey,
      },
      width: assets.width,
      height: assets.height,
      createdAt: assets.createdAt,
      username: profiles.username,
      ownershipConfirmed: assets.ownershipConfirmed,
      modelReleaseConfirmed: assets.modelReleaseConfirmed,
    })
    .from(assets)
    .leftJoin(profiles, eq(assets.uploaderId, profiles.id))
    .where(eq(assets.status, "pending"))
    .orderBy(desc(assets.createdAt))
    .limit(60);

  return NextResponse.json({
    assets: rows.map((r) => ({
      ...r,
      thumbUrl: publicUrl(r.storage.thumbKey),
      originalUrl: publicUrl(r.storage.originalKey),
    })),
  });
}

const actionSchema = z.object({
  assetId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  reason: z.string().trim().max(500).optional(),
});

export async function POST(req: Request) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const { assetId, action } = parsed.data;

  const [asset] = await db.select().from(assets).where(eq(assets.id, assetId)).limit(1);
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  if (action === "approve") {
    await db
      .update(assets)
      .set({ status: "approved", rejectReason: null })
      .where(eq(assets.id, assetId));
    return NextResponse.json({ ok: true });
  }

  // Reject: delete the R2 objects first (admin credentials), then the row.
  try {
    await deleteObjects([asset.originalKey, asset.webKey, asset.thumbKey]);
  } catch (err) {
    console.error("Failed to delete R2 objects for rejected asset", assetId, err);
    return NextResponse.json(
      { error: "Could not delete stored files; asset remains pending." },
      { status: 500 },
    );
  }

  await db.delete(assets).where(eq(assets.id, assetId));
  return NextResponse.json({ ok: true });
}
