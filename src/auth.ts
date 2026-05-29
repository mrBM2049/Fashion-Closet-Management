import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db/client";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email    = credentials.email    as string;
          const password = credentials.password as string;

          if (!email || !password) return null;

          const [rows] = await db.execute(
            "SELECT user_id, email, username, password_hash, role FROM Users WHERE email = ?",
            [email]
          );
          const user = (rows as any[])[0];

          if (!user) {
            return null;
          }

          const valid = await bcrypt.compare(password, user.password_hash);
          if (!valid) {
            return null;
          }

          return { 
            id: String(user.user_id), 
            email: user.email, 
            name: user.username, 
            role: user.role 
          };
        } catch (error) {
          console.error("[auth] Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.role   = (user as any).role;
        token.userId = (user as any).id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role   = token.role;
        (session.user as any).userId = token.userId;
      }
      return session;
    },
  },
});
