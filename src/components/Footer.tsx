import Link from "next/link";
import Logo from "./Logo";

const CATEGORIES = [
  "People",
  "Urban",
  "Culture",
  "Nature",
  "Wildlife",
  "Food",
  "Business",
];

const POPULAR = ["Lagos", "Nairobi", "Market", "Wedding", "Sunset", "Ankara"];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 text-sm sm:px-6 md:grid-cols-5 lg:px-8">
        <div className="col-span-2 md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-muted">
            Free high-resolution photography by African creators, for the world.
          </p>
          <p className="mt-4 text-muted">
           {" "}
            <Link href="/about" className="text-accent hover:underline">
              Our story
            </Link>
          </p>
        </div>

        <div>
          <p className="mb-3 font-semibold">Categories</p>
          <ul className="space-y-2 text-muted">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link href={`/category/${c.toLowerCase()}`} className="hover:text-foreground">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold">Popular</p>
          <ul className="space-y-2 text-muted">
            {POPULAR.map((p) => (
              <li key={p}>
                <Link href={`/search?q=${encodeURIComponent(p)}`} className="hover:text-foreground">
                  {p}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold">Company</p>
          <ul className="space-y-2 text-muted">
            <li><Link href="/about" className="hover:text-foreground">About</Link></li>
            <li><Link href="/license" className="hover:text-foreground">License</Link></li>
            <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
            <li><Link href="/signup" className="hover:text-foreground">Become a creator</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Pisure. Photos under CC BY 4.0.</p>
          <p>
            Made with care in Africa ·{" "}
            <a href="mailto:hello@pisure.com" className="hover:text-foreground">
              hello@pisure.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
