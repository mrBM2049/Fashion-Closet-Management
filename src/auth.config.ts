import type { NextAuthConfig } from "next-auth";

// Edge-safe config — no Node.js modules (no mysql2, no bcryptjs)
// Used only by middleware for JWT session checking
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/signin" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const protectedPaths = ["/closet", "/outfits", "/analytics", "/transactions"];
      const authPaths = ["/signin", "/signup"];

      const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
      const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

      // Logged-in user trying to access signin/signup → redirect to closet
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/closet", nextUrl));
      }

      // Unauthenticated user trying to access protected route → redirect to signin
      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/signin", nextUrl));
      }

      return true;
    },
  },
};
