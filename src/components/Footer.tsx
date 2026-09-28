import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Pisure — Visuals for Africa, by Africa.</p>
        <div className="flex gap-4">
          <Link href="/license" className="hover:text-foreground">
            License
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/search" className="hover:text-foreground">
            Search
          </Link>
        </div>
      </div>
    </footer>
  );
}
