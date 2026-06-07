"use client";

import { useActionState } from "react";
import { updateAbout } from "@/lib/actions/about";
import { initialActionState } from "@/lib/actions/types";
import { FieldError, FormMessage, SubmitButton } from "@/components/admin/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function AboutForm({ defaults }: { defaults: { bio: string } }) {
  const [state, formAction] = useActionState(updateAbout, initialActionState);
  const fe = state.fieldErrors;

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div>
        <RichTextEditor name="bio" label="Biography" defaultValue={defaults.bio} />
        <FieldError errors={fe?.bio} />
      </div>

      <FormMessage state={state} />
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
