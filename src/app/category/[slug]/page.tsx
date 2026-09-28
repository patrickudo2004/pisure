import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AssetGrid from "@/components/AssetGrid";
import { listApprovedAssetsByCategory } from "@/lib/assets";

export const dynamic = "force-dynamic";

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

const slugToCategory = new Map(
  CATEGORIES.map((c) => [c.toLowerCase() as string, c]),
);

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = slugToCategory.get(slug);
  if (!category) return { title: "Not found" };
  return {
    title: `${category} Photos`,
    description: `Royalty-free ${category.toLowerCase()} photos from across Africa, free under CC BY 4.0.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = slugToCategory.get(slug);
  if (!category) notFound();

  const assets = await listApprovedAssetsByCategory(category, 60);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">{category} visuals</h1>
      <p className="mt-2 text-muted">
        Royalty-free {category.toLowerCase()} photography from across Africa.
      </p>
      <div className="mt-10">
        <AssetGrid
          assets={assets}
          emptyMessage={`No ${category.toLowerCase()} visuals yet — be the first to upload.`}
        />
      </div>
    </div>
  );
}
