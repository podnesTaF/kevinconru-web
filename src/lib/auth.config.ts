import type { NextAuthConfig } from "next-auth";

// Edge-safe NextAuth config: NO database adapter and NO providers that touch
// Node-only modules (bcrypt / the Neon client). This half is imported by
// proxy.ts (middleware) where only the JWT cookie is read. The Credentials
// provider + Prisma adapter are added in auth.ts (Node runtime).
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    // Carry id + role from the user (login) onto the token, then the session.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? session.user.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
