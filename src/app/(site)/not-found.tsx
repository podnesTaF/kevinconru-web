import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="page">
      <div className="wrap" style={{ padding: "120px 0 160px", textAlign: "center" }}>
        <span className="eyebrow">404</span>
        <h1 className="display" style={{ fontSize: "clamp(48px, 8vw, 96px)", margin: "16px 0 24px" }}>
          Page not found
        </h1>
        <p className="body-l" style={{ maxWidth: 420, margin: "0 auto 28px" }}>
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link className="link-arrow" href="/">
          Return home <ArrowRight />
        </Link>
      </div>
    </main>
  );
}
