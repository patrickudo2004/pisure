import Link from "next/link";

export const metadata = {
  title: "About",
  description:
    "Why Pisure exists: authentic African visuals, free for everyone, credited to the photographers who make them.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">
        Visuals for Africa, <span className="text-accent">by Africa</span>
      </h1>

      <div className="mt-8 space-y-6 leading-relaxed text-muted">
        <p>
          Pisure started with a birthday card. Our founder needed images of
          real African life for a design — and found that the internet&apos;s
          biggest free photo libraries had pages of wildlife and sunsets, but
          almost nothing that looked like the street he grew up on, the
          markets he shops in, or the weddings he attends.
        </p>
        <p>
          So we built the library we were looking for. A place where African
          photographers, designers, and everyday creators publish their view
          of the continent — and where anyone, anywhere, can use those images
          for free.
        </p>
        <p>
          Every photo on Pisure is free for personal and commercial use under{" "}
          <Link href="/license" className="text-accent hover:underline">
            CC BY 4.0
          </Link>
          . The only ask is credit — because the photographers deserve to be
          found.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="font-display text-2xl font-bold text-accent">Free</p>
          <p className="mt-1 text-sm text-muted">
            No paywalls, no watermarks. Download and create.
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="font-display text-2xl font-bold text-accent">Credited</p>
          <p className="mt-1 text-sm text-muted">
            Attribution isn&apos;t fine print — it&apos;s the point.
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="font-display text-2xl font-bold text-accent">Authentic</p>
          <p className="mt-1 text-sm text-muted">
            Real places, real people, real life — with consent.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/search"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Browse the gallery
        </Link>
        <Link
          href="/signup"
          className="rounded-full border border-border px-6 py-2.5 text-sm font-medium hover:border-accent hover:text-accent"
        >
          Publish your work
        </Link>
      </div>
    </div>
  );
}
