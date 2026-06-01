import { adminGetSettings } from "@/lib/queries/admin";
import { PageHeader } from "@/components/admin/ui";
import ContactForm from "@/components/admin/ContactForm";

export default async function SettingsPage() {
  const settings = await adminGetSettings();
  return (
    <div>
      <PageHeader title="Settings" description="Contact block — shown in the footer and on the About page." />
      <ContactForm
        defaults={{
          tel: settings?.tel ?? "",
          email: settings?.email ?? "",
          facebook: settings?.facebook,
          instagram: settings?.instagram,
          city: settings?.city,
        }}
      />
    </div>
  );
}
