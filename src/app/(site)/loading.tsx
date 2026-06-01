// Minimal route-transition fallback within the site shell. Kept lightweight —
// the editorial pages render fast; this avoids a blank flash on navigation.
export default function Loading() {
  return (
    <main className="page" aria-busy="true">
      <div className="wrap" style={{ padding: "120px 0 160px" }}>
        <span className="eyebrow">Loading…</span>
      </div>
    </main>
  );
}
