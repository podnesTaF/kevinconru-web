import type { DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/client";

// Augment the session/user/JWT with our `id` + `role` so the auth callbacks
// and `auth()` consumers are type-safe.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}

// NextAuth v5's config callbacks receive the JWT type from @auth/core/jwt,
// so augment it here as well (next-auth/jwt alone doesn't reach them).
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}
