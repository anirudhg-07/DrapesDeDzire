"use client";
// src/components/cart/CartDrawer.tsx
// Premium slide-in cart drawer with quantity controls and order CTA

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

export default function CartDrawer() {
  const router = useRouter();
  const { items, itemCount, subtotal, isOpen, closeCart, removeItem, updateQty, isLoading } =
    useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [closeCart]);

  const primaryImage = (item: (typeof items)[0]) => {
    const img = item.product.images.find((i) => i.isPrimary) ?? item.product.images[0];
    return img?.imageUrl ?? null;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 9998,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
          backdropFilter: isOpen ? "blur(2px)" : "none",
        }}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(480px, 100vw)",
          background: "#FCFBF7",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 28px 20px",
            borderBottom: "1px solid rgba(74,14,23,0.1)",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "#1a0a0e",
                margin: 0,
                letterSpacing: "0.02em",
              }}
            >
              Your Cart
            </h2>
            {itemCount > 0 && (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#9a7a50",
                  margin: "2px 0 0",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              color: "#4A0E17",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,14,23,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: items.length === 0 ? "0" : "12px 0",
          }}
        >
          {items.length === 0 ? (
            /* Empty State */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: "40px 28px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "rgba(74,14,23,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"
                    stroke="#4A0E17"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.5"
                  />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.3rem",
                  color: "#1a0a0e",
                  margin: "0 0 8px",
                  fontWeight: 500,
                }}
              >
                Your cart is empty
              </h3>
              <p style={{ color: "#9a7a50", fontSize: "0.9rem", margin: "0 0 24px" }}>
                Discover our curated collection of handcrafted sarees.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  router.push("/collections");
                }}
                style={{
                  background: "#4A0E17",
                  color: "#FCFBF7",
                  border: "none",
                  padding: "12px 28px",
                  borderRadius: "2px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "0.85rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                Browse Collections
              </button>
            </div>
          ) : (
            items.map((item) => {
              const imgUrl = primaryImage(item);
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "16px",
                    padding: "16px 28px",
                    borderBottom: "1px solid rgba(74,14,23,0.07)",
                    opacity: isLoading ? 0.6 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {/* Product Image */}
                  <div
                    style={{
                      width: "88px",
                      height: "110px",
                      flexShrink: 0,
                      borderRadius: "3px",
                      overflow: "hidden",
                      background: "#f0ece4",
                    }}
                  >
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={item.product.name}
                        width={88}
                        height={110}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(135deg, #f0ece4, #e8e0d5)",
                        }}
                      />
                    )}
                  </div>

                  {/* Product Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "#1a0a0e",
                        margin: "0 0 4px",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.product.name}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "#9a7a50",
                        margin: "0 0 12px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {item.product.fabric} · {item.product.colour}
                    </p>

                    {/* Quantity Controls */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0",
                        width: "fit-content",
                        border: "1px solid rgba(74,14,23,0.2)",
                        borderRadius: "2px",
                      }}
                    >
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        disabled={isLoading}
                        aria-label="Decrease quantity"
                        style={{
                          width: "32px",
                          height: "32px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#4A0E17",
                          fontSize: "1.1rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "background 0.15s",
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          minWidth: "32px",
                          textAlign: "center",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          color: "#1a0a0e",
                          padding: "0 4px",
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        disabled={isLoading || item.quantity >= item.product.stock}
                        aria-label="Increase quantity"
                        style={{
                          width: "32px",
                          height: "32px",
                          background: "none",
                          border: "none",
                          cursor: item.quantity >= item.product.stock ? "not-allowed" : "pointer",
                          color: item.quantity >= item.product.stock ? "#ccc" : "#4A0E17",
                          fontSize: "1.1rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Price + Remove row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: "10px",
                      }}
                    >
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
                      <button
                        onClick={() => removeItem(item.productId)}
                        disabled={isLoading}
                        aria-label="Remove item"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#c0a070",
                          fontSize: "0.75rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          textDecoration: "underline",
                          textUnderlineOffset: "3px",
                          fontFamily: "inherit",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Order Total & CTA */}
        {items.length > 0 && (
          <div
            style={{
              padding: "20px 28px 28px",
              borderTop: "1px solid rgba(74,14,23,0.1)",
              background: "#FCFBF7",
            }}
          >
            {/* Order Summary */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "0.85rem", color: "#666", letterSpacing: "0.05em" }}>
                  Subtotal
                </span>
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1rem",
                    color: "#1a0a0e",
                    fontWeight: 600,
                  }}
                >
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.85rem", color: "#666", letterSpacing: "0.05em" }}>
                  Shipping
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "#4A0E17",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                  }}
                >
                  Calculated at checkout
                </span>
              </div>
              <div
                style={{
                  height: "1px",
                  background: "rgba(74,14,23,0.1)",
                  margin: "14px 0",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.9rem",
                    color: "#1a0a0e",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.3rem",
                    color: "#4A0E17",
                    fontWeight: 700,
                  }}
                >
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            {/* Proceed to Checkout */}
            <button
              onClick={() => {
                closeCart();
                router.push("/checkout");
              }}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "16px",
                background: "linear-gradient(135deg, #4A0E17, #6d1422)",
                color: "#FCFBF7",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "0.9rem",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                transition: "opacity 0.2s, transform 0.15s",
                marginBottom: "10px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Proceed to Checkout
            </button>

            <button
              onClick={closeCart}
              style={{
                width: "100%",
                padding: "12px",
                background: "transparent",
                color: "#4A0E17",
                border: "1px solid rgba(74,14,23,0.25)",
                borderRadius: "2px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "0.82rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Continue Shopping
            </button>

            <p
              style={{
                textAlign: "center",
                fontSize: "0.75rem",
                color: "#b0a090",
                marginTop: "12px",
                letterSpacing: "0.04em",
              }}
            >
              Secured by Razorpay · Pan-India Shipping
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
