"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type SessionPayload = {
  user: { id: string; name?: string | null; email: string; role?: string | null } | null;
};

export default function Nav() {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    authClient
      .getSession()
      .then((res: { data: SessionPayload | null }) => setSession(res.data))
      .finally(() => setLoading(false));
  }, []);

  const user = session?.user ?? null;

  async function handleLogout() {
    await authClient.signOut();
    setSession(null);
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Pisure<span className="text-accent">.</span>
          </Link>
          <Link
            href="/search"
            className="hidden text-sm text-muted hover:text-foreground sm:block"
          >
            Search
          </Link>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {loading ? (
            <span className="h-5 w-16 animate-pulse rounded bg-surface" />
          ) : user ? (
            <>
              <Link href="/upload" className="font-medium text-accent hover:opacity-80">
                Upload
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="text-muted hover:text-foreground">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="text-muted hover:text-foreground">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-foreground">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-accent px-3 py-1.5 font-medium text-accent-foreground hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
