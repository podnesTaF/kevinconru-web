import type { Metadata } from "next";

// Bare admin wrapper — plain, utilitarian theme (opaque light background sits
// above the editorial grain). The authed sidebar/guard live in (authed)/layout;
// the login page renders inside this bare wrapper without the chrome.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin — Kevin Conru" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 min-h-screen bg-zinc-50 text-zinc-900">{children}</div>
  );
}
