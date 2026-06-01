import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Shared editorial chrome for the public site. Pages render inside the shell
// between the sticky Nav and the Footer (which carries the palette switcher).
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <div id="main-content">{children}</div>
      <Footer />
    </div>
  );
}
