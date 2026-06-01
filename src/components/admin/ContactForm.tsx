"use client";

import { useActionState } from "react";
import { updateContact } from "@/lib/actions/settings";
import { initialActionState } from "@/lib/actions/types";
import { inputCls, labelCls, FieldError, FormMessage, SubmitButton } from "@/components/admin/ui";

type Defaults = {
  tel?: string;
  email?: string;
  facebook?: string | null;
  instagram?: string | null;
  city?: string | null;
};

export default function ContactForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction] = useActionState(updateContact, initialActionState);
  const fe = state.fieldErrors;

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Telephone</label>
          <input name="tel" defaultValue={defaults.tel ?? ""} className={inputCls} />
          <FieldError errors={fe?.tel} />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input name="email" type="email" defaultValue={defaults.email ?? ""} className={inputCls} />
          <FieldError errors={fe?.email} />
        </div>
        <div>
          <label className={labelCls}>Facebook URL</label>
          <input name="facebook" defaultValue={defaults.facebook ?? ""} className={inputCls} />
          <FieldError errors={fe?.facebook} />
        </div>
        <div>
          <label className={labelCls}>Instagram URL</label>
          <input name="instagram" defaultValue={defaults.instagram ?? ""} className={inputCls} />
          <FieldError errors={fe?.instagram} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>City</label>
          <input name="city" defaultValue={defaults.city ?? ""} className={inputCls} />
        </div>
      </div>

      <FormMessage state={state} />
      <SubmitButton>Save contact</SubmitButton>
    </form>
  );
}
