import { adminListAffiliations } from "@/lib/queries/admin";
import { PageHeader } from "@/components/admin/ui";
import AffiliationsManager from "@/components/admin/AffiliationsManager";

export default async function AffiliationsPage() {
  const items = await adminListAffiliations();
  return (
    <div>
      <PageHeader title="Affiliations" description="Memberships and advisory roles on the About page." />
      <AffiliationsManager items={items.map((a) => ({ id: a.id, role: a.role, name: a.name, url: a.url }))} />
    </div>
  );
}
