import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/** Server-side admin gate for API routes. Returns the session if admin. */
export async function requireAdminApi() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "admin") return null;
  return session;
}
