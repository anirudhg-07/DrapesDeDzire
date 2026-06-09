// src/app/checkout/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase securely via Razorpay.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/checkout");

  const user = await currentUser();

  return (
    <CheckoutClient
      customerName={user?.fullName ?? undefined}
      customerEmail={user?.emailAddresses[0]?.emailAddress ?? undefined}
    />
  );
}
