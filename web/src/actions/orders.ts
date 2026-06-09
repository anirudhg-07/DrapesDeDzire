// src/actions/orders.ts
"use server";

import { requireAuth, getOrCreateDbUser } from "@/lib/auth";
import { prisma, isDbConfigured } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { clearCartAction } from "./cart";
import type { AddressInput } from "@/types/checkout";
import Razorpay from "razorpay";
import crypto from "crypto";

async function getDbUserId(clerkId: string): Promise<string | null> {
  try {
    return await getOrCreateDbUser(clerkId);
  } catch (err) {
    console.error("getDbUserId error:", err);
    return null;
  }
}

function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return false;
  if (keyId.includes("xxxxxxxxxxxxxxxx") || keySecret.includes("xxxxxxxxxxxxxxxx")) return false;
  return true;
}

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys not configured.");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// --------------------------------------------------------------------------
// Create Order — Prisma transaction + Razorpay
// --------------------------------------------------------------------------
export async function createOrderAction(
  addressData: AddressInput,
  items: Array<{ productId: string; quantity: number }>
): Promise<{
  success: boolean;
  razorpayOrderId?: string;
  internalOrderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
}> {
  if (!isDbConfigured()) return { success: false, error: "Database not configured." };
  if (!items || items.length === 0) return { success: false, error: "Cart is empty." };

  try {
    const clerkId = await requireAuth();
    const userId = await getDbUserId(clerkId);
    if (!userId) return { success: false, error: "User not found. Please sign in again." };

    const configured = isRazorpayConfigured();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify stock and compute total amount
      let totalAmount = 0;
      const validatedItems: Array<{
        productId: string;
        quantity: number;
        priceAtPurchase: number;
        name: string;
      }> = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, basePrice: true, stock: true, isActive: true },
        });

        if (!product || !product.isActive) {
          throw new Error(`Product not found or unavailable.`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Only ${product.stock} available.`
          );
        }

        const price = Number(product.basePrice);
        totalAmount += price * item.quantity;
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: price,
          name: product.name,
        });
      }

      // 2. Decrement stock atomically
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. Save the shipping address
      const address = await tx.address.create({
        data: {
          userId,
          fullName: addressData.fullName,
          phone: addressData.phone,
          alternatePhone: addressData.alternatePhone || null,
          line1: addressData.line1,
          line2: addressData.line2 || null,
          landmark: addressData.landmark || null,
          city: addressData.city,
          state: addressData.state,
          pincode: addressData.pincode,
        },
      });

      // 4. Create PENDING order in DB
      const orderNumber = generateOrderNumber();
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: address.id,
          totalAmount,
          status: "PENDING",
          razorpayOrderId: "pending_" + Date.now(), // Temporary — updated after Razorpay call
          orderItems: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase,
            })),
          },
        },
      });

      return { order, totalAmount, orderNumber };
    });

    let razorpayOrderId: string;
    let keyIdToReturn: string;

    if (!configured) {
      // Mock mode: bypass Razorpay SDK and generate mock ID
      razorpayOrderId = `order_mock_${Date.now()}`;
      keyIdToReturn = "rzp_test_mockkeyid";
    } else {
      // 5. Create Razorpay order (outside transaction to avoid long-held locks)
      const razorpay = getRazorpayInstance();
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(result.totalAmount * 100), // Convert to paise
        currency: "INR",
        receipt: result.orderNumber,
      });
      razorpayOrderId = razorpayOrder.id;
      keyIdToReturn = process.env.RAZORPAY_KEY_ID || "";
    }

    // 6. Update our DB order with the real or mock Razorpay order ID
    await prisma.order.update({
      where: { id: result.order.id },
      data: { razorpayOrderId },
    });

    return {
      success: true,
      razorpayOrderId,
      internalOrderId: result.order.id,
      amount: Math.round(result.totalAmount * 100),
      currency: "INR",
      keyId: keyIdToReturn,
    };
  } catch (err: unknown) {
    console.error("createOrderAction error:", err);
    const message = err instanceof Error ? err.message : "Failed to create order.";
    return { success: false, error: message };
  }
}

// --------------------------------------------------------------------------
// Verify Payment — HMAC-SHA256 signature check
// --------------------------------------------------------------------------
export async function verifyPaymentAction(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  internalOrderId: string
): Promise<{ success: boolean; orderNumber?: string; error?: string }> {
  if (!isDbConfigured()) return { success: false, error: "Database not configured." };

  try {
    await requireAuth();

    const configured = isRazorpayConfigured();
    const isMock = razorpayOrderId.startsWith("order_mock_") || !configured;

    if (isMock) {
      // Bypass HMAC signature verification for mock/sandbox orders
      const updatedOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.update({
          where: { id: internalOrderId },
          data: { status: "PAID" },
        });

        await tx.payment.create({
          data: {
            orderId: internalOrderId,
            razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
            razorpaySignature: razorpaySignature || `sig_mock_${Date.now()}`,
            amount: order.totalAmount,
            status: "CAPTURED",
            method: "razorpay_mock",
          },
        });

        return order;
      });

      // Clear the user's cart after successful payment
      await clearCartAction();

      return { success: true, orderNumber: updatedOrder.orderNumber };
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) throw new Error("Razorpay secret not configured.");

    // Compute expected signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      // Mark payment as FAILED
      await prisma.order.update({
        where: { id: internalOrderId },
        data: { status: "CANCELLED" },
      });
      return { success: false, error: "Payment verification failed. Signature mismatch." };
    }

    // Mark as PAID and log the payment record
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: internalOrderId },
        data: { status: "PAID" },
      });

      await tx.payment.create({
        data: {
          orderId: internalOrderId,
          razorpayPaymentId,
          razorpaySignature,
          amount: order.totalAmount,
          status: "CAPTURED",
          method: "razorpay",
        },
      });

      return order;
    });

    // Clear the user's cart after successful payment
    await clearCartAction();

    return { success: true, orderNumber: updatedOrder.orderNumber };
  } catch (err: unknown) {
    console.error("verifyPaymentAction error:", err);
    const message = err instanceof Error ? err.message : "Payment verification failed.";
    return { success: false, error: message };
  }
}

// --------------------------------------------------------------------------
// Get User Orders (for order history)
// --------------------------------------------------------------------------
export async function getUserOrdersAction() {
  if (!isDbConfigured()) return { success: true, orders: [] };

  try {
    const clerkId = await requireAuth();
    const userId = await getDbUserId(clerkId);
    if (!userId) return { success: true, orders: [] };

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
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
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, orders };
  } catch (err: unknown) {
    console.error("getUserOrdersAction error:", err);
    return { success: false, orders: [], error: "Failed to fetch orders." };
  }
}

export async function getOrderByIdAction(orderId: string) {
  if (!isDbConfigured()) return { success: false, order: null };

  try {
    const clerkId = await requireAuth();
    const userId = await getDbUserId(clerkId);
    if (!userId) return { success: false, order: null };

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: { orderBy: { orderNum: "asc" } },
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
    console.error("getOrderByIdAction error:", err);
    return { success: false, order: null };
  }
}
