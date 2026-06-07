import NextAuth from "next-auth";
import { authConfig } from "./app/(auth)/auth.config";
import { guestRegex } from "./lib/constants";

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(request) {
  const { pathname } = request.nextUrl;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  const token = request.auth?.user;

  if (!token) {
    const redirectUrl = encodeURIComponent(new URL(request.url).pathname);
    return Response.redirect(
      new URL(`${base}/api/auth/guest?redirectUrl=${redirectUrl}`, request.url)
    );
  }

  const isGuest = guestRegex.test(token.email ?? "");

  if (token && !isGuest && ["/login", "/register"].includes(pathname)) {
    return Response.redirect(new URL(`${base}/`, request.url));
  }
});

export const config = {
  matcher: [
    "/",
    "/chat/:id",
    "/api/:path*",
    "/login",
    "/register",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
