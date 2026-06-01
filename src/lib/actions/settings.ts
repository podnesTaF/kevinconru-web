"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validation/schemas";
import {
  type ActionState,
  requireAdmin,
  fieldErrorsFrom,
  str,
  optStr,
} from "@/lib/actions/_shared";

/** Derive a tel: href from a display number (keep leading +). */
function telHrefFrom(tel: string) {
  const digits = tel.replace(/[^0-9+]/g, "");
  return `tel:${digits}`;
}

export async function updateContact(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = contactSchema.safeParse({
    tel: str(formData.get("tel")),
    email: str(formData.get("email")),
    facebook: optStr(formData.get("facebook")),
    instagram: optStr(formData.get("instagram")),
    city: optStr(formData.get("city")),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  const data = { ...parsed.data, telHref: telHrefFrom(parsed.data.tel) };
  await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data, bio: "", roleLine: "", heroStats: [], marquee: [] },
  });
  // Contact shows in the footer (all routes) and the About contact block.
  revalidatePath("/", "layout");
  return { ok: true };
}
