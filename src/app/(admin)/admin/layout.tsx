import type { Metadata } from "next";

// Bare admin wrapper — uses the same editorial palette tokens as the public
// site (bg/fg track the active [data-palette] on <html>), sitting above the
// paper grain. The authed sidebar/guard live in (authed)/layout; the login
// page renders inside this bare wrapper without the chrome.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin — Kevin Conru" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 min-h-screen bg-bg text-fg">{children}</div>
  );
}
