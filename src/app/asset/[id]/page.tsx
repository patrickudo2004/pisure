import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AssetGrid from "@/components/AssetGrid";
import {
  getApprovedAsset,
  getRelatedAssets,
  attributionLine,
} from "@/lib/assets";
import { publicUrl } from "@/lib/r2";
import AssetActions from "@/components/AssetActions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getApprovedAsset(id);
  if (!result) return { title: "Asset not found" };

  const { asset, username } = result;
  const title = `${asset.title} — free stock photo`;
  const description =
    asset.description ??
    `Download “${asset.title}” by ${username ?? "a Pisure creator"} for free under CC BY 4.0.`;

  return {
    title: asset.title,
    description,
    alternates: { canonical: `/asset/${asset.id}` },
    openGraph: {
      title,
      description,
      images: [{ url: publicUrl(asset.webKey), width: asset.width, height: asset.height }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [publicUrl(asset.webKey)],
    },
  };
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getApprovedAsset(id);
  if (!result) notFound();

  const { asset, username } = result;
  const related = await getRelatedAssets(asset.id, asset.category, asset.tags);
  const attribution = attributionLine(asset.title, username);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={publicUrl(asset.webKey)}
            alt={asset.title}
            className="max-h-[80vh] w-auto rounded-lg shadow-lg"
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold">{asset.title}</h1>
          <p className="mt-1 text-muted">
            by{" "}
            {username ? (
              <Link href={`/profile/${username}`} className="text-accent hover:underline">
                {username}
              </Link>
            ) : (
              "Unknown creator"
            )}
          </p>
          {asset.description && (
            <p className="mt-4 text-sm leading-relaxed">{asset.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/category/${asset.category.toLowerCase()}`}
              className="rounded-full bg-surface px-3 py-1 text-xs font-medium hover:text-accent"
            >
              {asset.category}
            </Link>
            {asset.tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-border px-3 py-1 text-xs hover:border-accent hover:text-accent"
              >
                {tag}
              </Link>
            ))}
          </div>

          <dl className="mt-6 space-y-1 text-sm text-muted">
            <div className="flex justify-between">
              <dt>Dimensions</dt>
              <dd className="text-foreground">
                {asset.width} × {asset.height}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>File size</dt>
              <dd className="text-foreground">{(asset.sizeBytes / 1024 / 1024).toFixed(1)} MB</dd>
            </div>
            <div className="flex justify-between">
              <dt>Downloads</dt>
              <dd className="text-foreground">{asset.downloads}</dd>
            </div>
          </dl>

          <AssetActions assetId={asset.id} attribution={attribution} />

          <div className="mt-6 rounded-lg bg-surface p-4 text-sm">
            <p className="font-medium">License: CC BY 4.0</p>
            <p className="mt-1 text-muted">
              Free for personal and commercial use with attribution.{" "}
              <Link href="/license" className="text-accent hover:underline">
                Read the license
              </Link>
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-semibold">Related visuals</h2>
          <AssetGrid assets={related} />
        </section>
      )}
    </div>
  );
}
