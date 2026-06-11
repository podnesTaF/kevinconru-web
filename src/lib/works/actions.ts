import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { db } from "@/lib/db";
import {
  type ActionState,
  requireAdmin,
  fieldErrorsFrom,
  str,
} from "@/lib/actions/_shared";
import type { WorkConfig } from "@/lib/works/config";

// Factory for the CRUD/publish/reorder Server Actions shared by Publications,
// Press and Exhibitions. The bodies were identical across entities — only the
// Prisma model, the zod schema, the FormData reader and the route bases differ.
//
// This module is NOT "use server": it's a plain helper that returns async
// functions. Each entity's "use server" file wraps and re-exports them so the
// public action names stay stable and Next sees real async function exports.

/** Minimal structural view of a Prisma model delegate (args/results loose). */
export interface WorkDelegate {
  findFirst(args?: unknown): Promise<unknown>;
  findUnique(args?: unknown): Promise<unknown>;
  create(args?: unknown): Promise<unknown>;
  update(args?: unknown): Promise<unknown>;
  delete(args?: unknown): Promise<unknown>;
}

interface MakeWorkActionsOpts {
  config: WorkConfig;
  model: WorkDelegate;
  schema: z.ZodTypeAny;
  /** Coerce + shape FormData into the object the schema validates. */
  readForm: (formData: FormData) => Record<string, unknown>;
}

function isUniqueSlug(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: string }).code === "P2002"
  );
}

export function makeWorkActions({ config, model, schema, readForm }: MakeWorkActionsOpts) {
  const { publicBase, adminBase, extraRevalidate } = config;

  const revalidate = (slug?: string) => {
    revalidatePath(publicBase);
    for (const p of extraRevalidate) revalidatePath(p);
    if (slug) revalidatePath(`${publicBase}/${slug}`);
  };

  async function create(_prev: ActionState, formData: FormData): Promise<ActionState> {
    await requireAdmin();
    const parsed = schema.safeParse(readForm(formData));
    if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
    const data = parsed.data as Record<string, unknown> & { slug: string };

    const last = (await model.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    })) as { sortOrder: number } | null;

    let created: { id: string };
    try {
      created = (await model.create({
        data: { ...data, sortOrder: (last?.sortOrder ?? -1) + 1 },
        select: { id: true },
      })) as { id: string };
    } catch (e) {
      if (isUniqueSlug(e)) return { ok: false, fieldErrors: { slug: ["Slug already in use"] } };
      throw e;
    }

    revalidate(data.slug);
    // Land on the edit screen so the gallery can be added straight away.
    redirect(`${adminBase}/${created.id}`);
  }

  async function update(_prev: ActionState, formData: FormData): Promise<ActionState> {
    await requireAdmin();
    const id = str(formData.get("id"));
    if (!id) return { ok: false, error: "Missing id" };

    const parsed = schema.safeParse(readForm(formData));
    if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

    const before = (await model.findUnique({
      where: { id },
      select: { slug: true },
    })) as { slug: string } | null;

    try {
      await model.update({ where: { id }, data: parsed.data });
    } catch (e) {
      if (isUniqueSlug(e)) return { ok: false, fieldErrors: { slug: ["Slug already in use"] } };
      throw e;
    }

    const slug = (parsed.data as { slug: string }).slug;
    revalidate(slug);
    if (before && before.slug !== slug) revalidatePath(`${publicBase}/${before.slug}`);
    return { ok: true };
  }

  async function remove(id: string) {
    await requireAdmin();
    const row = (await model.delete({ where: { id }, select: { slug: true } })) as { slug: string };
    revalidate(row.slug);
    redirect(adminBase);
  }

  async function setPublished(id: string, value: boolean) {
    await requireAdmin();
    const row = (await model.update({
      where: { id },
      data: { published: value },
      select: { slug: true },
    })) as { slug: string };
    revalidate(row.slug);
  }

  async function setFeatured(id: string, value: boolean) {
    await requireAdmin();
    await model.update({ where: { id }, data: { featured: value } });
    revalidate();
  }

  async function reorder(ids: string[]) {
    await requireAdmin();
    await db.$transaction(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ids.map((id, i) => model.update({ where: { id }, data: { sortOrder: i } })) as any,
    );
    revalidate();
  }

  return { create, update, remove, setPublished, setFeatured, reorder };
}
