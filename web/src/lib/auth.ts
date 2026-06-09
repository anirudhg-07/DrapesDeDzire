// src/lib/auth.ts
// Admin whitelist verification helper — used inside all Server Actions + Admin routes
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getOrCreateDbUser(clerkId: string): Promise<string> {
  // 1. Try to find the user in the database
  const existing = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (existing) {
    return existing.id;
  }

  // 2. If not found, look up Clerk details to sync on the fly
  const user = await currentUser();
  if (!user || user.id !== clerkId) {
    throw new Error("User session invalid. Please sign out and sign in again.");
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error("User has no email address configured in Clerk.");
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;

  // Create user record in PostgreSQL
  const created = await prisma.user.create({
    data: {
      clerkId,
      email,
      fullName,
    },
    select: { id: true },
  });

  return created.id;
}

export async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return userId;
}

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: Please sign in to continue.");
  }
  return userId;
}

export async function verifyAdmin() {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized: No active session.");
  }

  const adminEmail = process.env.ADMIN_WHITELIST_EMAIL;
  if (!adminEmail) {
    throw new Error("Server misconfiguration: Admin email not configured.");
  }

  const verifiedEmail = user.emailAddresses.find(
    (email) =>
      email.emailAddress === adminEmail &&
      email.verification?.status === "verified"
  );

  if (!verifiedEmail) {
    throw new Error("Forbidden: Admin access only.");
  }

  return user;
}

export async function isAdmin(): Promise<boolean> {
  try {
    await verifyAdmin();
    return true;
  } catch {
    return false;
  }
}

