import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { AdminApp } from "@/components/admin/forms";

export default async function AdminPage() {
  await requireAdmin(); // layouts don't re-run on client navigation, so guard the page too
  return <AdminApp initial={await getContent()} />;
}
