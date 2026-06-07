// One-off, idempotent markup improvement for the A. B. Lewis long read.
// The prose is NEVER retyped: the existing body is sliced at exact substring
// markers and re-assembled with section headings + paragraph breaks, so the
// text stays byte-identical (plus <em> around the ship name and signature).
// Run: npx tsx scripts/improve-ab-lewis-markup.ts
import dotenv from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config();

const db = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! }),
});

/** Split `text` before each marker, in order. Throws if a marker is missing. */
function splitAt(text: string, markers: string[]): string[] {
  const parts: string[] = [];
  let rest = text;
  for (const m of markers) {
    const i = rest.indexOf(m);
    if (i < 0) throw new Error(`Marker not found: "${m.slice(0, 40)}…"`);
    parts.push(rest.slice(0, i).trim());
    rest = rest.slice(i);
  }
  parts.push(rest.trim());
  return parts;
}

const p = (s: string) => `<p>${s}</p>`;
const h2 = (s: string) => `<h2>${s}</h2>`;

async function main() {
  const pub = await db.publication.findUnique({ where: { slug: "ab-lewis" }, select: { body: true } });
  if (!pub) throw new Error("ab-lewis not found");
  if (/<h2>/.test(pub.body)) {
    console.log("Already structured — nothing to do.");
    return;
  }

  const paras = [...pub.body.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1].trim());
  if (paras.length !== 5) throw new Error(`Expected 5 paragraphs, found ${paras.length}`);

  // ¶1 → era context (3 paragraphs) + Field Museum origin (3 paragraphs)
  const [p1a, p1b, p1c, p2a, p2b, p2c] = splitAt(paras[0], [
    "Anthropologists analyzed social frameworks",
    "Unlike Polynesian culture",
    "Chicago’s Field Museum was a young institution",
    "On his return to Chicago, Dorsey convinced",
    "In the spring of 1909",
  ]);

  // ¶2 → the four field years (4 paragraphs); ship name set in italics
  const [p3a, p3b, p3c, p3d] = splitAt(paras[1], [
    "After leaving Fiji and stopping in Sydney",
    "Throughout his time in New Guinea",
    "After leaving New Guinea",
  ]).map((s) => s.replace("German ship Siar", "German ship <em>Siar</em>"));

  const body = [
    h2("An age of expeditions"),
    p(p1a),
    p(p1b),
    p(p1c),
    h2("Chicago and the Field Museum"),
    p(p2a),
    p(p2b),
    p(p2c),
    h2("Four years in the field"),
    p(p3a),
    p(p3b),
    p(p3c),
    p(p3d),
    h2("The collection in Chicago"),
    p(paras[2]),
    p(paras[3]),
    p(`<em>${paras[4]}</em>`), // signature — Kevin Conru
  ].join("\n");

  // Fidelity check: the visible prose (headings aside) must be unchanged
  // modulo whitespace.
  const flat = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, "");
  const before = flat(pub.body);
  const after = flat(body.replace(/<h2>[\s\S]*?<\/h2>/g, " "));
  if (before !== after) throw new Error("Text drift detected — aborting, nothing written.");

  await db.publication.update({ where: { slug: "ab-lewis" }, data: { body } });
  console.log("ab-lewis body restructured. Sections:", [...body.matchAll(/<h2>(.*?)<\/h2>/g)].map((m) => m[1]).join(" · "));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
