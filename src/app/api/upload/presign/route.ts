import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { auth } from "@/lib/auth";
import { buildKeys, newAssetId, presignUpload } from "@/lib/r2";

export const runtime = "nodejs";

const CATEGORIES = [
  "People",
  "Urban",
  "Culture",
  "Nature",
  "Wildlife",
  "Food",
  "Business",
  "Other",
] as const;

const presignSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(2000).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  category: z.enum(CATEGORIES),
  mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
  sizeBytes: z.number().int().min(1).max(25 * 1024 * 1024),
  width: z.number().int().min(200).max(12000),
  height: z.number().int().min(200).max(12000),
  blurDataURL: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)
    .max(8_000),
  ownershipConfirmed: z.literal(true),
  modelReleaseConfirmed: z.boolean(),
  fileExt: z.string().regex(/^(jpe?g|png|webp)$/i),
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = presignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const assetId = newAssetId();
  const keys = buildKeys(session.user.id, assetId, data.fileExt);

  await db.insert(assets).values({
    id: assetId,
    title: data.title,
    description: data.description ?? null,
    tags: data.tags,
    category: data.category,
    status: "pending",
    uploaderId: session.user.id,
    originalKey: keys.originalKey,
    webKey: keys.webKey,
    thumbKey: keys.thumbKey,
    blurDataURL: data.blurDataURL,
    width: data.width,
    height: data.height,
    sizeBytes: data.sizeBytes,
    mime: data.mime,
    ownershipConfirmed: true,
    modelReleaseConfirmed: data.modelReleaseConfirmed,
  });

  const uploads = await Promise.all([
    presignUpload(keys.originalKey, data.mime),
    presignUpload(keys.webKey, "image/jpeg"),
    presignUpload(keys.thumbKey, "image/jpeg"),
  ]);

  return NextResponse.json({
    assetId,
    uploads: [
      { field: "original", key: keys.originalKey, url: uploads[0] },
      { field: "web", key: keys.webKey, url: uploads[1] },
      { field: "thumb", key: keys.thumbKey, url: uploads[2] },
    ],
  });
}
