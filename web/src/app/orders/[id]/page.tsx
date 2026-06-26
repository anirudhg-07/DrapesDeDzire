// src/app/orders/[id]/page.tsx
import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, MapPin, CreditCard, Truck, Package, Check, Clock, MessageCircle } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { getOrderByIdAction } from "@/actions/orders";

export const dynamic = "force-dynamic";

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

const TIMELINE: { key: OrderStatus; label: string }[] = [
  { key: "PENDING", label: "Order Placed" },
  { key: "PAID", label: "Payment Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

const inr = (v: unknown) => `₹${Number(v).toLocaleString("en-IN")}`;
const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--color-cream-200)", borderRadius: "10px", padding: "1.25rem 1.25rem 1.4rem" }}>
      <h2 style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-brown-300)", margin: "0 0 1rem", fontFamily: "var(--font-sans)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

const rowLabel: React.CSSProperties = { fontSize: "0.8rem", color: "var(--color-brown-300)", fontFamily: "var(--font-sans)" };
const rowValue: React.CSSProperties = { fontSize: "0.9rem", color: "var(--color-brown)", fontWeight: 600, fontFamily: "var(--font-sans)", textAlign: "right" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=/orders/${id}`);

  const { order } = await getOrderByIdAction(id);
  if (!order) notFound();

  const status = STATUS_COLORS[order.status];
  const isCancelled = order.status === "CANCELLED";
  const currentIdx = TIMELINE.findIndex((s) => s.key === order.status);
  const payment = order.payments[0];

  // No explicit delivery date in the schema — estimate 7 days from placement.
  const expected = new Date(order.createdAt);
  expected.setDate(expected.getDate() + 7);

  const addr = order.shippingAddress;
  const trackQuery = order.shippingTrackingId
    ? `https://www.google.com/search?q=${encodeURIComponent(`${order.shippingCarrier || ""} ${order.shippingTrackingId} tracking`)}`
    : null;

  return (
    <div className="section-container" style={{ paddingTop: "2rem", paddingBottom: "5rem", maxWidth: "760px" }}>
      <Link href="/orders" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.82rem", color: "var(--color-brown-500)", textDecoration: "none", marginBottom: "1.25rem", fontFamily: "var(--font-sans)" }}>
        <ChevronLeft size={16} /> Back to My Orders
      </Link>

      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontFamily: "var(--font-serif)", color: "var(--color-maroon)", margin: 0, fontWeight: 600 }}>
          Order {order.orderNumber}
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--color-brown-500)", margin: "6px 0 0", fontFamily: "var(--font-sans)" }}>
          Placed on {fmtDate(order.createdAt)}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Order Status + Expected Delivery */}
        <Section title="Order Status">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, padding: "0.35rem 0.85rem", borderRadius: "999px", background: status.bg, color: status.text, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {STATUS_LABELS[order.status]}
            </span>
            <div style={{ textAlign: "right" }}>
              <p style={rowLabel}>{order.status === "DELIVERED" ? "Delivered" : "Expected Delivery"}</p>
              <p style={{ ...rowValue, color: "var(--color-maroon)" }}>
                {isCancelled ? "—" : order.status === "DELIVERED" ? fmtDate(order.updatedAt) : `By ${fmtDate(expected)}`}
              </p>
            </div>
          </div>
        </Section>

        {/* Product Details */}
        <Section title="Product Details">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {order.orderItems.map((item, idx) => {
              const img = item.product.images[0]?.imageUrl;
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "0.75rem 0", borderTop: idx === 0 ? "none" : "1px solid var(--color-cream-100)" }}>
                  <div style={{ position: "relative", width: "58px", height: "72px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, background: "var(--color-cream)" }}>
                    {img && <Image src={img} alt={item.product.name} fill sizes="58px" style={{ objectFit: "cover" }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/products/${item.product.id}`} style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-brown)", textDecoration: "none", fontFamily: "var(--font-sans)" }}>
                      {item.product.name}
                    </Link>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-brown-300)", margin: "3px 0 0", fontFamily: "var(--font-sans)" }}>
                      Qty {item.quantity}{item.size ? ` · Size ${item.size}` : ""}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-brown)", fontFamily: "var(--font-sans)", whiteSpace: "nowrap" }}>
                    {inr(Number(item.priceAtPurchase) * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--color-cream-200)" }}>
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-maroon)", fontFamily: "var(--font-sans)" }}>Order Total</span>
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-maroon)", fontFamily: "var(--font-sans)" }}>{inr(order.totalAmount)}</span>
          </div>
        </Section>

        {/* Delivery Address */}
        <Section title="Delivery Address">
          {addr ? (
            <div style={{ display: "flex", gap: "10px" }}>
              <MapPin size={18} style={{ color: "var(--color-gold-600)", flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: "0.88rem", color: "var(--color-brown)", lineHeight: 1.6, fontFamily: "var(--font-sans)" }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{addr.fullName}</p>
                <p style={{ margin: "2px 0 0" }}>
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}{addr.landmark ? `, near ${addr.landmark}` : ""}
                </p>
                <p style={{ margin: "2px 0 0" }}>{addr.city}, {addr.state} — {addr.pincode}</p>
                <p style={{ margin: "6px 0 0", color: "var(--color-brown-500)" }}>
                  Phone: {addr.phone}{addr.alternatePhone ? ` · ${addr.alternatePhone}` : ""}
                </p>
              </div>
            </div>
          ) : (
            <p style={rowLabel}>No address on file.</p>
          )}
        </Section>

        {/* Payment Details */}
        <Section title="Payment Details">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...rowLabel, display: "inline-flex", alignItems: "center", gap: "6px" }}><CreditCard size={15} /> Method</span>
              <span style={rowValue}>{payment?.method ? payment.method.toUpperCase() : "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={rowLabel}>Payment Status</span>
              <span style={rowValue}>{payment?.status ?? (order.status === "PENDING" ? "Pending" : "—")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={rowLabel}>Amount Paid</span>
              <span style={rowValue}>{inr(payment?.amount ?? order.totalAmount)}</span>
            </div>
            {payment?.razorpayPaymentId && (
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <span style={rowLabel}>Transaction ID</span>
                <span style={{ ...rowValue, fontSize: "0.78rem", wordBreak: "break-all" }}>{payment.razorpayPaymentId}</span>
              </div>
            )}
          </div>
        </Section>

        {/* Shipping Details */}
        <Section title="Shipping Details">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...rowLabel, display: "inline-flex", alignItems: "center", gap: "6px" }}><Truck size={15} /> Carrier</span>
              <span style={rowValue}>{order.shippingCarrier || "Assigned after dispatch"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
              <span style={rowLabel}>Tracking ID</span>
              <span style={{ ...rowValue, wordBreak: "break-all" }}>{order.shippingTrackingId || "Available once shipped"}</span>
            </div>
          </div>
        </Section>

        {/* Order Timeline */}
        <Section title="Order Timeline">
          {isCancelled ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#991b1b" }}>
              <Clock size={18} />
              <span style={{ fontSize: "0.88rem", fontWeight: 600, fontFamily: "var(--font-sans)" }}>This order was cancelled.</span>
            </div>
          ) : (
            <div>
              {TIMELINE.map((step, idx) => {
                const done = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                const last = idx === TIMELINE.length - 1;
                return (
                  <div key={step.key} style={{ display: "flex", gap: "14px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: done ? "var(--color-maroon)" : "var(--color-cream)", color: done ? "var(--color-gold-400)" : "var(--color-brown-300)", border: done ? "none" : "1px solid var(--color-cream-200)" }}>
                        {done ? <Check size={14} /> : <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />}
                      </div>
                      {!last && <div style={{ width: "2px", flex: 1, minHeight: "22px", background: idx < currentIdx ? "var(--color-maroon)" : "var(--color-cream-200)" }} />}
                    </div>
                    <div style={{ paddingBottom: last ? 0 : "0.5rem" }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: isCurrent ? 700 : 600, color: done ? "var(--color-brown)" : "var(--color-brown-300)", margin: 0, fontFamily: "var(--font-sans)" }}>
                        {step.label}
                      </p>
                      {idx === 0 && <p style={{ fontSize: "0.75rem", color: "var(--color-brown-300)", margin: "2px 0 0" }}>{fmtDate(order.createdAt)}</p>}
                      {isCurrent && idx !== 0 && <p style={{ fontSize: "0.75rem", color: "var(--color-brown-300)", margin: "2px 0 0" }}>{fmtDate(order.updatedAt)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "0.25rem" }}>
          {trackQuery ? (
            <a href={trackQuery} target="_blank" rel="noopener noreferrer" style={actionPrimary}>
              <Package size={16} /> Track Package
            </a>
          ) : (
            <span style={{ ...actionPrimary, opacity: 0.5, cursor: "not-allowed" }}>
              <Package size={16} /> Track Package
            </span>
          )}
          <a href={`mailto:hello@drapesdedzire.in?subject=${encodeURIComponent(`Support — Order ${order.orderNumber}`)}`} style={actionSecondary}>
            <MessageCircle size={16} /> Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

const actionPrimary: React.CSSProperties = {
  flex: 1,
  minWidth: "160px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "0.85rem",
  background: "var(--color-maroon)",
  color: "var(--color-ivory)",
  borderRadius: "3px",
  fontSize: "0.82rem",
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  textDecoration: "none",
  fontFamily: "var(--font-sans)",
};

const actionSecondary: React.CSSProperties = {
  flex: 1,
  minWidth: "160px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "0.85rem",
  background: "transparent",
  color: "var(--color-maroon)",
  border: "1px solid var(--color-maroon)",
  borderRadius: "3px",
  fontSize: "0.82rem",
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  textDecoration: "none",
  fontFamily: "var(--font-sans)",
};
