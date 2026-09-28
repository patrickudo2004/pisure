import { and, arrayOverlaps, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { assets, profiles } from "@/db/schema";
import { publicUrl } from "@/lib/r2";

/** Shape consumed by all grid cards. */
export type AssetCard = {
  id: string;
  title: string;
  width: number;
  height: number;
  thumbUrl: string;
  webUrl: string;
  blurDataURL: string | null;
  username: string | null;
};

const cardColumns = {
  id: assets.id,
  title: assets.title,
  width: assets.width,
  height: assets.height,
  thumbKey: assets.thumbKey,
  webKey: assets.webKey,
  blurDataURL: assets.blurDataURL,
  username: profiles.username,
};

export function assetDetailUrl(id: string) {
  return `/asset/${id}`;
}

export function attributionLine(title: string, username: string | null) {
  const creator = username ? `${username} on Pisure` : "Pisure";
  return `"${title}" by ${creator}, licensed under CC BY 4.0`;
}

export async function listApprovedAssets(limit = 24, offset = 0): Promise<AssetCard[]> {
  const rows = await db
    .select(cardColumns)
    .from(assets)
    .leftJoin(profiles, eq(assets.uploaderId, profiles.id))
    .where(eq(assets.status, "approved"))
    .orderBy(desc(assets.createdAt))
    .limit(limit)
    .offset(offset);

  return rows.map(({ thumbKey, webKey, ...rest }) => ({
    ...rest,
    thumbUrl: publicUrl(thumbKey),
    webUrl: publicUrl(webKey),
  }));
}

export async function searchApprovedAssets(
  q: string,
  limit = 24,
  offset = 0,
): Promise<AssetCard[]> {
  const term = `%${q}%`;
  const rows = await db
    .select(cardColumns)
    .from(assets)
    .leftJoin(profiles, eq(assets.uploaderId, profiles.id))
    .where(
      and(
        eq(assets.status, "approved"),
        or(
          ilike(assets.title, term),
          ilike(assets.description, term),
          // category is a Postgres enum — cast to text before ILIKE
          sql`${assets.category}::text ilike ${term}`,
          // explicit text[] cast so the driver binds the array correctly
          sql`${assets.tags} && ARRAY[${q}]::text[]`,
        ),
      ),
    )
    .orderBy(desc(assets.createdAt))
    .limit(limit)
    .offset(offset);

  return rows.map(({ thumbKey, webKey, ...rest }) => ({
    ...rest,
    thumbUrl: publicUrl(thumbKey),
    webUrl: publicUrl(webKey),
  }));
}

export async function listApprovedAssetsByCategory(
  category: string,
  limit = 24,
  offset = 0,
): Promise<AssetCard[]> {
  const rows = await db
    .select(cardColumns)
    .from(assets)
    .leftJoin(profiles, eq(assets.uploaderId, profiles.id))
    .where(
      and(eq(assets.status, "approved"), sql`${assets.category} = ${category}`),
    )
    .orderBy(desc(assets.createdAt))
    .limit(limit)
    .offset(offset);

  return rows.map(({ thumbKey, webKey, ...rest }) => ({
    ...rest,
    thumbUrl: publicUrl(thumbKey),
    webUrl: publicUrl(webKey),
  }));
}

export async function countApprovedAssets() {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(assets)
    .where(eq(assets.status, "approved"));
  return row?.count ?? 0;
}

export async function getApprovedAsset(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const rows = await db
    .select({
      asset: assets,
      username: profiles.username,
      fullName: profiles.fullName,
    })
    .from(assets)
    .leftJoin(profiles, eq(assets.uploaderId, profiles.id))
    .where(and(eq(assets.id, id), eq(assets.status, "approved")))
    .limit(1);
  return rows[0] ?? null;
}

export async function getRelatedAssets(
  id: string,
  category: string,
  tags: string[],
  limit = 6,
) {
  const rows = await db
    .select(cardColumns)
    .from(assets)
    .leftJoin(profiles, eq(assets.uploaderId, profiles.id))
    .where(
      and(
        eq(assets.status, "approved"),
        sql`${assets.id} <> ${id}`,
        or(
          sql`${assets.category} = ${category}`,
          sql`${assets.tags} && ARRAY[${sql.join(tags.map((t) => sql`${t}`), sql`, `)}]::text[]`,
        ),
      ),
    )
    .orderBy(desc(assets.createdAt))
    .limit(limit);
  return rows.map(({ thumbKey, webKey, ...rest }) => ({
    ...rest,
    thumbUrl: publicUrl(thumbKey),
    webUrl: publicUrl(webKey),
  }));
}

export async function listApprovedAssetsByUploader(
  uploaderId: string,
  limit = 60,
): Promise<AssetCard[]> {
  const rows = await db
    .select(cardColumns)
    .from(assets)
    .leftJoin(profiles, eq(assets.uploaderId, profiles.id))
    .where(and(eq(assets.status, "approved"), eq(assets.uploaderId, uploaderId)))
    .orderBy(desc(assets.createdAt))
    .limit(limit);
  return rows.map(({ thumbKey, webKey, ...rest }) => ({
    ...rest,
    thumbUrl: publicUrl(thumbKey),
    webUrl: publicUrl(webKey),
  }));
}

export async function incrementDownloads(id: string) {
  await db
    .update(assets)
    .set({ downloads: sql`${assets.downloads} + 1` })
    .where(eq(assets.id, id));
}
