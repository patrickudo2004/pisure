import { requireAdmin } from "@/lib/session";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  await requireAdmin();
  return <AdminDashboard />;
}
