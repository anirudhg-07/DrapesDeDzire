"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/actions/admin-orders";
import type { OrderStatus } from "@prisma/client";

const ALL_STATUSES: Array<{ value: OrderStatus; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const SHIPPING_STATUSES: OrderStatus[] = ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function OrderStatusForm({
  orderId,
  currentStatus,
  currentCarrier,
  currentTrackingId,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  currentCarrier: string;
  currentTrackingId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [carrier, setCarrier] = useState(currentCarrier);
  const [trackingId, setTrackingId] = useState(currentTrackingId);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showShipping = SHIPPING_STATUSES.includes(status);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setToast(null);

    startTransition(async () => {
      const result = await updateOrderStatusAction(
        orderId,
        status,
        showShipping ? carrier : undefined,
        showShipping ? trackingId : undefined
      );

      if (result.success) {
        setToast({ type: "success", message: "Order updated successfully." });
        router.refresh();
      } else {
        setToast({ type: "error", message: result.error ?? "Something went wrong." });
      }
    });
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8ddd5",
        borderRadius: "10px",
        padding: "24px",
      }}
    >
      <h2
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "#a08070",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          margin: "0 0 20px",
        }}
      >
        Update Order Status
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#5a3a2a",
              marginBottom: "6px",
              letterSpacing: "0.04em",
            }}
          >
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1.5px solid #e8ddd5",
              borderRadius: "8px",
              fontSize: "0.88rem",
              color: "#1a0a0e",
              background: "#faf8f5",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {showShipping && (
          <>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#5a3a2a",
                  marginBottom: "6px",
                  letterSpacing: "0.04em",
                }}
              >
                Shipping Carrier
              </label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. Shiprocket, Delhivery, DTDC"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #e8ddd5",
                  borderRadius: "8px",
                  fontSize: "0.88rem",
                  color: "#1a0a0e",
                  background: "#faf8f5",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#5a3a2a",
                  marginBottom: "6px",
                  letterSpacing: "0.04em",
                }}
              >
                Tracking ID / URL
              </label>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Tracking number or link"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #e8ddd5",
                  borderRadius: "8px",
                  fontSize: "0.88rem",
                  color: "#1a0a0e",
                  background: "#faf8f5",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </>
        )}

        {toast && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 600,
              background: toast.type === "success" ? "#dcfce7" : "#fee2e2",
              color: toast.type === "success" ? "#14532d" : "#991b1b",
              border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            }}
          >
            {toast.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          style={{
            alignSelf: "flex-start",
            padding: "10px 24px",
            background: isPending ? "#9a6a5a" : "#4A0E17",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: isPending ? "not-allowed" : "pointer",
            letterSpacing: "0.06em",
            transition: "background 0.15s",
          }}
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}