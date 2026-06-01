// Client-safe action types/values (no server-only imports) so client forms can
// import them without pulling the Prisma/auth stack into the browser bundle.

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialActionState: ActionState = { ok: false };
