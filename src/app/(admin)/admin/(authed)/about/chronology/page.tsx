import { adminListTimeline } from "@/lib/queries/admin";
import { PageHeader } from "@/components/admin/ui";
import ChronologyManager from "@/components/admin/ChronologyManager";

export default async function ChronologyPage() {
  const entries = await adminListTimeline();
  return (
    <div>
      <PageHeader title="Chronology" description="Selected chronology shown on the About page." />
      <ChronologyManager
        entries={entries.map((e) => ({ id: e.id, year: e.year, event: e.event, description: e.description }))}
      />
    </div>
  );
}
