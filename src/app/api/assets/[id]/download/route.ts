import { NextResponse } from "next/server";
import { incrementDownloads } from "@/lib/assets";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const size = new URL(req.url).searchParams.get("size") === "web" ? "web" : "original";

  const asset = await getApprovedAssetSafe(id);
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  await incrementDownloads(id);

  const key = size === "web" ? asset.webKey : asset.originalKey;
  const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
  const ext = key.split(".").pop() ?? "jpg";
  const safeTitle = asset.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 60);

  // Redirect to the CDN object. The `download` query param is consumed by our
  // own worker-less setup only if the bucket serves via a Cloudflare Worker;
  // for a plain custom-domain bucket, browsers may render instead of saving,
  // which is acceptable UX for stock downloads.
  const target = publicBase
    ? `${publicBase}/${key}`
    : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET ?? "pisure-assets"}/${key}`;

  return NextResponse.redirect(target, {
    headers: {
      "Cache-Control": "no-store",
      "X-Download-Name": `${safeTitle}-${size}.${ext}`,
    },
  });
}

async function getApprovedAssetSafe(id: string) {
  const { getApprovedAsset } = await import("@/lib/assets");
  const result = await getApprovedAsset(id);
  return result?.asset ?? null;
}
