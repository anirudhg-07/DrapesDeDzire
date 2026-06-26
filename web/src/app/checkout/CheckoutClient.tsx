"use client";
// src/app/checkout/CheckoutClient.tsx
// Multi-step checkout controller: Address → Review → Payment

import React, { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { useRouter } from "next/navigation";
import AddressStep from "@/components/checkout/AddressStep";
import OrderReviewStep from "@/components/checkout/OrderReviewStep";
import PaymentStep from "@/components/checkout/PaymentStep";
import { createOrderAction } from "@/actions/orders";
import type { AddressInput } from "@/types/checkout";

type Step = 1 | 2 | 3;

interface RazorpayDetails {
  razorpayOrderId: string;
  internalOrderId: string;
  amount: number;
  keyId: string;
}

interface CheckoutClientProps {
  customerName?: string;
  customerEmail?: string;
}

const STEPS = [
  { num: 1, label: "Address" },
  { num: 2, label: "Review" },
  { num: 3, label: "Payment" },
];

export default function CheckoutClient({ customerName, customerEmail }: CheckoutClientProps) {
  const router = useRouter();
  const { items, itemCount, isLoading: cartLoading, refreshCart } = useCart();
  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState<AddressInput | null>(null);
  const [razorpayDetails, setRazorpayDetails] = useState<RazorpayDetails | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Redirect if cart becomes empty
  useEffect(() => {
    if (!cartLoading && itemCount === 0 && step === 1) {
      router.push("/collections");
    }
  }, [itemCount, cartLoading, step, router]);

  const handleAddressSubmit = (data: AddressInput) => {
    setAddress(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateOrder = async () => {
    if (!address || items.length === 0) return;
    setIsCreatingOrder(true);
    setOrderError("");

    try {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        size: i.size,
      }));

      const result = await createOrderAction(address, orderItems);

      if (
        result.success &&
        result.razorpayOrderId &&
        result.internalOrderId &&
        result.amount &&
        result.keyId
      ) {
        setRazorpayDetails({
          razorpayOrderId: result.razorpayOrderId,
          internalOrderId: result.internalOrderId,
          amount: result.amount,
          keyId: result.keyId,
        });
        setStep(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setOrderError(result.error ?? "Failed to create order. Please try again.");
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Loading state
  if (cartLoading || (itemCount === 0 && step === 1)) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9a7a50",
          fontSize: "0.9rem",
        }}
      >
        Loading your cart…
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "80vh",
        backgroundColor: "#FCFBF7",
        padding: "60px 0 80px",
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Page Title */}
        <div style={{ marginBottom: "40px" }}>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#D4AF37",
              fontWeight: 500,
              margin: "0 0 6px",
            }}
          >
            Secure Checkout
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 300,
              color: "#1a0a0e",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Complete Your Order
          </h1>
        </div>

        {/* Step Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "48px",
          }}
        >
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background:
                      step === s.num
                        ? "#4A0E17"
                        : step > s.num
                        ? "#D4AF37"
                        : "transparent",
                    border:
                      step === s.num
                        ? "none"
                        : step > s.num
                        ? "none"
                        : "1px solid rgba(74,14,23,0.25)",
                    color:
                      step === s.num || step > s.num ? "#fff" : "#9a7a50",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.3s",
                  }}
                >
                  {step > s.num ? "✓" : s.num}
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: step === s.num ? 600 : 400,
                    color: step === s.num ? "#1a0a0e" : "#9a7a50",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background:
                      step > s.num
                        ? "#D4AF37"
                        : "rgba(74,14,23,0.12)",
                    margin: "0 12px",
                    transition: "background 0.3s",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "6px",
            padding: "clamp(24px, 5vw, 44px)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
          }}
        >
          {orderError && (
            <div
              style={{
                padding: "14px 16px",
                background: "#fff1f1",
                border: "1px solid rgba(192,57,43,0.2)",
                borderRadius: "4px",
                marginBottom: "20px",
                fontSize: "0.88rem",
                color: "#c0392b",
              }}
            >
              ⚠ {orderError}
            </div>
          )}

          {step === 1 && <AddressStep onNext={handleAddressSubmit} />}

          {step === 2 && address && (
            <OrderReviewStep
              items={items}
              address={address}
              onBack={() => setStep(1)}
              onProceedToPayment={handleCreateOrder}
              isCreatingOrder={isCreatingOrder}
            />
          )}

          {step === 3 && razorpayDetails && (
            <PaymentStep
              razorpayOrderId={razorpayDetails.razorpayOrderId}
              internalOrderId={razorpayDetails.internalOrderId}
              amount={razorpayDetails.amount}
              keyId={razorpayDetails.keyId}
              customerName={customerName}
              customerEmail={customerEmail}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
