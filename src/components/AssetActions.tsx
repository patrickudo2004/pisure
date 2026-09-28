"use client";

import { useState } from "react";
import { toast } from "sonner";

const REPORT_REASONS = [
  { value: "copyright", label: "Copyright / not their work" },
  { value: "no-model-release", label: "Recognizable person without consent" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "not-african-content", label: "Not Africa-related" },
  { value: "other", label: "Other" },
] as const;

export default function AssetActions({
  assetId,
  attribution,
}: {
  assetId: string;
  attribution: string;
}) {
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState<string>("");
  const [reportDetails, setReportDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCopyAttribution() {
    try {
      await navigator.clipboard.writeText(attribution);
      toast.success("Attribution copied");
    } catch {
      toast.error("Could not copy — long-press to select the text instead.");
    }
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportReason) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          reason: reportReason,
          details: reportDetails || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Report received. Thank you.");
        setShowReport(false);
        setReportReason("");
        setReportDetails("");
      } else {
        toast.error("Could not submit report. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex gap-2">
        <a
          href={`/api/assets/${assetId}/download?size=original`}
          className="flex-1 rounded-md bg-accent px-4 py-2.5 text-center text-sm font-medium text-accent-foreground hover:opacity-90"
          onClick={() => toast.success("Download started")}
        >
          Download Original
        </a>
        <a
          href={`/api/assets/${assetId}/download?size=web`}
          className="flex-1 rounded-md border border-border px-4 py-2.5 text-center text-sm font-medium hover:border-accent"
          onClick={() => toast.success("Download started")}
        >
          Web size (1280px)
        </a>
      </div>
      <button
        onClick={handleCopyAttribution}
        className="mt-2 w-full rounded-md border border-border px-4 py-2.5 text-sm hover:border-accent"
      >
        Copy attribution
      </button>

      {showReport ? (
        <form onSubmit={handleReport} className="mt-4 space-y-3 rounded-lg bg-surface p-4">
          <p className="text-sm font-medium">Report this photo</p>
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select a reason…</option>
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <textarea
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            rows={3}
            placeholder="Optional details"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Submit report"}
            </button>
            <button
              type="button"
              onClick={() => setShowReport(false)}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowReport(true)}
          className="mt-3 text-xs text-muted hover:text-foreground"
        >
          Report this photo
        </button>
      )}
    </div>
  );
}
