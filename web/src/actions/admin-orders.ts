"use server";

import { verifyAdmin } from "@/lib/auth";
import { prisma, isDbConfigured } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

export async function getAllOrdersAction() {
  if (!isDbConfigured()) return { success: true, orders: [] };

  try {
    await verifyAdmin();

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        orderItems: { select: { id: true } },
        shippingAddress: { select: { fullName: true, phone: true, city: true, state: true } },
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, orders };
  } catch (err: unknown) {
    console.error("getAllOrdersAction error:", err);
    return { success: false, orders: [], error: "Failed to fetch orders." };
  }
}

export async function getAdminOrderByIdAction(orderId: string) {
  if (!isDbConfigured()) return { success: false, order: null };

  try {
    await verifyAdmin();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { fullName: true, email: true } },
        orderItems: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
        shippingAddress: true,
        payments: { orderBy: { createdAt: "desc" } },
      },
    });

    return { success: true, order };
  } catch (err: unknown) {
    console.error("getAdminOrderByIdAction error:", err);
    return { success: false, order: null };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  shippingCarrier?: string,
  shippingTrackingId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isDbConfigured()) return { success: false, error: "Database not configured." };

  try {
    await verifyAdmin();

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(shippingCarrier !== undefined && { shippingCarrier: shippingCarrier || null }),
        ...(shippingTrackingId !== undefined && { shippingTrackingId: shippingTrackingId || null }),
      },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("updateOrderStatusAction error:", err);
    const message = err instanceof Error ? err.message : "Failed to update order.";
    return { success: false, error: message };
  }
}