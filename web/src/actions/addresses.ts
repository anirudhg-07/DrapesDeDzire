// src/actions/addresses.ts
"use server";

import { requireAuth, getOrCreateDbUser } from "@/lib/auth";
import { prisma, isDbConfigured } from "@/lib/prisma";
import { AddressSchema, type AddressInput } from "@/types/checkout";

async function getDbUserId(clerkId: string): Promise<string | null> {
  try {
    return await getOrCreateDbUser(clerkId);
  } catch (err) {
    console.error("getDbUserId error:", err);
    return null;
  }
}

export async function saveAddressAction(
  data: AddressInput
): Promise<{ success: boolean; addressId?: string; error?: string }> {
  if (!isDbConfigured()) return { success: false, error: "Database not configured." };

  const parsed = AddressSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid address data.";
    return { success: false, error: firstError };
  }

  try {
    const clerkId = await requireAuth();
    const userId = await getDbUserId(clerkId);
    if (!userId) return { success: false, error: "User not found." };

    const address = await prisma.address.create({
      data: {
        userId,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        alternatePhone: parsed.data.alternatePhone || null,
        line1: parsed.data.line1,
        line2: parsed.data.line2 || null,
        landmark: parsed.data.landmark || null,
        city: parsed.data.city,
        state: parsed.data.state,
        pincode: parsed.data.pincode,
        isDefault: false,
      },
    });

    return { success: true, addressId: address.id };
  } catch (err: unknown) {
    console.error("saveAddressAction error:", err);
    return { success: false, error: "Failed to save address." };
  }
}

export async function getUserAddressesAction() {
  if (!isDbConfigured()) return { success: true, addresses: [] };

  try {
    const clerkId = await requireAuth();
    const userId = await getDbUserId(clerkId);
    if (!userId) return { success: true, addresses: [] };

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return { success: true, addresses };
  } catch (err: unknown) {
    console.error("getUserAddressesAction error:", err);
    return { success: false, addresses: [], error: "Failed to fetch addresses." };
  }
}
