"use client";

import { useActionState, useState } from "react";
import { updateAbout } from "@/lib/actions/about";
import { initialActionState } from "@/lib/actions/types";
import { inputCls, labelCls, FieldError, FormMessage, SubmitButton } from "@/components/admin/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";

type HeroStat = { num: string; label: string };

export default function AboutForm({
  defaults,
}: {
  defaults: { bio: string; roleLine: string; heroStats: HeroStat[]; marquee: string[] };
}) {
  const [state, formAction] = useActionState(updateAbout, initialActionState);
  const [stats, setStats] = useState<HeroStat[]>(defaults.heroStats.length ? defaults.heroStats : [{ num: "", label: "" }]);
  const [marquee, setMarquee] = useState<string[]>(defaults.marquee.length ? defaults.marquee : [""]);
  const fe = state.fieldErrors;

  const cleanStats = stats.filter((s) => s.num.trim() || s.label.trim());
  const cleanMarquee = marquee.map((m) => m.trim()).filter(Boolean);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <input type="hidden" name="heroStats" value={JSON.stringify(cleanStats)} />
      <input type="hidden" name="marquee" value={JSON.stringify(cleanMarquee)} />

      <div>
        <RichTextEditor name="bio" label="Biography" defaultValue={defaults.bio} />
        <FieldError errors={fe?.bio} />
      </div>

      <div>
        <label className={labelCls}>Role line</label>
        <input name="roleLine" defaultValue={defaults.roleLine} className={inputCls} />
        <FieldError errors={fe?.roleLine} />
      </div>

      <div>
        <label className={labelCls}>Hero stats</label>
        <div className="space-y-2">
          {stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={s.num}
                onChange={(e) => setStats((p) => p.map((x, j) => (j === i ? { ...x, num: e.target.value } : x)))}
                placeholder="10"
                className={`${inputCls} w-24`}
              />
              <input
                value={s.label}
                onChange={(e) => setStats((p) => p.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                placeholder="Publications"
                className={inputCls}
              />
              <button type="button" onClick={() => setStats((p) => p.filter((_, j) => j !== i))} className="px-2 text-sm text-red-600">
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setStats((p) => [...p, { num: "", label: "" }])} className="mt-2 text-sm text-zinc-700 hover:underline">
          + Add stat
        </button>
      </div>

      <div>
        <label className={labelCls}>Marquee items</label>
        <div className="space-y-2">
          {marquee.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={m}
                onChange={(e) => setMarquee((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
                className={inputCls}
              />
              <button type="button" onClick={() => setMarquee((p) => p.filter((_, j) => j !== i))} className="px-2 text-sm text-red-600">
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setMarquee((p) => [...p, ""])} className="mt-2 text-sm text-zinc-700 hover:underline">
          + Add item
        </button>
      </div>

      <FormMessage state={state} />
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
