"use client";
// src/components/checkout/OrderReviewStep.tsx
// Step 2: Read-only order summary before payment

import React from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { CartItemWithProduct } from "@/types/cart";
import type { AddressInput } from "@/types/checkout";

interface OrderReviewStepProps {
  items: CartItemWithProduct[];
  address: AddressInput;
  onBack: () => void;
  onProceedToPayment: () => void;
  isCreatingOrder: boolean;
}

export default function OrderReviewStep({
  items,
  address,
  onBack,
  onProceedToPayment,
  isCreatingOrder,
}: OrderReviewStepProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.basePrice * item.quantity,
    0
  );

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
          fontSize: "1.6rem",
          fontWeight: 500,
          color: "#1a0a0e",
          margin: "0 0 6px",
        }}
      >
        Review Your Order
      </h2>
      <p style={{ fontSize: "0.85rem", color: "#9a7a50", margin: "0 0 32px" }}>
        Please verify all details before completing payment.
      </p>

      {/* Items */}
      <div
        style={{
          border: "1px solid rgba(74,14,23,0.12)",
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            background: "rgba(74,14,23,0.04)",
            borderBottom: "1px solid rgba(74,14,23,0.12)",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#6b4c3b",
            }}
          >
            Order Items ({items.length})
          </h3>
        </div>
        {items.map((item) => {
          const img =
            item.product.images.find((i) => i.isPrimary) ?? item.product.images[0];
          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: "16px",
                padding: "16px 20px",
                borderBottom: "1px solid rgba(74,14,23,0.07)",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "90px",
                  flexShrink: 0,
                  borderRadius: "3px",
                  overflow: "hidden",
                  background: "#f5f0ea",
                  position: "relative",
                }}
              >
                {img && (
                  <Image
                    src={img.imageUrl}
                    alt={item.product.name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="72px"
                  />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#1a0a0e",
                    margin: "0 0 4px",
                  }}
                >
                  {item.product.name}
                </h4>
                <p style={{ fontSize: "0.78rem", color: "#9a7a50", margin: "0 0 8px" }}>
                  {item.product.fabric} · {item.product.colour}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.82rem", color: "#666" }}>
                    Qty: {item.quantity}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#4A0E17",
                    }}
                  >
                    {formatPrice(item.product.basePrice * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delivery Address */}
      <div
        style={{
          border: "1px solid rgba(74,14,23,0.12)",
          borderRadius: "4px",
          marginBottom: "24px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            background: "rgba(74,14,23,0.04)",
            borderBottom: "1px solid rgba(74,14,23,0.12)",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#6b4c3b",
            }}
          >
            Delivery Address
          </h3>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <p
            style={{
              margin: "0 0 4px",
              fontWeight: 600,
              color: "#1a0a0e",
              fontSize: "0.95rem",
            }}
          >
            {address.fullName}
          </p>
          <p style={{ margin: "0 0 2px", color: "#555", fontSize: "0.88rem" }}>
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}
          </p>
          {address.landmark && (
            <p style={{ margin: "0 0 2px", color: "#555", fontSize: "0.88rem" }}>
              Near: {address.landmark}
            </p>
          )}
          <p style={{ margin: "0 0 2px", color: "#555", fontSize: "0.88rem" }}>
            {address.city}, {address.state} — {address.pincode}
          </p>
          <p style={{ margin: "4px 0 0", color: "#555", fontSize: "0.88rem" }}>
            📞 {address.phone}
            {address.alternatePhone ? ` / ${address.alternatePhone}` : ""}
          </p>
        </div>
      </div>

      {/* Price Summary */}
      <div
        style={{
          border: "1px solid rgba(74,14,23,0.12)",
          borderRadius: "4px",
          padding: "20px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span style={{ fontSize: "0.88rem", color: "#666" }}>Subtotal</span>
          <span style={{ fontSize: "0.88rem", color: "#1a0a0e", fontWeight: 500 }}>
            {formatPrice(subtotal)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <span style={{ fontSize: "0.88rem", color: "#666" }}>Shipping</span>
          <span style={{ fontSize: "0.88rem", color: "#4A0E17", fontWeight: 500 }}>
            {subtotal >= 5000 ? "Free" : "₹199"}
          </span>
        </div>
        <div
          style={{
            height: "1px",
            background: "rgba(74,14,23,0.1)",
            margin: "0 0 14px",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a0a0e" }}>
            Total Payable
          </span>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "#4A0E17",
            }}
          >
            {formatPrice(subtotal < 5000 ? subtotal + 199 : subtotal)}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={onBack}
          disabled={isCreatingOrder}
          style={{
            flex: "0 0 auto",
            padding: "15px 24px",
            background: "transparent",
            color: "#4A0E17",
            border: "1px solid rgba(74,14,23,0.25)",
            borderRadius: "3px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "inherit",
          }}
        >
          ← Edit Address
        </button>
        <button
          onClick={onProceedToPayment}
          disabled={isCreatingOrder}
          style={{
            flex: 1,
            padding: "15px",
            background: isCreatingOrder
              ? "#a0a0a0"
              : "linear-gradient(135deg, #4A0E17, #6d1422)",
            color: "#FCFBF7",
            border: "none",
            borderRadius: "3px",
            cursor: isCreatingOrder ? "not-allowed" : "pointer",
            fontSize: "0.9rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: "inherit",
            transition: "opacity 0.2s",
          }}
        >
          {isCreatingOrder ? "Preparing Order…" : "Proceed to Payment →"}
        </button>
      </div>
      <p
        style={{
          textAlign: "center",
          fontSize: "0.75rem",
          color: "#b0a090",
          marginTop: "16px",
          letterSpacing: "0.04em",
        }}
      >
        🔒 Secured payment via Razorpay · 100% safe checkout
      </p>
    </div>
  );
}
