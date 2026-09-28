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
  const assets = await listApprovedAssets(PAGE_SIZE, (pageNum - 1) * PAGE_SIZE);
  const hasNext = assets.length === PAGE_SIZE;

  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Visuals for Africa, <span className="text-accent">by Africa</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Discover and download royalty-free photos showcasing the beauty and
            diversity of Africa — free for everyone under CC BY 4.0.
          </p>
          <form action="/search" method="get" className="mx-auto mt-8 flex max-w-md">
            <input
              type="search"
              name="q"
              placeholder="Search: Lagos, market, wedding…"
              className="flex-1 rounded-l-md border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="rounded-r-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Search
            </button>
          </form>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat.toLowerCase()}`}
                className="rounded-full border border-border bg-background px-3 py-1 text-sm hover:border-accent hover:text-accent"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Latest visuals</h2>
          <span className="text-sm text-muted">Page {pageNum}</span>
        </div>
        <AssetGrid
          assets={assets}
          emptyMessage="No visuals yet. Be the first to upload Africa's story."
          emptyTags={["Nigeria", "Kenya", "Market day", "Wedding"]}
        />
        <div className="mt-8 flex justify-center gap-3">
          {pageNum > 1 && (
            <Link
              href={pageNum === 2 ? "/" : `/?page=${pageNum - 1}`}
              className="rounded-md border border-border px-4 py-2 text-sm hover:border-accent"
            >
              ← Newer
            </Link>
          )}
          {hasNext && (
            <Link
              href={`/?page=${pageNum + 1}`}
              className="rounded-md border border-border px-4 py-2 text-sm hover:border-accent"
            >
              Older →
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
