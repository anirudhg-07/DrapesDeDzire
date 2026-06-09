// src/app/checkout/success/page.tsx
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SuccessClient from "./SuccessClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Thank you for your order. Your saree is being prepared.",
  robots: { index: false, follow: false },
};

export default async function SuccessPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9a7a50",
          }}
        >
          Loading…
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
