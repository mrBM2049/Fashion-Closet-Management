import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);
export default middleware;

export const config = {
  matcher: [
    "/",
    // Protected app routes
    "/closet/:path*",
    "/outfits/:path*",
    "/analytics/:path*",
    "/transactions/:path*",
    // Auth pages — redirect to /closet if already logged in
    "/signin",
    "/signup",
  ],
};
