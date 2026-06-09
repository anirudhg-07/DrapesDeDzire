// src/components/products/PDPClient.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { Product } from "@/lib/catalog";
import ZoomLens from "./ZoomLens";
import { useAuth } from "@clerk/nextjs";
import { useCart } from "@/components/cart/CartContext";
import { toggleWishlistAction, isInWishlistAction } from "@/actions/wishlist";

interface PDPClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function PDPClient({ product, relatedProducts }: PDPClientProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { addItem } = useCart();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const images = product.images.length > 0 ? product.images : [
    { id: "fallback", productId: product.id, imageUrl: "/logo.png", publicId: "", isPrimary: true, orderNum: 0 }
  ];

  const currentImage = images[activeImageIdx] || images[0];

  useEffect(() => {
    if (isSignedIn) {
      isInWishlistAction(product.id).then((res) => {
        setIsWishlisted(res);
      });
    }
  }, [isSignedIn, product.id]);

  const handleAddToCart = async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setIsAddingToCart(true);
    try {
      const res = await addItem(product.id, 1);
      if (!res.success && res.error) {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add item to cart.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyItNow = async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setIsAddingToCart(true);
    try {
      const res = await addItem(product.id, 1);
      if (res.success) {
        router.push("/checkout");
      } else if (res.error) {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to proceed to checkout.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (isTogglingWishlist) return;
    setIsTogglingWishlist(true);
    try {
      const res = await toggleWishlistAction(product.id);
      if (res.success) {
        setIsWishlisted(res.action === "added");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--color-ivory)", minHeight: "100vh", padding: "3rem 0 5rem" }}>
      <div className="section-container">
        {/* Breadcrumb */}
        <nav style={{ marginBottom: "2rem", fontSize: "0.8125rem", fontFamily: "var(--font-sans)", color: "var(--color-brown-300)" }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 0.5rem" }}>/</span>
          <Link href="/collections" style={{ color: "inherit", textDecoration: "none" }}>Collections</Link>
          {product.categorySlug && (
            <>
              <span style={{ margin: "0 0.5rem" }}>/</span>
              <Link href={`/collections/${product.categorySlug}`} style={{ color: "inherit", textDecoration: "none", textTransform: "capitalize" }}>
                {product.categorySlug.replace("-", " ")}
              </Link>
            </>
          )}
          <span style={{ margin: "0 0.5rem" }}>/</span>
          <span style={{ color: "var(--color-brown-500)" }}>{product.name}</span>
        </nav>

        {/* Core details split layout */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", marginBottom: "5rem" }}>
          {/* Left: Gallery Column */}
          <div style={{ flex: "1 1 500px", display: "flex", gap: "1rem" }}>
            {/* Thumbnails list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "80px", flexShrink: 0 }}>
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIdx(idx)}
                  style={{
                    position: "relative",
                    width: "80px",
                    aspectRatio: "3/4",
                    borderRadius: "2px",
                    overflow: "hidden",
                    border: activeImageIdx === idx ? "2px solid var(--color-gold)" : "1px solid var(--color-cream-200)",
                    backgroundColor: "var(--color-cream)",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  <Image
                    src={img.imageUrl}
                    alt={`${product.name} view ${idx + 1}`}
                    fill
                    sizes="80px"
                    style={{ objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>

            {/* Primary Magnifier Frame */}
            <div style={{ flex: 1 }}>
              <ZoomLens src={currentImage.imageUrl} alt={product.name} />
            </div>
          </div>

          {/* Right: Product Info Column */}
          <div style={{ flex: "1 1 450px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-gold-600)",
                fontFamily: "var(--font-sans)",
                display: "block",
                marginBottom: "0.5rem"
              }}>
                {product.fabric} &middot; {product.occasion}
              </span>
              <h1 style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontFamily: "var(--font-serif)",
                color: "var(--color-maroon)",
                fontWeight: 600,
                lineHeight: 1.2,
                marginBottom: "0.75rem"
              }}>
                {product.name}
              </h1>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-brown-300)", fontFamily: "var(--font-sans)" }}>
                Product SKU: DRP-{product.fabric.substring(0,3).toUpperCase()}-{product.id.split("-").pop()?.toUpperCase()}
              </p>
            </div>

            {/* Pricing Frame */}
            <div style={{
              backgroundColor: "var(--color-cream)",
              border: "1px solid var(--color-cream-200)",
              padding: "1.25rem 1.75rem",
              borderRadius: "4px",
              display: "flex",
              alignItems: "baseline",
              gap: "0.75rem"
            }}>
              <span style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--color-maroon)",
                fontFamily: "var(--font-sans)"
              }}>
                ₹{product.basePrice.toLocaleString("en-IN")}
              </span>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-brown-300)", fontFamily: "var(--font-sans)" }}>
                (Inclusive of all taxes)
              </span>
            </div>

            {/* Saree Short Description */}
            <p style={{
              fontSize: "0.9375rem",
              color: "var(--color-brown-500)",
              lineHeight: 1.75,
              fontFamily: "var(--font-sans)"
            }}>
              {product.description}
            </p>


            {/* Call To Actions */}
            <div style={{ display: "flex", gap: "1rem" }}>
              {product.stock > 0 ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="btn-maroon"
                    style={{
                      flex: 1,
                      padding: "1.125rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      fontSize: "0.9375rem"
                    }}
                  >
                    <ShoppingBag size={18} />
                    {isAddingToCart ? "Adding..." : "Add to Shopping Cart"}
                  </button>

                  <button
                    onClick={handleBuyItNow}
                    disabled={isAddingToCart}
                    className="btn-gold"
                    style={{
                      flex: 1,
                      padding: "1.125rem",
                      fontSize: "0.9375rem",
                      fontWeight: 600
                    }}
                  >
                    Buy It Now
                  </button>
                </>
              ) : (
                <button
                  disabled
                  style={{
                    flex: 1,
                    padding: "1.125rem",
                    backgroundColor: "var(--color-cream-200)",
                    color: "var(--color-brown-300)",
                    border: "none",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    cursor: "not-allowed",
                    textAlign: "center"
                  }}
                >
                  Sold Out
                </button>
              )}

              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "54px",
                  height: "54px",
                  borderRadius: "2px",
                  border: `1px solid ${isWishlisted ? "var(--color-maroon)" : "var(--color-cream-200)"}`,
                  backgroundColor: isWishlisted ? "rgba(74,14,23,0.04)" : "var(--color-cream)",
                  color: isWishlisted ? "var(--color-maroon)" : "var(--color-brown)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart size={20} fill={isWishlisted ? "var(--color-maroon)" : "none"} />
              </button>
            </div>

            {/* Delivery/Authenticity Badges */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              backgroundColor: "var(--color-cream)",
              padding: "1.25rem",
              borderRadius: "4px",
              border: "1px solid var(--color-cream-200)",
              marginTop: "0.5rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Truck size={18} style={{ color: "var(--color-gold-600)", flexShrink: 0 }} />
                <span style={{ fontSize: "0.8125rem", color: "var(--color-brown-500)", fontFamily: "var(--font-sans)", lineHeight: 1.3 }}>
                  Free Shipping <br/><span style={{ fontSize: "0.6875rem", color: "var(--color-brown-300)" }}>Orders above ₹5,000</span>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <ShieldCheck size={18} style={{ color: "var(--color-gold-600)", flexShrink: 0 }} />
                <span style={{ fontSize: "0.8125rem", color: "var(--color-brown-500)", fontFamily: "var(--font-sans)", lineHeight: 1.3 }}>
                  100% Authentic <br/><span style={{ fontSize: "0.6875rem", color: "var(--color-brown-300)" }}>Silk Mark Certified</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info Panels */}
        <div style={{ marginBottom: "5rem" }}>
          {/* Tab Headers */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--color-cream-200)", gap: "2rem" }}>
            {[
              { id: "details", label: "Saree Specifications" },
              { id: "care", label: "Care Instructions" },
              { id: "shipping", label: "Shipping & Delivery" },
              { id: "returns", label: "Returns & Exchanges" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "1rem 0",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab.id ? "2.5px solid var(--color-maroon)" : "2.5px solid transparent",
                  color: activeTab === tab.id ? "var(--color-maroon)" : "var(--color-brown-300)",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "all 0.2s ease"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div style={{ padding: "2rem 0", minHeight: "150px" }}>
            {activeTab === "details" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
                {[
                  { label: "Fabric Blend", value: product.fabric },
                  { label: "Weaving Craft", value: "Handloom Jacquard" },
                  { label: "Colour Shade", value: product.colour },
                  { label: "Occasion Fit", value: product.occasion },
                  { label: "Saree Length", value: "5.5 meters" },
                  { label: "Blouse Piece", value: "Included (0.8 meters, contrasting design)" },
                  { label: "Zari Metal Type", value: "Fine Gold plated silver zari wire" },
                  { label: "Silk Mark", value: "Official verification card included" }
                ].map((spec, i) => (
                  <div key={i} style={{ borderBottom: "1px solid var(--color-cream-100)", paddingBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-brown-300)", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>
                      {spec.label}
                    </span>
                    <span style={{ fontSize: "0.9375rem", color: "var(--color-brown)", fontWeight: 600, fontFamily: "var(--font-sans)" }}>
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "care" && (
              <p style={{ fontSize: "0.9375rem", color: "var(--color-brown-500)", lineHeight: 1.8, maxWidth: "800px", whiteSpace: "pre-line" }}>
                {product.careInstructions}
              </p>
            )}

            {activeTab === "shipping" && (
              <p style={{ fontSize: "0.9375rem", color: "var(--color-brown-500)", lineHeight: 1.8, maxWidth: "800px", whiteSpace: "pre-line" }}>
                {product.deliveryInfo || "Complimentary luxury packaging on all orders. Shipments are processed and tracked within 24-48 hours. Secure transport via reliable partners across India."}
              </p>
            )}

            {activeTab === "returns" && (
              <p style={{ fontSize: "0.9375rem", color: "var(--color-brown-500)", lineHeight: 1.8, maxWidth: "800px", whiteSpace: "pre-line" }}>
                {product.returnPolicy || "We want you to love your drape. If you are not fully satisfied, returns are accepted within 7 days of delivery for a full refund or direct exchange."}
              </p>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div style={{ borderTop: "1px solid var(--color-cream-200)", paddingTop: "4rem" }}>
            <h2 style={{
              fontSize: "1.75rem",
              fontFamily: "var(--font-serif)",
              color: "var(--color-maroon)",
              fontWeight: 600,
              marginBottom: "2.5rem",
              textAlign: "center"
            }}>
              You May Also Adore
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "2rem"
            }}>
              {relatedProducts.map((relProduct) => {
                const primaryImg = relProduct.images.find(img => img.isPrimary) || relProduct.images[0];
                return (
                  <div
                    key={relProduct.id}
                    className="group"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "var(--color-cream)",
                      borderRadius: "2px",
                      overflow: "hidden",
                      boxShadow: "var(--shadow-luxury)",
                      border: "1px solid var(--color-cream-100)",
                      transition: "all 0.4s ease"
                    }}
                  >
                    <div style={{ display: "block", position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
                      <Link href={`/products/${relProduct.id}`} style={{ display: "block", position: "relative", width: "100%", height: "100%" }}>
                        <Image
                          src={primaryImg?.imageUrl || "/logo.png"}
                          alt={relProduct.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          style={{
                            objectFit: "cover",
                            transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                          }}
                          className="hover-scale-img"
                        />
                      </Link>
                    </div>
                    <div style={{ padding: "1rem 1.25rem 1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                      <span style={{ fontSize: "0.625rem", color: "var(--color-gold-600)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.25rem" }}>
                        {relProduct.fabric}
                      </span>
                      <Link href={`/products/${relProduct.id}`} style={{ textDecoration: "none" }}>
                        <h3 style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "0.9375rem",
                          fontWeight: 600,
                          color: "var(--color-maroon)",
                          lineHeight: 1.3,
                          marginBottom: "0.5rem"
                        }}>
                          {relProduct.name}
                        </h3>
                      </Link>
                      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-brown)" }}>
                          ₹{relProduct.basePrice.toLocaleString("en-IN")}
                        </span>
                        <Link
                          href={`/products/${relProduct.id}`}
                          className="btn-gold"
                          style={{
                            padding: "0.375rem 0.75rem",
                            fontSize: "0.6875rem",
                            textDecoration: "none",
                            borderRadius: "1px"
                          }}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
