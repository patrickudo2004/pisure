import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-32 text-center">
      <p className="text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-semibold">This page wandered off safari</h1>
      <p className="mt-2 text-muted">
        The page you&apos;re looking for doesn&apos;t exist — the visual may have been
        removed by moderation.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
      >
        Browse visuals
      </Link>
    </div>
  );
}
