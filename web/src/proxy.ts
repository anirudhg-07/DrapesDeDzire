// src/proxy.ts — Route protection via Clerk (Next.js 16 convention)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Protected customer routes — require login
const isCustomerRoute = createRouteMatcher([
  "/cart(.*)",
  "/checkout(.*)",
  "/orders(.*)",
  "/wishlist(.*)",
  "/account(.*)",
]);

// Protected admin routes — require login + whitelist check
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // Customer routes: redirect to sign-in if unauthenticated
  if (isCustomerRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Admin routes: redirect to home if unauthenticated
  if (isAdminRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk-specific frontend API routes
    "/__clerk/(.*)",
  ],
};
