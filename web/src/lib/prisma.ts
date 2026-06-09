// src/lib/prisma.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
// Singleton Prisma Client to avoid exhausting DB connections in development/edge
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

import fs from "fs";
import path from "path";

const cleanUrl = (url: string) => {
  return url.replace(/^['"]|['"]$/g, "").trim();
};

export const isDbConfigured = () => {
  const url = process.env.DATABASE_URL || "";
  return url && !url.includes("USER:PASSWORD") && !url.includes("@HOST");
};

// Log execution/import for debugging purposes
try {
  fs.writeFileSync(
    path.join(process.cwd(), "prisma_debug.log"),
    `isDbConfigured: ${isDbConfigured()}\nDATABASE_URL: ${process.env.DATABASE_URL}\nCLEANED_URL: ${cleanUrl(process.env.DATABASE_URL || "")}\n`
  );
} catch (err) {
  console.error("Failed to write prisma debug log:", err);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  databaseUrl: string | undefined;
};

const getPrismaInstance = (): PrismaClient | null => {
  if (!isDbConfigured()) {
    return null;
  }

  const rawUrl = process.env.DATABASE_URL || "";
  const cleanedUrl = cleanUrl(rawUrl);

  // Re-use cached instance only if it was initialized with the exact same connection string
  if (globalForPrisma.prisma && globalForPrisma.databaseUrl === cleanedUrl) {
    return globalForPrisma.prisma;
  }

  // If there's an existing client but the connection string changed, clean it up if possible
  if (globalForPrisma.prisma) {
    try {
      globalForPrisma.prisma.$disconnect();
    } catch (err) {
      console.error("Error disconnecting old Prisma instance:", err);
    }
  }

  // Create new PrismaClient with PrismaNeon driver adapter using the recommended constructor
  const adapter = new PrismaNeon({
    connectionString: cleanedUrl,
  });

  const prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
    globalForPrisma.databaseUrl = cleanedUrl;
  }

  return prismaInstance;
};

// Export a Proxy that intercepts accesses to `prisma` and evaluates it dynamically.
// This resolves import ordering issues (where env variables are not loaded during module evaluation).
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    // Prevent crashes during framework inspections (e.g. React server components, devtools, or promise checks)
    if (prop === "then" || prop === "toJSON" || typeof prop === "symbol") {
      return undefined;
    }
    const instance = getPrismaInstance();
    if (!instance) {
      throw new Error("Database is not configured. Please check your DATABASE_URL in .env");
    }
    const val = Reflect.get(instance, prop, receiver);
    return typeof val === "function" ? val.bind(instance) : val;
  },
});

