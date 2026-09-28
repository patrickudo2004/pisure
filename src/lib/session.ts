import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

type AdminSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
> & { user: { role: string } };

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || (session.user as { role?: string }).role !== "admin") {
    redirect("/");
  }
  return session as AdminSession;
}
