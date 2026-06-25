// src/app/orders/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, Truck } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { getUserOrdersAction } from "@/actions/orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Orders — Drapes De Dzire" };

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  PENDING: { bg: "#f3f0e8", text: "#8a6a2a" },
  PAID: { bg: "#fef3c7", text: "#92400e" },
  PROCESSING: { bg: "#dbeafe", text: "#1e40af" },
  SHIPPED: { bg: "#e0e7ff", text: "#3730a3" },
  OUT_FOR_DELIVERY: { bg: "#d1fae5", text: "#065f46" },
  DELIVERED: { bg: "#dcfce7", text: "#14532d" },
  CANCELLED: { bg: "#fee2e2", text: "#991b1b" },
};

const inr = (v: unknown) => `₹${Number(v).toLocaleString("en-IN")}`;
const formatDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default async function OrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/orders");

  const { orders } = await getUserOrdersAction();

  return (
    <div className="section-container" style={{ paddingTop: "3rem", paddingBottom: "5rem", maxWidth: "920px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-gold-600)", fontWeight: 700, fontFamily: "var(--font-sans)" }}>
          Drapes De Dzire
        </p>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontFamily: "var(--font-serif)", color: "var(--color-maroon)", margin: "6px 0 0", fontWeight: 600 }}>
          My Orders
        </h1>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "var(--color-cream)", border: "1px dashed var(--color-cream-200)", borderRadius: "8px" }}>
          <Package size={40} style={{ color: "var(--color-gold)", marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.25rem", fontFamily: "var(--font-serif)", color: "var(--color-maroon)", marginBottom: "0.5rem" }}>
            No orders yet
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--color-brown-500)", marginBottom: "1.5rem", fontFamily: "var(--font-sans)" }}>
            When you place an order, it will appear here.
          </p>
          <Link href="/collections" className="btn-maroon" style={{ padding: "0.7rem 1.75rem", textDecoration: "none" }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {orders.map((order) => {
            const status = STATUS_COLORS[order.status];
            const itemCount = order.orderItems.reduce((n, it) => n + it.quantity, 0);
            return (
              <div key={order.id} style={{ background: "#fff", border: "1px solid var(--color-cream-200)", borderRadius: "10px", overflow: "hidden" }}>
                {/* Order header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-cream-100)", background: "var(--color-ivory)" }}>
                  <div>
                    <p style={{ fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-brown-300)", margin: 0, fontFamily: "var(--font-sans)" }}>
                      Order {order.orderNumber}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-brown-500)", margin: "2px 0 0", fontFamily: "var(--font-sans)" }}>
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.3rem 0.75rem", borderRadius: "999px", background: status.bg, color: status.text, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* Items */}
                <div style={{ padding: "0.5rem 1.25rem" }}>
                  {order.orderItems.map((item) => {
                    const img = item.product.images[0]?.imageUrl;
                    return (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "0.85rem 0", borderBottom: "1px solid var(--color-cream-100)" }}>
                        <div style={{ position: "relative", width: "56px", height: "70px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, background: "var(--color-cream)" }}>
                          {img && <Image src={img} alt={item.product.name} fill sizes="56px" style={{ objectFit: "cover" }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link href={`/products/${item.product.id}`} style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-brown)", textDecoration: "none", fontFamily: "var(--font-sans)" }}>
                            {item.product.name}
                          </Link>
                          <p style={{ fontSize: "0.8rem", color: "var(--color-brown-300)", margin: "3px 0 0", fontFamily: "var(--font-sans)" }}>
                            Qty {item.quantity} · {inr(item.priceAtPurchase)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer: tracking + total */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", padding: "1rem 1.25rem", background: "var(--color-ivory)" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-brown-500)", fontFamily: "var(--font-sans)" }}>
                    {order.shippingTrackingId ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <Truck size={15} style={{ color: "var(--color-gold-600)" }} />
                        {order.shippingCarrier ? `${order.shippingCarrier}: ` : ""}{order.shippingTrackingId}
                      </span>
                    ) : (
                      <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                    <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-maroon)", fontFamily: "var(--font-sans)" }}>
                      Total {inr(order.totalAmount)}
                    </span>
                    <Link href={`/orders/${order.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-gold-600)", textDecoration: "none", fontFamily: "var(--font-sans)" }}>
                      View Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
