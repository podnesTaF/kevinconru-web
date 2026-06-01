import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

// Authoritative guard for every admin screen (proxy.ts adds an edge redirect).
export default async function AuthedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/login");

  return (
    <div className="md:flex md:min-h-screen">
      <AdminSidebar email={session.user.email ?? ""} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-8">{children}</main>
    </div>
  );
}
