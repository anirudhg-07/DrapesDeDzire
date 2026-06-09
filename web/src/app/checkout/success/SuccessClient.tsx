"use client";
/* eslint-disable react-hooks/purity */
// src/app/checkout/success/SuccessClient.tsx
// Order confirmation page

import React, { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "Your Order";
  const confettiRef = useRef<boolean>(false);

  // Simple confetti animation on mount
  useEffect(() => {
    if (confettiRef.current) return;
    confettiRef.current = true;

    const colors = ["#D4AF37", "#4A0E17", "#FCFBF7", "#9a7a50", "#c8a96e"];
    const container = document.body;

    for (let i = 0; i < 60; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: fixed;
        top: -10px;
        left: ${Math.random() * 100}vw;
        width: ${Math.random() * 8 + 4}px;
        height: ${Math.random() * 8 + 4}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
        pointer-events: none;
        z-index: 99999;
        animation: confettiFall ${Math.random() * 2 + 1.5}s ease-in forwards;
        animation-delay: ${Math.random() * 0.8}s;
        transform: rotate(${Math.random() * 360}deg);
      `;
      container.appendChild(particle);
      setTimeout(() => particle.remove(), 4000);
    }
  }, []);

  const timeline = [
    { label: "Order Placed", desc: "Your order has been confirmed", done: true },
    { label: "Payment Verified", desc: "Payment received & verified", done: true },
    { label: "Processing", desc: "We're preparing your saree", done: false },
    { label: "Shipped", desc: "On its way to you", done: false },
    { label: "Delivered", desc: "Enjoy your saree!", done: false },
  ];

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          to {
            top: 110vh;
            transform: rotate(720deg) translateX(${Math.random() > 0.5 ? "+" : "-"}${Math.random() * 80 + 20}px);
            opacity: 0;
          }
        }
        @keyframes successPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          minHeight: "80vh",
          backgroundColor: "#FCFBF7",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {/* Success Icon */}
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4A0E17, #7a1828)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 28px",
              animation: "successPop 0.5s ease both",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17l-5-5"
                stroke="#D4AF37"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Heading */}
          <div style={{ animation: "fadeUp 0.5s 0.2s ease both" }}>
            <p
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#D4AF37",
                fontWeight: 500,
                margin: "0 0 10px",
              }}
            >
              Thank you for your order
            </p>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                fontSize: "clamp(2rem, 6vw, 3.2rem)",
                fontWeight: 300,
                color: "#1a0a0e",
                margin: "0 0 12px",
                letterSpacing: "-0.01em",
              }}
            >
              Order Confirmed! 🎉
            </h1>
            <p style={{ fontSize: "0.95rem", color: "#6b4c3b", margin: "0 0 6px" }}>
              Your order number is:
            </p>
            <p
              style={{
                fontSize: "1.1rem",
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#4A0E17",
                background: "rgba(74,14,23,0.06)",
                display: "inline-block",
                padding: "8px 20px",
                borderRadius: "4px",
                margin: "0 0 32px",
                letterSpacing: "0.05em",
              }}
            >
              {orderNumber}
            </p>
          </div>

          {/* Order Timeline */}
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              padding: "28px 32px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              marginBottom: "36px",
              textAlign: "left",
              animation: "fadeUp 0.5s 0.35s ease both",
            }}
          >
            <h3
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#9a7a50",
                margin: "0 0 24px",
              }}
            >
              Order Status
            </h3>
            {timeline.map((item, idx) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                  marginBottom: idx < timeline.length - 1 ? "20px" : 0,
                  position: "relative",
                }}
              >
                {/* Connector line */}
                {idx < timeline.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "32px",
                      width: "2px",
                      height: "calc(100% + 20px)",
                      background: item.done ? "#D4AF37" : "rgba(74,14,23,0.1)",
                    }}
                  />
                )}
                {/* Dot */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: item.done ? "#4A0E17" : "rgba(74,14,23,0.08)",
                    border: item.done ? "none" : "2px solid rgba(74,14,23,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {item.done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="#D4AF37"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "rgba(74,14,23,0.2)",
                      }}
                    />
                  )}
                </div>
                {/* Label */}
                <div>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontWeight: 600,
                      fontSize: "0.92rem",
                      color: item.done ? "#1a0a0e" : "#b0a090",
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.8rem",
                      color: item.done ? "#6b4c3b" : "#c8b8a8",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
              animation: "fadeUp 0.5s 0.5s ease both",
            }}
          >
            <Link
              href="/collections"
              style={{
                display: "inline-block",
                padding: "14px 32px",
                background: "#4A0E17",
                color: "#FCFBF7",
                borderRadius: "3px",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Continue Shopping
            </Link>
            <Link
              href="/account"
              style={{
                display: "inline-block",
                padding: "14px 32px",
                background: "transparent",
                color: "#4A0E17",
                border: "1px solid rgba(74,14,23,0.25)",
                borderRadius: "3px",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              View Orders
            </Link>
          </div>

          <p
            style={{
              marginTop: "28px",
              fontSize: "0.8rem",
              color: "#b0a090",
              letterSpacing: "0.04em",
            }}
          >
            A confirmation will be sent to your registered email.
          </p>
        </div>
      </div>
    </>
  );
}
