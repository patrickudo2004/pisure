import Link from "next/link";
import type { AssetCard as AssetCardType } from "@/lib/assets";
import AssetCard from "./AssetCard";

export default function AssetGrid({
  assets,
  emptyMessage,
  emptyTags,
}: {
  assets: AssetCardType[];
  emptyMessage?: string;
  emptyTags?: string[];
}) {
  if (assets.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted">{emptyMessage ?? "Nothing here yet."}</p>
        {emptyTags && emptyTags.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {emptyTags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-border px-3 py-1 text-sm hover:border-accent hover:text-accent"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
