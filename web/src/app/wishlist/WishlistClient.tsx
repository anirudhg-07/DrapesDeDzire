"use client";
// src/app/wishlist/WishlistClient.tsx

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toggleWishlistAction } from "@/actions/wishlist";
import { useCart } from "@/components/cart/CartContext";
import { formatPrice } from "@/lib/utils";

type WishlistItem = {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    fabric: string;
    colour: string;
    stock: number;
    images: Array<{ id: string; imageUrl: string; isPrimary: boolean; orderNum: number }>;
  };
};

interface WishlistClientProps {
  initialItems: WishlistItem[];
}

export default function WishlistClient({ initialItems }: WishlistClientProps) {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { addItem } = useCart();

  const getImage = (item: WishlistItem) => {
    const img = item.product.images.find((i) => i.isPrimary) ?? item.product.images[0];
    return img?.imageUrl ?? null;
  };

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await toggleWishlistAction(productId);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    await addItem(productId, 1);
  };

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
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Page Header */}
        <div style={{ marginBottom: "48px" }}>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#D4AF37",
              fontWeight: 500,
              marginBottom: "8px",
            }}
          >
            Your Curation
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 300,
              color: "#1a0a0e",
              margin: 0,
              letterSpacing: "-0.01em",
              lineHeight: 1.15,
            }}
          >
            My Wishlist
          </h1>
          {items.length > 0 && (
            <p
              style={{
                fontSize: "0.9rem",
                color: "#9a7a50",
                marginTop: "8px",
              }}
            >
              {items.length} {items.length === 1 ? "saree" : "sarees"} saved
            </p>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div
            style={{
              textAlign: "center",
              padding: "80px 40px",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "rgba(74,14,23,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  stroke="#4A0E17"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.35"
                />
              </svg>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.8rem",
                fontWeight: 400,
                color: "#1a0a0e",
                margin: "0 0 12px",
              }}
            >
              Your wishlist is empty
            </h2>
            <p style={{ color: "#9a7a50", fontSize: "1rem", margin: "0 0 32px" }}>
              Save the sarees that speak to your soul.
            </p>
            <Link
              href="/collections"
              style={{
                display: "inline-block",
                background: "#4A0E17",
                color: "#FCFBF7",
                padding: "14px 36px",
                borderRadius: "2px",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "32px",
            }}
          >
            {items.map((item) => {
              const imgUrl = getImage(item);
              const isRemoving = removingId === item.productId;
              const inStock = item.product.stock > 0;

              return (
                <div
                  key={item.id}
                  style={{
                    background: "#fff",
                    borderRadius: "4px",
                    overflow: "hidden",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                    transition: "transform 0.25s, box-shadow 0.25s",
                    opacity: isRemoving ? 0.5 : 1,
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 12px 40px rgba(74,14,23,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 2px 16px rgba(0,0,0,0.06)";
                  }}
                >
                  {/* Product Image */}
                  <Link href={`/products/${item.product.slug}`} style={{ display: "block" }}>
                    <div
                      style={{
                        aspectRatio: "3/4",
                        background: "#f5f0ea",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={item.product.name}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 768px) 100vw, 320px"
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
                      {!inStock && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{
                              color: "#fff",
                              fontSize: "0.8rem",
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                              fontWeight: 600,
                            }}
                          >
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Remove from wishlist button */}
                  <button
                    onClick={() => handleRemove(item.productId)}
                    disabled={isRemoving}
                    aria-label="Remove from wishlist"
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.9)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(4px)",
                      transition: "background 0.2s",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#4A0E17">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                  {/* Product Info */}
                  <div style={{ padding: "16px" }}>
                    <Link
                      href={`/products/${item.product.slug}`}
                      style={{ textDecoration: "none" }}
                    >
                      <h3
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "1.05rem",
                          fontWeight: 600,
                          color: "#1a0a0e",
                          margin: "0 0 4px",
                          lineHeight: 1.3,
                        }}
                      >
                        {item.product.name}
                      </h3>
                    </Link>
                    <p style={{ fontSize: "0.78rem", color: "#9a7a50", margin: "0 0 12px" }}>
                      {item.product.fabric} · {item.product.colour}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color: "#4A0E17",
                        }}
                      >
                        {formatPrice(item.product.basePrice)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item.productId)}
                        disabled={!inStock}
                        style={{
                          background: inStock ? "#4A0E17" : "#ccc",
                          color: "#FCFBF7",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "2px",
                          cursor: inStock ? "pointer" : "not-allowed",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          fontFamily: "inherit",
                          transition: "opacity 0.2s",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          if (inStock)
                            (e.currentTarget as HTMLElement).style.opacity = "0.85";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.opacity = "1";
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
