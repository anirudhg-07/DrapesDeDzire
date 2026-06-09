// src/actions/cart.ts
"use server";

import { requireAuth, getOrCreateDbUser } from "@/lib/auth";
import { prisma, isDbConfigured } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { CartItemWithProduct } from "@/types/cart";

// Removed getDbUserId wrapper to allow errors to propagate directly

// --------------------------------------------------------------------------
// Add to Cart (upsert — creates row or increments quantity)
// --------------------------------------------------------------------------
export async function addToCartAction(
  productId: string,
  quantity = 1
): Promise<{ success: boolean; error?: string }> {
  if (!isDbConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  try {
    const clerkId = await requireAuth();
    const userId = await getOrCreateDbUser(clerkId);

    // Check stock availability
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, name: true },
    });
    if (!product || product.stock < quantity) {
      return { success: false, error: `Insufficient stock for this item.` };
    }

    // Check if item already in cart
    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        return { success: false, error: "Cannot add more — insufficient stock." };
      }
      await prisma.cartItem.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { userId, productId, quantity },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (err: unknown) {
    console.error("addToCartAction error:", err);
    const message = err instanceof Error ? err.message : "Failed to add to cart.";
    return { success: false, error: message };
  }
}

// --------------------------------------------------------------------------
// Remove from Cart
// --------------------------------------------------------------------------
export async function removeFromCartAction(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isDbConfigured()) return { success: false, error: "Database not configured." };

  try {
    const clerkId = await requireAuth();
    const userId = await getOrCreateDbUser(clerkId);

    await prisma.cartItem.deleteMany({
      where: { userId, productId },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (err: unknown) {
    console.error("removeFromCartAction error:", err);
    return { success: false, error: "Failed to remove item." };
  }
}

// --------------------------------------------------------------------------
// Update Quantity
// --------------------------------------------------------------------------
export async function updateCartQuantityAction(
  productId: string,
  quantity: number
): Promise<{ success: boolean; error?: string }> {
  if (!isDbConfigured()) return { success: false, error: "Database not configured." };
  if (quantity < 1) return removeFromCartAction(productId);

  try {
    const clerkId = await requireAuth();
    const userId = await getOrCreateDbUser(clerkId);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });
    if (!product || product.stock < quantity) {
      return { success: false, error: "Insufficient stock." };
    }

    await prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (err: unknown) {
    console.error("updateCartQuantityAction error:", err);
    return { success: false, error: "Failed to update quantity." };
  }
}

// --------------------------------------------------------------------------
// Get Cart (with full product data)
// --------------------------------------------------------------------------
export async function getCartAction(): Promise<{
  success: boolean;
  items: CartItemWithProduct[];
  itemCount: number;
  subtotal: number;
  error?: string;
}> {
  const empty = { success: true, items: [] as CartItemWithProduct[], itemCount: 0, subtotal: 0 };
  if (!isDbConfigured()) return empty;

  try {
    const clerkId = await requireAuth();
    const userId = await getOrCreateDbUser(clerkId);

    const rawItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { orderNum: "asc" } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const items: CartItemWithProduct[] = rawItems.map((item) => ({
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      quantity: item.quantity,
      createdAt: item.createdAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        basePrice: Number(item.product.basePrice),
        fabric: item.product.fabric,
        colour: item.product.colour,
        stock: item.product.stock,
        categorySlug: undefined,
        images: item.product.images.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary,
          orderNum: img.orderNum,
        })),
      },
    }));

    const subtotal = items.reduce(
      (sum, item) => sum + item.product.basePrice * item.quantity,
      0
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { success: true, items, itemCount, subtotal };
  } catch (err: unknown) {
    console.error("getCartAction error:", err);
    return { ...empty, error: "Failed to load cart." };
  }
}

// --------------------------------------------------------------------------
// Clear Cart (called after successful order placement)
// --------------------------------------------------------------------------
export async function clearCartAction(): Promise<{ success: boolean; error?: string }> {
  if (!isDbConfigured()) return { success: false, error: "Database not configured." };

  try {
    const clerkId = await requireAuth();
    const userId = await getOrCreateDbUser(clerkId);

    await prisma.cartItem.deleteMany({ where: { userId } });
    revalidatePath("/cart");
    return { success: true };
  } catch (err: unknown) {
    console.error("clearCartAction error:", err);
    return { success: false, error: "Failed to clear cart." };
  }
}
