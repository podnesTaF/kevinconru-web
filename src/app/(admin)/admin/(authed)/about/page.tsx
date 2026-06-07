import Link from "next/link";
import { adminGetSettings } from "@/lib/queries/admin";
import { PageHeader } from "@/components/admin/ui";
import AboutForm from "@/components/admin/AboutForm";

export default async function AboutAdminPage() {
  const settings = await adminGetSettings();

  return (
    <div>
      <PageHeader
        title="About"
        description="Biography shown on the About page."
        action={
          <div className="flex gap-2 text-sm">
            <Link href="/admin/about/chronology" className="rounded-md border border-rule px-3 py-2 hover:bg-bg-alt">
              Chronology
            </Link>
            <Link href="/admin/about/affiliations" className="rounded-md border border-rule px-3 py-2 hover:bg-bg-alt">
              Affiliations
            </Link>
          </div>
        }
      />
      <AboutForm defaults={{ bio: settings?.bio ?? "" }} />
    </div>
  );
}
