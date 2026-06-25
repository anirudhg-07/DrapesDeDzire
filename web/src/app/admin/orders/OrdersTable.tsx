"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: unknown;
  createdAt: Date;
  user: { fullName: string | null; email: string } | null;
  orderItems: { id: string }[];
  shippingAddress: { fullName: string; city: string; state: string } | null;
};

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

const FILTERS: Array<{ label: string; value: OrderStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Paid", value: "PAID" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "ALL">("ALL");

  const filtered =
    activeFilter === "ALL" ? orders : orders.filter((o) => o.status === activeFilter);

  return (
    <div>
      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {FILTERS.map((f) => {
          const count =
            f.value === "ALL"
              ? orders.length
              : orders.filter((o) => o.status === f.value).length;
          const active = activeFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: active ? "1.5px solid #4A0E17" : "1.5px solid #e8ddd5",
                background: active ? "#4A0E17" : "#fff",
                color: active ? "#fff" : "#7a5c4a",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            color: "#a08070",
            fontSize: "0.9rem",
          }}
        >
          No orders found.
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #e8ddd5",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <table style={{ width: "100%", minWidth: "720px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#faf4ef", borderBottom: "1px solid #e8ddd5" }}>
                {["Order #", "Customer", "Date", "Items", "Total", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#7a5c4a",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        ...(h === ""
                          ? { position: "sticky", right: 0, background: "#faf4ef", boxShadow: "-6px 0 8px -6px rgba(0,0,0,0.12)" }
                          : {}),
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const colors = STATUS_COLORS[order.status];
                const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom:
                        i < filtered.length - 1 ? "1px solid #f0e8e0" : "none",
                    }}
                  >
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "#1a0a0e",
                        fontFamily: "var(--font-mono, monospace)",
                      }}
                    >
                      {order.orderNumber}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#2a1a10" }}>
                        {order.user?.fullName || order.shippingAddress?.fullName || "—"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#a08070", marginTop: "2px" }}>
                        {order.user?.email || "—"}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "0.82rem",
                        color: "#5a3a2a",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {date}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "0.82rem",
                        color: "#5a3a2a",
                        textAlign: "center",
                      }}
                    >
                      {order.orderItems.length}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "#1a0a0e",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatPrice(Number(order.totalAmount))}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          background: colors.bg,
                          color: colors.text,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", position: "sticky", right: 0, background: "#fff", boxShadow: "-6px 0 8px -6px rgba(0,0,0,0.12)" }}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        style={{
                          display: "inline-block",
                          padding: "6px 14px",
                          background: "#4A0E17",
                          color: "#fff",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}