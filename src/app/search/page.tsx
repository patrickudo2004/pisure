import Link from "next/link";
import AssetGrid from "@/components/AssetGrid";
import { searchApprovedAssets } from "@/lib/assets";

export const dynamic = "force-dynamic";

export const metadata = { title: "Search" };

const PAGE_SIZE = 24;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const query = (q ?? "").trim().slice(0, 100);
  const pageNum = Math.max(1, Number(page) || 1);
  const assets = query
    ? await searchApprovedAssets(query, PAGE_SIZE, (pageNum - 1) * PAGE_SIZE)
    : [];
  const hasNext = assets.length === PAGE_SIZE;

  const baseParams = (p: number) =>
    `/search?q=${encodeURIComponent(query)}${p > 1 ? `&page=${p}` : ""}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">
        {query ? (
          <>
            Results for <span className="text-accent">“{query}”</span>
          </>
        ) : (
          "Search"
        )}
      </h1>
      <form action="/search" method="get" className="mt-6 flex max-w-md">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search African visuals…"
          className="flex-1 rounded-l-md border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-r-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Search
        </button>
      </form>

      <div className="mt-10">
        {query ? (
          <AssetGrid
            assets={assets}
            emptyMessage={`No visuals found for “${query}”. Try a different keyword.`}
            emptyTags={["Lagos", "Market", "Culture", "Wildlife", "Wedding"]}
          />
        ) : (
          <p className="text-muted">
            Type a keyword above, or browse{" "}
            <Link href="/" className="text-accent hover:underline">
              the latest visuals
            </Link>
            .
          </p>
        )}
      </div>

      {query && (
        <div className="mt-8 flex justify-center gap-3">
          {pageNum > 1 && (
            <Link
              href={baseParams(pageNum - 1)}
              className="rounded-md border border-border px-4 py-2 text-sm hover:border-accent"
            >
              ← Previous
            </Link>
          )}
          {hasNext && (
            <Link
              href={baseParams(pageNum + 1)}
              className="rounded-md border border-border px-4 py-2 text-sm hover:border-accent"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
