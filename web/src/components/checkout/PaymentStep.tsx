"use client";
// src/components/checkout/PaymentStep.tsx
// Step 3: Opens Razorpay Hosted Checkout modal

import React, { useEffect, useRef, useState } from "react";
import { verifyPaymentAction } from "@/actions/orders";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface PaymentStepProps {
  razorpayOrderId: string;
  internalOrderId: string;
  amount: number; // in paise
  keyId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onBack: () => void;
}

type PaymentState = "idle" | "loading" | "verifying" | "success" | "failed" | "cancelled";

export default function PaymentStep({
  razorpayOrderId,
  internalOrderId,
  amount,
  keyId,
  customerName,
  customerEmail,
  customerPhone,
  onBack,
}: PaymentStepProps) {
  const router = useRouter();
  const [state, setState] = useState<PaymentState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const rzpRef = useRef<RazorpayInstance | null>(null);

  const isMock =
    razorpayOrderId.startsWith("order_mock_") ||
    keyId === "rzp_test_mockkeyid" ||
    keyId.includes("xxxxxxxxxxxxxxxx");

  // Dynamically load Razorpay checkout.js only if not in mock mode
  useEffect(() => {
    if (!isMock && typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isMock]);

  const openRazorpay = () => {
    if (!window.Razorpay) {
      setErrorMsg("Payment gateway is loading. Please wait a moment and try again.");
      return;
    }

    setState("loading");
    setErrorMsg("");

    const options: RazorpayOptions = {
      key: keyId,
      amount,
      currency: "INR",
      name: "Drapes De Dzire",
      description: "Premium Indian Sarees",
      order_id: razorpayOrderId,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      theme: { color: "#4A0E17" },
      handler: async (response) => {
        setState("verifying");
        try {
          const result = await verifyPaymentAction(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            internalOrderId
          );
          if (result.success && result.orderNumber) {
            setState("success");
            router.push(`/checkout/success?order=${result.orderNumber}`);
          } else {
            setState("failed");
            setErrorMsg(result.error ?? "Payment verification failed. Please contact support.");
          }
        } catch {
          setState("failed");
          setErrorMsg("An error occurred during verification. Please contact support.");
        }
      },
      modal: {
        ondismiss: () => {
          setState("cancelled");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzpRef.current = rzp;
    rzp.open();
    setState("idle");
  };

  const handleMockPayment = async () => {
    setState("verifying");
    setErrorMsg("");
    // Realistic artificial delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const result = await verifyPaymentAction(
        razorpayOrderId,
        `pay_mock_${Date.now()}`,
        `sig_mock_${Date.now()}`,
        internalOrderId
      );
      if (result.success && result.orderNumber) {
        setState("success");
        router.push(`/checkout/success?order=${result.orderNumber}`);
      } else {
        setState("failed");
        setErrorMsg(result.error ?? "Payment verification failed. Please contact support.");
      }
    } catch {
      setState("failed");
      setErrorMsg("An error occurred during verification. Please contact support.");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
          fontSize: "1.6rem",
          fontWeight: 500,
          color: "#1a0a0e",
          margin: "0 0 6px",
        }}
      >
        Complete Payment
      </h2>
      <p style={{ fontSize: "0.85rem", color: "#9a7a50", margin: "0 0 40px" }}>
        {isMock
          ? "No real credentials found. You can simulate checkout completion."
          : "You will be redirected to Razorpay's secure payment gateway."}
      </p>

      {/* Amount Card */}
      <div
        style={{
          background: "rgba(74,14,23,0.03)",
          border: "1px solid rgba(74,14,23,0.12)",
          borderRadius: "8px",
          padding: "32px",
          marginBottom: "32px",
        }}
      >
        <p style={{ fontSize: "0.78rem", letterSpacing: "0.12em", color: "#9a7a50", textTransform: "uppercase", margin: "0 0 8px" }}>
          Amount Payable
        </p>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2.8rem",
            fontWeight: 700,
            color: "#4A0E17",
            margin: "0 0 12px",
          }}
        >
          {formatPrice(amount / 100)}
        </p>
        <p style={{ fontSize: "0.78rem", color: "#b0a090", margin: 0 }}>
          {isMock
            ? "Mock Order Session · No actual charge"
            : "Inclusive of all taxes · Razorpay secured"}
        </p>
      </div>

      {isMock && (
        <div
          style={{
            padding: "16px",
            background: "rgba(212,175,55,0.08)",
            border: "1px solid rgba(212,175,55,0.25)",
            borderRadius: "4px",
            marginBottom: "24px",
            fontSize: "0.85rem",
            color: "#6b4c3b",
            textAlign: "left",
            lineHeight: "1.4",
          }}
        >
          <div style={{ fontWeight: 700, color: "#4A0E17", marginBottom: "4px" }}>
            ⚠️ Mock Payment Simulator
          </div>
          No real Razorpay credentials found in your <code>.env</code> file. You can test the end-to-end flow by clicking the button below to simulate a successful sandbox payment.
        </div>
      )}

      {/* Payment State Messages */}
      {state === "verifying" && (
        <div
          style={{
            padding: "16px",
            background: "#f0f7ff",
            borderRadius: "4px",
            marginBottom: "20px",
            fontSize: "0.88rem",
            color: "#2563eb",
          }}
        >
          ⏳ {isMock ? "Simulating payment success…" : "Verifying your payment… please do not close this page."}
        </div>
      )}

      {state === "cancelled" && (
        <div
          style={{
            padding: "16px",
            background: "#fff7ed",
            borderRadius: "4px",
            marginBottom: "20px",
            fontSize: "0.88rem",
            color: "#c2410c",
          }}
        >
          Payment was cancelled. You can try again when ready.
        </div>
      )}

      {state === "failed" && (
        <div
          style={{
            padding: "16px",
            background: "#fff1f1",
            borderRadius: "4px",
            marginBottom: "20px",
            fontSize: "0.88rem",
            color: "#c0392b",
          }}
        >
          {errorMsg}
        </div>
      )}

      {errorMsg && state === "idle" && (
        <div
          style={{
            padding: "16px",
            background: "#fff1f1",
            borderRadius: "4px",
            marginBottom: "20px",
            fontSize: "0.88rem",
            color: "#c0392b",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Pay Button */}
      <button
        onClick={isMock ? handleMockPayment : openRazorpay}
        disabled={state === "verifying" || state === "success"}
        style={{
          width: "100%",
          padding: "18px",
          background:
            state === "verifying" || state === "success"
              ? "#a0a0a0"
              : "linear-gradient(135deg, #4A0E17, #6d1422)",
          color: "#FCFBF7",
          border: "none",
          borderRadius: "3px",
          cursor:
            state === "verifying" || state === "success" ? "not-allowed" : "pointer",
          fontSize: "1rem",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontFamily: "inherit",
          transition: "opacity 0.2s",
          marginBottom: "12px",
        }}
        onMouseEnter={(e) => {
          if (state !== "verifying") (e.currentTarget.style.opacity = "0.88");
        }}
        onMouseLeave={(e) => {
          (e.currentTarget.style.opacity = "1");
        }}
      >
        {state === "verifying"
          ? isMock
            ? "Processing Sandbox Payment…"
            : "Verifying Payment…"
          : state === "cancelled" || state === "failed"
          ? "Retry Payment"
          : isMock
          ? "Simulate Successful Sandbox Payment"
          : "Pay Securely with Razorpay"}
      </button>

      <button
        onClick={onBack}
        disabled={state === "verifying"}
        style={{
          width: "100%",
          padding: "14px",
          background: "transparent",
          color: "#4A0E17",
          border: "1px solid rgba(74,14,23,0.2)",
          borderRadius: "3px",
          cursor: "pointer",
          fontSize: "0.82rem",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "inherit",
        }}
      >
        ← Back to Review
      </button>

      {/* Trust Badges */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          marginTop: "24px",
          flexWrap: "wrap",
        }}
      >
        {["🔒 SSL Secured", "🏦 Bank-Grade Encryption", "✅ RBI Compliant"].map((badge) => (
          <span
            key={badge}
            style={{
              fontSize: "0.72rem",
              color: "#9a7a50",
              letterSpacing: "0.06em",
            }}
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
