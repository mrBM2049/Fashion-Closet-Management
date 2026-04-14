import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db/client";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials.email as string;
        const password = credentials.password as string;
        const [rows] = await db.execute(
          "SELECT user_id, email, username, password_hash, role FROM Users WHERE email = ?",
          [email]
        );
        const user = (rows as any[])[0];
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;
        return { id: String(user.user_id), email: user.email, name: user.username, role: user.role };
      },
    }),
  ],
  pages: { signIn: "/signin" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role   = (user as any).role;
        token.userId = (user as any).id;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as any).role   = token.role;
      (session.user as any).userId = token.userId;
      return session;
    },
  },
});
