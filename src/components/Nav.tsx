"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

type SessionPayload = {
  user: { id: string; name?: string | null; email: string; role?: string | null } | null;
};

export default function Nav() {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    authClient
      .getSession()
      .then((res: { data: SessionPayload | null }) => setSession(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Close menus on navigation (derived state — reset during render is the
  // React-recommended pattern instead of setState-in-effect)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setMobileOpen(false);
  }

  // Close avatar menu on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const user = session?.user ?? null;
  const initial = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?";

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  async function handleLogout() {
    await authClient.signOut();
    setSession(null);
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Pisure home">
          <Logo />
        </Link>

        {/* Navbar search — the primary tool */}
        <form onSubmit={submitSearch} className="hidden flex-1 md:block">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search free photos…"
            aria-label="Search photos"
            className="w-full max-w-xl rounded-full border border-border bg-surface px-4 py-1.5 text-sm outline-none transition focus:border-accent focus:bg-background"
          />
        </form>

        <div className="ml-auto hidden items-center gap-3 text-sm md:flex">
          <ThemeToggle />
          {loading ? (
            <span className="h-8 w-16 animate-pulse rounded bg-surface" />
          ) : user ? (
            <>
              <Link href="/upload" className="font-medium text-accent hover:opacity-80">
                Upload
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground"
                >
                  {initial}
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-border bg-background py-1 shadow-lg"
                  >
                    {user.role === "admin" && (
                      <Link href="/admin" role="menuitem" className="block px-4 py-2 hover:bg-surface">
                        Admin
                      </Link>
                    )}
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left hover:bg-surface"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-foreground">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-accent px-4 py-1.5 font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="ml-auto rounded-md p-2 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {mobileOpen ? (
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <form onSubmit={submitSearch} className="mb-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search free photos…"
              aria-label="Search photos"
              className="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-accent"
            />
          </form>
          <div className="flex flex-col gap-1 text-sm">
            {user ? (
              <>
                <Link href="/upload" className="py-2 font-medium text-accent">Upload</Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="py-2">Admin</Link>
                )}
                <button onClick={handleLogout} className="py-2 text-left">Log out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="py-2">Log in</Link>
                <Link href="/signup" className="py-2 font-medium text-accent">Sign up</Link>
              </>
            )}
            <div className="py-2"><ThemeToggle /></div>
          </div>
        </div>
      )}
    </nav>
  );
}
