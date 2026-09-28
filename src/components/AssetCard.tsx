import Link from "next/link";
import type { AssetCard as AssetCardType } from "@/lib/assets";

export default function AssetCard({ asset }: { asset: AssetCardType }) {
  const aspect = asset.width && asset.height ? asset.width / asset.height : 4 / 3;

  return (
    <div className="asset-card break-inside-avoid mb-4">
      <Link href={`/asset/${asset.id}`} className="group relative block overflow-hidden rounded-lg">
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
                ? { backgroundImage: `url(${asset.blurDataURL})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-white opacity-0 transition group-hover:opacity-100">
          <p className="truncate text-sm font-semibold">{asset.title}</p>
          {asset.username && <p className="text-xs opacity-90">by {asset.username}</p>}
        </div>
      </Link>
    </div>
  );
}
