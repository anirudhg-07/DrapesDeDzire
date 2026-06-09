// src/app/api/webhooks/razorpay/route.ts
// Razorpay webhook fallback — captures payments when browser is closed before verification

import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  }

  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not set");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    // Verify Razorpay webhook signature
    const receivedSignature = req.headers.get("x-razorpay-signature");
    if (!receivedSignature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== receivedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const razorpayOrderId = event.payload?.payment?.entity?.order_id;
      const razorpayPaymentId = event.payload?.payment?.entity?.id;
      const method = event.payload?.payment?.entity?.method ?? "razorpay";
      const amount = event.payload?.payment?.entity?.amount ?? 0;

      if (!razorpayOrderId || !razorpayPaymentId) {
        return NextResponse.json({ error: "Missing payment data" }, { status: 400 });
      }

      // Find the order — only process if still PENDING (browser-close fallback)
      const order = await prisma.order.findUnique({
        where: { razorpayOrderId },
      });

      if (order && order.status === "PENDING") {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
          });

          await tx.payment.create({
            data: {
              orderId: order.id,
              razorpayPaymentId,
              razorpaySignature: receivedSignature,
              amount: amount / 100, // Convert paise to rupees
              status: "CAPTURED",
              method,
              gatewayMessage: "Captured via Razorpay webhook fallback",
            },
          });
        });

        console.log(`Order ${order.orderNumber} marked as PAID via Razorpay webhook.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
