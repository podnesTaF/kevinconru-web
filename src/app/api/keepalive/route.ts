import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Keep-warm ping (see vercel.json crons): a trivial query stops Neon's
// compute from auto-suspending, so admin pages don't 500 on a cold database.
// Exposes no data — safe to leave public.
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
