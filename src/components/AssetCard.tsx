import Link from "next/link";
import type { AssetCard as AssetCardType } from "@/lib/assets";

export default function AssetCard({ asset }: { asset: AssetCardType }) {
  const aspect = asset.width && asset.height ? asset.width / asset.height : 4 / 3;

  return (
    <div className="asset-card break-inside-avoid mb-4">
      <Link
        href={`/asset/${asset.id}`}
        className="group relative block overflow-hidden rounded-lg"
      >
        <div style={{ aspectRatio: `${aspect}` }} className="relative w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.thumbUrl}
            alt={asset.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            style={
              asset.blurDataURL
                ? {
                    backgroundImage: `url(${asset.blurDataURL})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />
        </div>

        {/* Persistent gradient + info; download button appears on hover */}
        <div className="card-overlay pointer-events-none absolute inset-0 opacity-90 transition group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <div className="min-w-0 text-white">
            <p className="truncate text-sm font-semibold">{asset.title}</p>
            {asset.username && (
              <p className="truncate text-xs text-white/75">by {asset.username}</p>
            )}
          </div>
          <span
            className="translate-y-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-gray-900 opacity-0 shadow transition group-hover:translate-y-0 group-hover:opacity-100"
            aria-hidden="true"
          >
            Download
          </span>
        </div>
      </Link>
    </div>
  );
}
