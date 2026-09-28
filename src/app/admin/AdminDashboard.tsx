"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type PendingAsset = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tags: string[];
  width: number;
  height: number;
  createdAt: string;
  username: string | null;
  thumbUrl: string;
  originalUrl: string;
  ownershipConfirmed: boolean;
  modelReleaseConfirmed: boolean;
};

export default function AdminDashboard() {
  const [assets, setAssets] = useState<PendingAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/assets");
      if (res.status === 403) {
        toast.error("Admin access required.");
        return;
      }
      const data = await res.json();
      setAssets(data.assets ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(assetId: string, action: "approve" | "reject") {
    setBusyId(assetId);
    try {
      const res = await fetch("/api/admin/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, action }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(action === "approve" ? "Approved" : "Rejected and deleted");
        setAssets((prev) => prev.filter((a) => a.id !== assetId));
      } else {
        toast.error(data.error ?? "Action failed");
      }
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-muted">Loading queue…</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Moderation queue</h1>
      <p className="mt-1 text-muted">{assets.length} pending upload(s)</p>

      {assets.length === 0 ? (
        <p className="py-16 text-center text-muted">No pending assets. 🎉</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <div key={asset.id} className="rounded-lg border border-border p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.thumbUrl}
                alt={asset.title}
                className="h-48 w-full rounded-md object-cover"
              />
              <h3 className="mt-3 font-semibold">{asset.title}</h3>
              <p className="text-sm text-muted">
                by {asset.username ?? "unknown"} · {asset.width}×{asset.height} ·{" "}
                {asset.category}
              </p>
              {asset.description && (
                <p className="mt-1 line-clamp-2 text-sm">{asset.description}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1 text-xs">
                {asset.ownershipConfirmed && (
                  <span className="rounded bg-surface px-2 py-0.5">ownership ✓</span>
                )}
                {asset.modelReleaseConfirmed && (
                  <span className="rounded bg-surface px-2 py-0.5">releases ✓</span>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => act(asset.id, "approve")}
                  disabled={busyId === asset.id}
                  className="flex-1 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => act(asset.id, "reject")}
                  disabled={busyId === asset.id}
                  className="flex-1 rounded-md border border-border px-4 py-2 text-sm hover:border-red-500 hover:text-red-500 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
              <a
                href={asset.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-center text-xs text-muted hover:text-foreground"
              >
                View original in new tab
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
