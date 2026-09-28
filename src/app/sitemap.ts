import type { MetadataRoute } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { assets } from "@/db/schema";

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://pisure.com").replace(/\/$/, "");

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/license", "/terms"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.3,
  }));

  const categories = [
    "People",
    "Urban",
    "Culture",
    "Nature",
    "Wildlife",
    "Food",
    "Business",
    "Other",
  ].map((c) => ({
    url: `${base}/category/${c.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  let assetRoutes: MetadataRoute.Sitemap = [];
  try {
    const rows = await db
      .select({ id: assets.id, createdAt: assets.createdAt })
      .from(assets)
      .where(eq(assets.status, "approved"))
      .orderBy(desc(assets.createdAt))
      .limit(5000);
    assetRoutes = rows.map((r) => ({
      url: `${base}/asset/${r.id}`,
      lastModified: r.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB not reachable at build time — ship the static part only.
  }

  return [...staticRoutes, ...categories, ...assetRoutes];
}
