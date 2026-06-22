import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminOrderByIdAction } from "@/actions/admin-orders";
import { formatPrice } from "@/lib/utils";
import OrderStatusForm from "./OrderStatusForm";
import Image from "next/image";

export const metadata = { title: "Order Detail — Admin" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "#f3f0e8", text: "#8a6a2a" },
  PAID: { bg: "#fef3c7", text: "#92400e" },
  PROCESSING: { bg: "#dbeafe", text: "#1e40af" },
  SHIPPED: { bg: "#e0e7ff", text: "#3730a3" },
  OUT_FOR_DELIVERY: { bg: "#d1fae5", text: "#065f46" },
  DELIVERED: { bg: "#dcfce7", text: "#14532d" },
  CANCELLED: { bg: "#fee2e2", text: "#991b1b" },
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { order } = await getAdminOrderByIdAction(id);
  if (!order) notFound();

  const addr = order.shippingAddress;
  const colors = STATUS_COLORS[order.status] ?? { bg: "#f3f0e8", text: "#8a6a2a" };
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div style={{ maxWidth: "900px" }}>
      {/* Back link */}
      <Link
        href="/admin/orders"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#7a5c4a",
          fontSize: "0.82rem",
          textDecoration: "none",
          marginBottom: "20px",
        }}
      >
        ← All Orders
      </Link>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#1a0a0e",
              fontFamily: "var(--font-playfair)",
              margin: 0,
            }}
          >
            {order.orderNumber}
          </h1>
          <p style={{ color: "#a08070", fontSize: "0.82rem", marginTop: "4px" }}>{date}</p>
        </div>
        <span
          style={{
            display: "inline-block",
            padding: "5px 14px",
            borderRadius: "14px",
            background: colors.bg,
            color: colors.text,
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
          }}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        {/* Customer info */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8ddd5",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#a08070",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              margin: "0 0 12px",
            }}
          >
            Customer
          </h2>
          <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#2a1a10", fontSize: "0.9rem" }}>
            {order.user?.fullName || addr.fullName}
          </p>
          <p style={{ margin: "0 0 4px", color: "#5a3a2a", fontSize: "0.82rem" }}>
            {order.user?.email}
          </p>
          <p style={{ margin: 0, color: "#5a3a2a", fontSize: "0.82rem" }}>{addr.phone}</p>
        </div>

        {/* Shipping address */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8ddd5",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#a08070",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              margin: "0 0 12px",
            }}
          >
            Shipping Address
          </h2>
          <p style={{ margin: "0 0 2px", fontWeight: 600, color: "#2a1a10", fontSize: "0.9rem" }}>
            {addr.fullName}
          </p>
          <p style={{ margin: "0 0 2px", color: "#5a3a2a", fontSize: "0.82rem" }}>{addr.line1}</p>
          {addr.line2 && (
            <p style={{ margin: "0 0 2px", color: "#5a3a2a", fontSize: "0.82rem" }}>{addr.line2}</p>
          )}
          {addr.landmark && (
            <p style={{ margin: "0 0 2px", color: "#5a3a2a", fontSize: "0.82rem" }}>
              Near {addr.landmark}
            </p>
          )}
          <p style={{ margin: "0 0 2px", color: "#5a3a2a", fontSize: "0.82rem" }}>
            {addr.city}, {addr.state} — {addr.pincode}
          </p>
          <p style={{ margin: 0, color: "#5a3a2a", fontSize: "0.82rem" }}>{addr.phone}</p>
        </div>
      </div>

      {/* Order items */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8ddd5",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "#a08070",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            margin: "0 0 16px",
          }}
        >
          Items ({order.orderItems.length})
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {order.orderItems.map((item) => {
            const img = item.product.images[0]?.imageUrl;
            return (
              <div
                key={item.id}
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                {img ? (
                  <Image
                    src={img}
                    alt={item.product.name}
                    width={56}
                    height={72}
                    style={{ objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56,
                      height: 72,
                      background: "#f3ece4",
                      borderRadius: "6px",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: "0 0 3px",
                      fontWeight: 600,
                      color: "#1a0a0e",
                      fontSize: "0.88rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.product.name}
                  </p>
                  <p style={{ margin: 0, color: "#a08070", fontSize: "0.78rem" }}>
                    Qty: {item.quantity}
                  </p>
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: "#1a0a0e", fontSize: "0.88rem", whiteSpace: "nowrap" }}>
                  {formatPrice(Number(item.priceAtPurchase) * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>
        <div
          style={{
            borderTop: "1px solid #f0e8e0",
            marginTop: "16px",
            paddingTop: "14px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 700, color: "#1a0a0e", fontSize: "0.9rem" }}>Total</span>
          <span style={{ fontWeight: 700, color: "#4A0E17", fontSize: "1rem" }}>
            {formatPrice(Number(order.totalAmount))}
          </span>
        </div>
      </div>

      {/* Payment info */}
      {order.payments.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8ddd5",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#a08070",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              margin: "0 0 12px",
            }}
          >
            Payment
          </h2>
          {order.payments.map((p) => (
            <div key={p.id} style={{ fontSize: "0.82rem", color: "#5a3a2a" }}>
              <p style={{ margin: "0 0 4px" }}>
                <strong>ID:</strong> {p.razorpayPaymentId}
              </p>
              <p style={{ margin: "0 0 4px" }}>
                <strong>Method:</strong> {p.method}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Status:</strong> {p.status}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Status update form */}
      <OrderStatusForm
        orderId={order.id}
        currentStatus={order.status}
        currentCarrier={order.shippingCarrier ?? ""}
        currentTrackingId={order.shippingTrackingId ?? ""}
      />
    </div>
  );
}