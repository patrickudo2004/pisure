import Link from "next/link";
import AssetGrid from "@/components/AssetGrid";
import { listApprovedAssets } from "@/lib/assets";

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

const PAGE_SIZE = 24;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  // One extra row so the hero has a featured image even on page > 1
  const featured = pageNum === 1 ? (await listApprovedAssets(1))[0] : null;
  const assets = await listApprovedAssets(
    PAGE_SIZE + (featured ? 1 : 0),
    (pageNum - 1) * PAGE_SIZE + (featured ? 1 : 0),
  );
  const hasNext = assets.length === PAGE_SIZE;

  return (
    <div>
      {/* Photo-first hero: the newest image IS the header */}
      <section className="relative">
        {featured ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${featured.webUrl})` }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
          </>
        ) : (
          <div className="absolute inset-0 bg-surface" aria-hidden="true" />
        )}

        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8 md:py-32">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold text-white drop-shadow-md md:text-6xl">
            Free high-resolution{" "}
            <span className="text-accent">African visuals</span>
          </h1>
          <form
            action="/search"
            method="get"
            className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-full bg-white shadow-lg"
          >
            <input
              type="search"
              name="q"
              placeholder="Search photos…"
              aria-label="Search photos"
              className="flex-1 bg-transparent px-5 py-3 text-sm text-gray-900 outline-none"
            />
            <button
              type="submit"
              className="bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Search
            </button>
          </form>
          <p className="mt-4 text-sm text-white/80">
            Free for everyone under CC BY 4.0 — credit the creator, that&apos;s it.
          </p>
        </div>
      </section>

      {/* Categories */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2 px-4 py-4 sm:px-6 lg:px-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/category/${cat.toLowerCase()}`}
              className="rounded-full border border-border px-4 py-1.5 text-sm transition hover:border-accent hover:text-accent"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AssetGrid
          assets={assets}
          emptyMessage="The gallery is warming up."
          emptyTags={["Lagos", "Nairobi", "Market day", "Wedding"]}
        />
        {hasNext && (
          <div className="mt-10 flex justify-center">
            <Link
              href={`/?page=${pageNum + 1}`}
              className="rounded-full border border-border px-6 py-2.5 text-sm font-medium transition hover:border-accent hover:text-accent"
            >
              Load more
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
