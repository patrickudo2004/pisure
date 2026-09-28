import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-32 text-center">
      <p className="font-display text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-semibold">This page doesn&apos;t exist</h1>
      <p className="mt-2 text-muted">
        It may have been moved, or the photo was removed by moderation.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
      >
        Browse photos
      </Link>
    </div>
  );
}
