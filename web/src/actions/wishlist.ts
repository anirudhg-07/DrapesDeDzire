// src/actions/wishlist.ts
"use server";

import { requireAuth, getOrCreateDbUser } from "@/lib/auth";
import { prisma, isDbConfigured } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getDbUserId(clerkId: string): Promise<string | null> {
  try {
    return await getOrCreateDbUser(clerkId);
  } catch (err) {
    console.error("getDbUserId error:", err);
    return null;
  }
}

export async function toggleWishlistAction(productId: string): Promise<{
  success: boolean;
  action?: "added" | "removed";
  error?: string;
}> {
  if (!isDbConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  try {
    const clerkId = await requireAuth();
    const userId = await getDbUserId(clerkId);
    if (!userId) {
      return { success: false, error: "User not found in database. Please sign out and sign in again." };
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { userId_productId: { userId, productId } },
      });
      revalidatePath("/wishlist");
      revalidatePath(`/products/${productId}`);
      return { success: true, action: "removed" };
    } else {
      await prisma.wishlist.create({
        data: { userId, productId },
      });
      revalidatePath("/wishlist");
      revalidatePath(`/products/${productId}`);
      return { success: true, action: "added" };
    }
  } catch (err: unknown) {
    console.error("toggleWishlistAction error:", err);
    const message = err instanceof Error ? err.message : "Failed to update wishlist.";
    return { success: false, error: message };
  }
}

export async function getWishlistAction(): Promise<{
  success: boolean;
  items?: Array<{
    id: string;
    productId: string;
    product: {
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      fabric: string;
      colour: string;
      stock: number;
      images: Array<{ id: string; imageUrl: string; isPrimary: boolean; orderNum: number }>;
    };
  }>;
  error?: string;
}> {
  if (!isDbConfigured()) return { success: true, items: [] };

  try {
    const clerkId = await requireAuth();
    const userId = await getDbUserId(clerkId);
    if (!userId) return { success: true, items: [] };

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { orderNum: "asc" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      items: wishlistItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          basePrice: Number(item.product.basePrice),
          fabric: item.product.fabric,
          colour: item.product.colour,
          stock: item.product.stock,
          images: item.product.images.map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary,
            orderNum: img.orderNum,
          })),
        },
      })),
    };
  } catch (err: unknown) {
    console.error("getWishlistAction error:", err);
    return { success: false, error: "Failed to fetch wishlist.", items: [] };
  }
}

export async function isInWishlistAction(productId: string): Promise<boolean> {
  if (!isDbConfigured()) return false;
  try {
    const clerkId = await requireAuth();
    const userId = await getDbUserId(clerkId);
    if (!userId) return false;
    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return !!existing;
  } catch {
    return false;
  }
}
