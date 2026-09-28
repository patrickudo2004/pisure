"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

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

const MAX_BYTES = 25 * 1024 * 1024;
const MIN_WIDTH = 1200;

type Derivatives = { original: Blob; web: Blob; thumb: Blob };

/** Draw to canvas to strip EXIF (incl. GPS) and produce JPEG re-encodes. */
async function prepareDerivatives(file: File): Promise<Derivatives> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  const makeBlob = (w: number, h: number, quality: number): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.drawImage(bitmap, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Encode failed"))),
        "image/jpeg",
        quality,
      );
    });

  const scale = (target: number) => Math.min(1, target / width);
  const thumbW = 400;
  const thumbH = Math.round(height * scale(thumbW));
  const webW = Math.min(width, 1280);
  const webH = Math.round(height * (webW / width));

  const original = await makeBlob(width, height, 0.92);
  const web = width > webW ? await makeBlob(webW, webH, 0.82) : original;
  const thumb = await makeBlob(thumbW, thumbH, 0.8);

  return { original, web, thumb };
}

async function makeBlurDataURL(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  const ratio = bitmap.height / bitmap.width;
  canvas.height = Math.max(1, Math.round(16 * ratio));
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.5);
}

async function uploadToR2(
  url: string,
  blob: Blob,
  contentType: string,
): Promise<void> {
  const res = await fetch(url, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": contentType },
  });
  if (!res.ok) throw new Error(`R2 upload failed (${res.status})`);
}

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [ownership, setOwnership] = useState(false);
  const [modelRelease, setModelRelease] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));

    try {
      const bitmap = await createImageBitmap(f);
      setDims({ w: bitmap.width, h: bitmap.height });
      if (bitmap.width < MIN_WIDTH) {
        toast.error(`Image is only ${bitmap.width}px wide — minimum is ${MIN_WIDTH}px.`);
      }
    } catch {
      setDims(null);
      toast.error("That doesn't look like a readable image.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !dims) return;
    if (dims.w < MIN_WIDTH) {
      toast.error(`Minimum width is ${MIN_WIDTH}px.`);
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File exceeds 25 MB.");
      return;
    }
    if (!category) {
      toast.error("Choose a category.");
      return;
    }
    if (!ownership) {
      toast.error("Please confirm you own the rights to this photo.");
      return;
    }

    setUploading(true);
    try {
      toast.message("Preparing image…");
      const [derivatives, blurDataURL] = await Promise.all([
        prepareDerivatives(file),
        makeBlurDataURL(file),
      ]);

      toast.message("Requesting secure upload links…");
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          tags: tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 10),
          category,
          mime: "image/jpeg",
          sizeBytes: derivatives.original.size,
          width: dims.w,
          height: dims.h,
          blurDataURL,
          ownershipConfirmed: true,
          modelReleaseConfirmed: modelRelease,
          fileExt: "jpg",
        }),
      });
      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload request failed");
      }
      const { uploads } = await presignRes.json();

      const contentTypeMap: Record<string, string> = {
        original: "image/jpeg",
        web: "image/jpeg",
        thumb: "image/jpeg",
      };
      let done = 0;
      for (const part of uploads) {
        toast.message(`Uploading ${part.field} (${++done}/3)…`);
        await uploadToR2(part.url, derivatives[part.field as keyof Derivatives], contentTypeMap[part.field]);
      }

      toast.success("Upload complete! It will appear once approved.");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const inputCls =
    "w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Upload a visual</h1>
      <p className="mt-1 text-muted">
        JPEG, PNG or WebP · at least {MIN_WIDTH}px wide · up to 25 MB. EXIF data
        (including GPS) is removed automatically. We&apos;ll review it before it goes
        live.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Photo</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={handleFileChange}
            className="w-full text-sm"
          />
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview"
              className="mt-3 max-h-64 rounded-md border border-border object-contain"
            />
          )}
          {dims && (
            <p className="mt-1 text-xs text-muted">
              {dims.w} × {dims.h}px · {(file!.size / 1024 / 1024).toFixed(1)} MB
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            type="text"
            required
            minLength={3}
            maxLength={120}
            placeholder="e.g. Sunrise over Lagos lagoon"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            rows={3}
            maxLength={2000}
            placeholder="Tell viewers the story (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            placeholder="lagos, sunset, city"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          >
            <option value="">Select a category…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 rounded-lg bg-surface p-4 text-sm">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              required
              checked={ownership}
              onChange={(e) => setOwnership(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I own the rights to this photo and it does not infringe anyone&apos;s
              copyright, and I agree to publish it under CC BY 4.0.
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={modelRelease}
              onChange={(e) => setModelRelease(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              If recognizable people appear, I have their permission to publish
              this photo (model release).
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload for review"}
        </button>
      </form>
    </div>
  );
}
