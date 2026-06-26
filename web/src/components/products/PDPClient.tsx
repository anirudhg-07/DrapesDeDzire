// src/components/products/PDPClient.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, ShoppingBag, Truck, ShieldCheck, Pencil, Trash2, Check, X, Loader, ChevronDown } from "lucide-react";
import { Product } from "@/lib/catalog";
import ZoomLens from "./ZoomLens";
import { useAuth } from "@clerk/nextjs";
import { useCart } from "@/components/cart/CartContext";
import { toggleWishlistAction, isInWishlistAction } from "@/actions/wishlist";
import { updateProductAction, deleteProductAction } from "@/actions/admin-products";

const FABRICS = ["Kanchipuram Silk", "Banarasi Silk", "Chanderi", "Georgette", "Organza"];
const OCCASIONS = ["Bridal", "Festive", "Designer", "Casual"];
const COLOURS = ["Deep Crimson", "Royal Blue", "Forest Green", "Mustard Gold", "Peach Pink", "Ivory White", "Midnight Black", "Emerald Teal", "Coral Orange", "Lavender Purple"];

interface PDPClientProps {
  product: Product;
  relatedProducts: Product[];
  variants?: Product[];
  isAdmin?: boolean;
}

export default function PDPClient({ product, relatedProducts, variants = [], isAdmin = false }: PDPClientProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  // Detect product type from the category slug. Kurtas live under their sub-type
  // slugs (anarkali / straight-cut / sharara) and jewellery under its type slugs,
  // so match against the full set rather than a single keyword.
  const _slug = (product.categorySlug || "").toLowerCase();
  const KURTA_SLUGS = ["kurta", "anarkali", "straight-cut", "sharara", "palazzo"];
  const JEWEL_SLUGS = ["jewell", "jewel", "necklace", "earring", "bangle", "ring", "pendant"];
  const productLabel = KURTA_SLUGS.some((s) => _slug.includes(s))
    ? "Kurta Set"
    : JEWEL_SLUGS.some((s) => _slug.includes(s))
    ? "Jewellery"
    : "Saree";

  // Human-readable sub-type from the slug, e.g. "anarkali" -> "Anarkali"
  const subType = _slug
    ? _slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : productLabel;
  const colourName = product.colour.includes(":") ? product.colour.split(":")[1] : product.colour;
  const hasColour = colourName && colourName.toUpperCase() !== "N/A";
  const hasFabric = product.fabric && product.fabric.toUpperCase() !== "N/A";

  // Type-specific specification rows (filtered for "N/A" placeholders)
  const specRows: { label: string; value: string }[] =
    productLabel === "Kurta Set"
      ? [
          { label: "Style", value: subType },
          { label: "Set Includes", value: "Kurta, Bottoms & Dupatta" },
          ...(hasColour ? [{ label: "Colour", value: colourName }] : []),
          { label: "Occasion", value: product.occasion },
          { label: "Fit", value: "Regular fit · True to size" },
          ...(hasFabric ? [{ label: "Fabric", value: product.fabric }] : []),
          { label: "Wash Care", value: "Gentle hand wash / Dry clean" },
        ]
      : productLabel === "Jewellery"
      ? [
          { label: "Type", value: hasFabric ? product.fabric : subType },
          { label: "Finish", value: "Gold-plated · Anti-tarnish" },
          { label: "Stone Work", value: "Premium American Diamond / Kundan" },
          { label: "Occasion", value: product.occasion },
          { label: "Includes", value: "Protective jewellery pouch" },
        ]
      : [
          { label: "Fabric Blend", value: product.fabric },
          { label: "Weaving Craft", value: "Handloom Jacquard" },
          ...(hasColour ? [{ label: "Colour Shade", value: colourName }] : []),
          { label: "Occasion Fit", value: product.occasion },
          { label: "Saree Length", value: "5.5 meters" },
          { label: "Blouse Piece", value: "Included (0.8m, contrasting design)" },
          { label: "Zari Metal Type", value: "Fine gold-plated silver zari" },
          { label: "Silk Mark", value: "Official verification card included" },
        ];

  // Type-specific default care text (used when none has been entered)
  const careDefaults: Record<string, string> = {
    "Saree": "Dry clean only. Store wrapped in a soft muslin cloth, away from direct sunlight. Keep away from perfume and water. Iron on low heat with a cotton cloth barrier.",
    "Kurta Set": "Gentle hand wash or dry clean recommended for the first wash. Wash dark colours separately in cold water. Do not bleach. Iron on medium heat. Dry in shade to retain colour.",
    "Jewellery": "Keep away from water, perfume, and sweat. Wipe gently with a soft dry cloth after each use. Store in the provided pouch to prevent tarnishing. Avoid contact with harsh chemicals.",
  };
  const careText = product.careInstructions?.trim() || careDefaults[productLabel];

  // Per-size inventory (kurtas). Empty for sarees/jewellery.
  const productSizes = product.productSizes ?? [];
  const hasSizes = productSizes.length > 0;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Admin inline edit state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [adminMsg, setAdminMsg] = useState("");
  const [adminMsgType, setAdminMsgType] = useState<"success" | "error">("success");
  const [editForm, setEditForm] = useState({
    name: product.name,
    description: product.description,
    basePrice: String(product.basePrice),
    fabric: product.fabric,
    colour: product.colour,
    occasion: product.occasion,
    stock: String(product.stock),
    careInstructions: product.careInstructions,
    deliveryInfo: product.deliveryInfo || "",
    returnPolicy: product.returnPolicy || "",
    isActive: product.isActive,
  });

  // Auto-open edit mode if ?adminEdit=1 is in URL
  useEffect(() => {
    if (isAdmin && searchParams.get("adminEdit") === "1") {
      setIsEditing(true);
    }
  }, [isAdmin, searchParams]);

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
    if (hasSizes && !selectedSize) {
      alert("Please select a size.");
      return;
    }
    setIsAddingToCart(true);
    try {
      const res = await addItem(product.id, 1, selectedSize);
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
    if (hasSizes && !selectedSize) {
      alert("Please select a size.");
      return;
    }
    setIsAddingToCart(true);
    try {
      const res = await addItem(product.id, 1, selectedSize);
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

  const handleSave = async () => {
    setIsSaving(true);
    setAdminMsg("");
    const res = await updateProductAction(product.id, {
      name: editForm.name,
      description: editForm.description,
      basePrice: Number(editForm.basePrice),
      fabric: editForm.fabric,
      colour: editForm.colour,
      occasion: editForm.occasion,
      stock: Number(editForm.stock),
      careInstructions: editForm.careInstructions,
      deliveryInfo: editForm.deliveryInfo,
      returnPolicy: editForm.returnPolicy,
      isActive: editForm.isActive,
    });
    setIsSaving(false);
    if (res.success) {
      setAdminMsg("✓ Changes saved successfully!");
      setAdminMsgType("success");
      setIsEditing(false);
      router.refresh();
    } else {
      setAdminMsg(res.error || "Failed to save changes.");
      setAdminMsgType("error");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${product.name}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    const res = await deleteProductAction(product.id);
    if (res.success) {
      router.push("/products");
    } else {
      setIsDeleting(false);
      alert(res.error || "Failed to delete product.");
    }
  };

  const ef = (field: keyof typeof editForm, value: string | boolean) =>
    setEditForm((prev) => ({ ...prev, [field]: value }));

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

        {/* ── Admin Panel ────────────────────────────────────────────────── */}
        {isAdmin && (
          <div style={{
            background: "linear-gradient(135deg, rgba(74,14,23,0.04) 0%, rgba(212,175,55,0.04) 100%)",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: "6px",
            padding: "16px 20px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}>
            <div>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#D4AF37", fontWeight: 700, margin: "0 0 4px" }}>
                Admin Controls
              </p>
              <p style={{ fontSize: "0.82rem", color: "#6b4c3b", margin: 0 }}>
                {isEditing ? "Editing mode active — modify fields below, then save." : `Click Edit to modify this ${productLabel.toLowerCase()}'s details inline.`}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "10px 18px", background: "linear-gradient(135deg, #4A0E17, #6d1422)",
                      color: "#FCFBF7", border: "none", borderRadius: "3px", cursor: "pointer",
                      fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.06em",
                    }}
                  >
                    <Pencil size={14} /> Edit {productLabel} Details
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "10px 18px", background: "transparent",
                      color: "#c0392b", border: "1px solid rgba(192,57,43,0.35)", borderRadius: "3px", cursor: isDeleting ? "not-allowed" : "pointer",
                      fontSize: "0.82rem", fontWeight: 600,
                    }}
                  >
                    {isDeleting ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                    {isDeleting ? "Deleting…" : `Delete ${productLabel}`}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "10px 18px", background: "linear-gradient(135deg, #1a6b3a, #27ae60)",
                      color: "#fff", border: "none", borderRadius: "3px", cursor: isSaving ? "not-allowed" : "pointer",
                      fontSize: "0.82rem", fontWeight: 600,
                    }}
                  >
                    {isSaving ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={14} />}
                    {isSaving ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setAdminMsg(""); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "10px 18px", background: "transparent",
                      color: "#6b4c3b", border: "1px solid rgba(74,14,23,0.2)", borderRadius: "3px", cursor: "pointer",
                      fontSize: "0.82rem", fontWeight: 600,
                    }}
                  >
                    <X size={14} /> Cancel
                  </button>
                </>
              )}
            </div>
            {adminMsg && (
              <div style={{ width: "100%", padding: "10px 14px", borderRadius: "4px", fontSize: "0.84rem",
                background: adminMsgType === "success" ? "#f0fff4" : "#fff1f1",
                color: adminMsgType === "success" ? "#27ae60" : "#c0392b",
                border: `1px solid ${adminMsgType === "success" ? "rgba(39,174,96,0.3)" : "rgba(192,57,43,0.2)"}`,
              }}>
                {adminMsg}
              </div>
            )}
          </div>
        )}

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
              {/* Fabric · Occasion row — editable in admin mode */}
              {isEditing ? (
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  <select value={editForm.fabric} onChange={(e) => ef("fabric", e.target.value)} style={adminInputStyle}>
                    {FABRICS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select value={editForm.occasion} onChange={(e) => ef("occasion", e.target.value)} style={adminInputStyle}>
                    {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <select value={editForm.colour} onChange={(e) => ef("colour", e.target.value)} style={adminInputStyle}>
                    {COLOURS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ) : (
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
                  {hasFabric ? product.fabric : subType} &middot; {product.occasion}
                </span>
              )}

              {/* Color Rings (Variants) */}
              {!isEditing && variants.length > 1 && (
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-brown-500)", fontWeight: 600 }}>Color:</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {variants.map(v => {
                      const isActive = v.id === product.id;
                      const hexCode = v.colour.includes(":") ? v.colour.split(":")[0] : "#cccccc";
                      const colorName = v.colour.includes(":") ? v.colour.split(":")[1] : v.colour;
                      
                      return (
                        <Link 
                          key={v.id} 
                          href={`/products/${v.id}`}
                          title={colorName}
                          style={{
                            width: "28px", 
                            height: "28px", 
                            borderRadius: "50%", 
                            backgroundColor: hexCode,
                            border: isActive ? "2px solid var(--color-brown)" : "1px solid rgba(0,0,0,0.1)",
                            outline: isActive ? "2px solid #fff" : "none",
                            outlineOffset: "-4px",
                            cursor: isActive ? "default" : "pointer",
                            boxShadow: isActive ? "0 0 0 2px var(--color-gold)" : "none",
                            transition: "transform 0.2s"
                          }}
                          onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.transform = "scale(1.1)"; }}
                          onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.transform = "scale(1)"; }}
                        />
                      );
                    })}
                  </div>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-brown-300)" }}>
                    {product.colour.includes(":") ? product.colour.split(":")[1] : product.colour}
                  </span>
                </div>
              )}

              {/* Name */}
              {isEditing ? (
                <input
                  value={editForm.name}
                  onChange={(e) => ef("name", e.target.value)}
                  style={{ ...adminInputStyle, fontSize: "1.4rem", fontFamily: "var(--font-serif)", marginBottom: "8px", width: "100%" }}
                />
              ) : (
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
              )}
              <p style={{ fontSize: "0.8125rem", color: "var(--color-brown-300)", fontFamily: "var(--font-sans)" }}>
                Product SKU: DRP-{(hasFabric ? product.fabric : productLabel).replace(/[^a-zA-Z]/g, "").substring(0,3).toUpperCase()}-{product.id.split("-").pop()?.toUpperCase()}
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
              {isEditing ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "1.4rem", color: "var(--color-brown-300)" }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    value={editForm.basePrice}
                    onChange={(e) => ef("basePrice", e.target.value)}
                    style={{ ...adminInputStyle, fontSize: "1.6rem", fontWeight: 700, width: "160px" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "16px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-brown-300)" }}>Stock:</span>
                    <input
                      type="number"
                      min="0"
                      value={editForm.stock}
                      onChange={(e) => ef("stock", e.target.value)}
                      style={{ ...adminInputStyle, width: "70px", textAlign: "center" }}
                    />
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Description */}
            {isEditing ? (
              <div>
                <label style={adminLabelStyle}>Description</label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => ef("description", e.target.value)}
                  style={{ ...adminInputStyle, resize: "vertical", width: "100%" }}
                />
              </div>
            ) : (
              <p style={{
                fontSize: "0.9375rem",
                color: "var(--color-brown-500)",
                lineHeight: 1.75,
                fontFamily: "var(--font-sans)"
              }}>
                {product.description}
              </p>
            )}

            {/* Admin Active Toggle */}
            {isEditing && (
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: "#6b4c3b", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => ef("isActive", e.target.checked)}
                  style={{ accentColor: "var(--color-maroon)", width: "16px", height: "16px" }}
                />
                <span>Saree is Active (visible to customers)</span>
              </label>
            )}

            {/* Size selector — kurtas (and any sized product) */}
            {!isEditing && hasSizes && (
              <div style={{ marginBottom: "0.25rem" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-brown-300)", marginBottom: "0.6rem", fontFamily: "var(--font-sans)" }}>
                  Select Size
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                  {productSizes.map((s) => {
                    const out = s.stock <= 0;
                    const active = selectedSize === s.size;
                    return (
                      <button
                        key={s.size}
                        type="button"
                        disabled={out}
                        onClick={() => setSelectedSize(s.size)}
                        style={{
                          minWidth: "3rem",
                          padding: "0.6rem 0.9rem",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          fontFamily: "var(--font-sans)",
                          cursor: out ? "not-allowed" : "pointer",
                          border: `1px solid ${active ? "var(--color-maroon)" : "var(--color-cream-200)"}`,
                          backgroundColor: active ? "var(--color-maroon)" : "transparent",
                          color: out ? "var(--color-brown-300)" : active ? "var(--color-ivory)" : "var(--color-brown)",
                          textDecoration: out ? "line-through" : "none",
                          opacity: out ? 0.55 : 1,
                          transition: "all 0.15s ease",
                        }}
                      >
                        {s.size}
                      </button>
                    );
                  })}
                </div>
                {selectedSize && (() => {
                  const st = productSizes.find((s) => s.size === selectedSize)?.stock ?? 0;
                  return st > 0 && st <= 5 ? (
                    <p style={{ fontSize: "0.78rem", color: "var(--color-gold-600)", marginTop: "0.5rem", fontFamily: "var(--font-sans)" }}>
                      Only {st} left in {selectedSize}
                    </p>
                  ) : null;
                })()}
              </div>
            )}

            {/* Call To Actions — hidden in edit mode */}
            {!isEditing && (
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
            )}

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

        {/* Product Info Accordion (mobile-friendly — no horizontal scrolling) */}
        <div style={{ marginBottom: "5rem", maxWidth: "820px" }}>
          {[
            { id: "details", label: `${productLabel} Specifications` },
            { id: "care", label: "Care Instructions" },
            { id: "shipping", label: "Shipping & Delivery" },
            { id: "returns", label: "Returns & Exchanges" },
          ].map((section) => {
            const isOpen = activeTab === section.id;
            return (
              <div key={section.id} style={{ borderBottom: "1px solid var(--color-cream-200)" }}>
                <button
                  onClick={() => setActiveTab(isOpen ? "" : section.id)}
                  aria-expanded={isOpen}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1.25rem 0.25rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "var(--font-sans)",
                    color: isOpen ? "var(--color-maroon)" : "var(--color-brown)",
                  }}
                >
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {section.label}
                  </span>
                  <ChevronDown
                    size={20}
                    style={{
                      flexShrink: 0,
                      color: "var(--color-gold-600)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease",
                    }}
                  />
                </button>

                {isOpen && (
                  <div style={{ padding: "0.25rem 0 1.5rem" }}>
                    {section.id === "details" && (
                      <div>
                        {specRows.map((spec, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "baseline",
                              gap: "1.5rem",
                              padding: "0.7rem 0",
                              borderBottom: i < specRows.length - 1 ? "1px solid var(--color-cream-100)" : "none",
                            }}
                          >
                            <span style={{ fontSize: "0.72rem", color: "var(--color-brown-300)", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0, maxWidth: "45%" }}>
                              {spec.label}
                            </span>
                            <span style={{ fontSize: "0.9rem", color: "var(--color-brown)", fontWeight: 600, fontFamily: "var(--font-sans)", textAlign: "right" }}>
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.id === "care" && (
                      isEditing ? (
                        <textarea
                          rows={4}
                          value={editForm.careInstructions}
                          onChange={(e) => ef("careInstructions", e.target.value)}
                          placeholder={careDefaults[productLabel]}
                          style={{ ...adminInputStyle, width: "100%", resize: "vertical" }}
                        />
                      ) : (
                        <p style={infoTextStyle}>{careText}</p>
                      )
                    )}

                    {section.id === "shipping" && (
                      isEditing ? (
                        <textarea
                          rows={4}
                          value={editForm.deliveryInfo}
                          onChange={(e) => ef("deliveryInfo", e.target.value)}
                          style={{ ...adminInputStyle, width: "100%", resize: "vertical" }}
                        />
                      ) : (
                        <p style={infoTextStyle}>{product.deliveryInfo || "Complimentary luxury packaging on all orders. Shipments are processed and tracked within 24-48 hours. Secure transport via reliable partners across India."}</p>
                      )
                    )}

                    {section.id === "returns" && (
                      isEditing ? (
                        <textarea
                          rows={4}
                          value={editForm.returnPolicy}
                          onChange={(e) => ef("returnPolicy", e.target.value)}
                          style={{ ...adminInputStyle, width: "100%", resize: "vertical" }}
                        />
                      ) : (
                        <p style={infoTextStyle}>{product.returnPolicy || "We want you to love your purchase. If you are not fully satisfied, returns are accepted within 7 days of delivery for a full refund or direct exchange."}</p>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
                        {relProduct.fabric && relProduct.fabric.toUpperCase() !== "N/A" ? relProduct.fabric : relProduct.occasion}
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

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .hover-scale-img:hover { transform: scale(1.05) !important; }
      `}</style>
    </div>
  );
}

const infoTextStyle: React.CSSProperties = {
  fontSize: "0.9375rem",
  color: "var(--color-brown-500)",
  lineHeight: 1.8,
  whiteSpace: "pre-line",
  margin: 0,
  maxWidth: "680px",
};

const adminInputStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid rgba(212,175,55,0.4)",
  borderRadius: "4px",
  background: "rgba(255,255,255,0.8)",
  fontSize: "0.9rem",
  color: "#1a0a0e",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const adminLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.7rem",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#6b4c3b",
  marginBottom: "5px",
};

