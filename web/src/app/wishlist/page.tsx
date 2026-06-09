// src/app/wishlist/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import WishlistClient from "./WishlistClient";
import { getWishlistAction } from "@/actions/wishlist";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "Your saved sarees — curated collection of handcrafted Indian silk sarees.",
};

export default async function WishlistPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { items = [] } = await getWishlistAction();

  return <WishlistClient initialItems={items} />;
}
