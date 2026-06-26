"use client";
// src/components/admin/AddSareeDrawer.tsx
import React, { useState, useRef } from "react";
import { X, Upload, Plus, Loader, Palette, Trash2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { uploadImageToCloudinaryAction, createProductAction } from "@/actions/admin-products";
import { PREDEFINED_COLORS } from "@/lib/colors";

const FABRICS = ["Kanchipuram Silk", "Banarasi Silk", "Chanderi", "Georgette", "Organza", "Cotton Blend"];
const OCCASIONS = ["Bridal", "Festive", "Designer", "Casual", "Party Wear"];
// Plural to match the navbar collection slugs (/collections/necklaces, etc.)
const JEWELLERY_TYPES = ["Necklaces", "Earrings", "Bangles", "Rings", "Pendants", "Sets"];
// Kurta sub-categories — these map to /collections/<slug> (e.g. /collections/anarkali)
const KURTA_TYPES = ["Anarkali", "Straight Cut", "Sharara"];
// Sizes offered for kurta sets (admin sets per-size stock)
const KURTA_SIZES = ["S", "M", "L", "XL", "XXL", "Free Size"];

interface UploadedImage {
  url: string;
  publicId: string;
  previewUrl: string;
}

interface ColorVariant {
  id: string; // temp id for UI
  colour: string; // The hex:name format
  stock: string;
  images: UploadedImage[];
}

interface AddSareeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultCategory?: string; // e.g. "Sarees", "Kurta Sets", "Jewellery"
}

const defaultForm = {
  name: "",
  description: "",
  basePrice: "",
  fabric: FABRICS[0],
  occasion: OCCASIONS[0],
  careInstructions: "Dry clean only. Store wrapped in clean, soft cotton or muslin cloth in a dark wardrobe.",
  deliveryInfo: "Complimentary premium packing. Pan-India tracked shipping via DHL/Delhivery. Delivery in 3-7 business days.",
  returnPolicy: "Easy returns within 7 days of delivery. Product must be unused, untampered, with all tags intact.",
};

// Care text differs by product type
const CARE_DEFAULTS: Record<string, string> = {
  "Saree": defaultForm.careInstructions,
  "Kurta Set": "Gentle hand wash or dry clean for the first wash. Wash dark colours separately in cold water. Do not bleach. Iron on medium heat. Dry in shade to retain colour.",
  "Jewellery": "Keep away from water, perfume and sweat. Wipe gently with a soft dry cloth after use. Store in the provided pouch to prevent tarnishing. Avoid contact with harsh chemicals.",
};
const defaultCareFor = (cat?: string) => CARE_DEFAULTS[cat || "Saree"] || CARE_DEFAULTS["Saree"];

const createDefaultVariant = (): ColorVariant => ({
  id: Math.random().toString(36).substring(7),
  colour: `${PREDEFINED_COLORS[0].hex}:${PREDEFINED_COLORS[0].name}`,
  stock: "10",
  images: [],
});

export default function AddSareeDrawer({ isOpen, onClose, onCreated, defaultCategory }: AddSareeDrawerProps) {
  const defaultFabricFor = (cat?: string) =>
    cat === "Jewellery" ? JEWELLERY_TYPES[0] : cat === "Kurta Set" ? KURTA_TYPES[0] : FABRICS[0];

  const [form, setForm] = useState(() => ({
    ...defaultForm,
    name: defaultCategory ? `New ${defaultCategory}` : "",
    fabric: defaultFabricFor(defaultCategory),
    careInstructions: defaultCareFor(defaultCategory),
  }));
  const [variants, setVariants] = useState<ColorVariant[]>([createDefaultVariant()]);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  // Per-size stock for kurta sets: list of { size, stock } rows
  const [sizeStocks, setSizeStocks] = useState<{ size: string; stock: string }[]>([
    { size: "M", stock: "10" },
  ]);

  // Update form name when defaultCategory changes
  React.useEffect(() => {
    if (defaultCategory && isOpen) {
      setForm(prev => ({
        ...prev,
        name: `New ${defaultCategory}`,
        fabric: defaultFabricFor(defaultCategory),
        careInstructions: defaultCareFor(defaultCategory),
      }));
      setSizeStocks([{ size: "M", stock: "10" }]);
    }
  }, [defaultCategory, isOpen]);

  const addSizeRow = () => {
    const used = new Set(sizeStocks.map((s) => s.size));
    const next = KURTA_SIZES.find((s) => !used.has(s)) || "Free Size";
    setSizeStocks((prev) => [...prev, { size: next, stock: "0" }]);
  };
  const updateSizeRow = (idx: number, field: "size" | "stock", value: string) => {
    setSizeStocks((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };
  const removeSizeRow = (idx: number) => {
    setSizeStocks((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeVariant = variants[activeVariantIdx];

  const handleField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVariantField = (field: keyof ColorVariant, value: string) => {
    setVariants((prev) => {
      const next = [...prev];
      next[activeVariantIdx] = { ...next[activeVariantIdx], [field]: value };
      return next;
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError("");

    for (const file of Array.from(files)) {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });
      const previewUrl = URL.createObjectURL(compressed);
      const fd = new FormData();
      fd.append("file", compressed);
      const res = await uploadImageToCloudinaryAction(fd);
      if (res.success && res.url && res.publicId) {
        // Immutable update — mutating (.push) here would double-add under React StrictMode.
        setVariants((prev) =>
          prev.map((v, i) =>
            i === activeVariantIdx
              ? { ...v, images: [...v.images, { url: res.url!, publicId: res.publicId!, previewUrl }] }
              : v
          )
        );
      } else {
        setError(res.error || "Image upload failed.");
      }
    }
    setIsUploading(false);
  };

  const removeImage = (idx: number) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === activeVariantIdx
          ? { ...v, images: v.images.filter((_, j) => j !== idx) }
          : v
      )
    );
  };

  const handleMockUpload = () => {
    const mockUrl = "https://images.unsplash.com/photo-1610189013233-5c8e221371ba?auto=format&fit=crop&w=800&q=80";
    setVariants((prev) => {
      const next = [...prev];
      next[activeVariantIdx].images.push({ url: mockUrl, publicId: `mock_${Date.now()}`, previewUrl: mockUrl });
      return next;
    });
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, createDefaultVariant()]);
    setActiveVariantIdx(variants.length); // Switch to the new one
  };

  const removeVariant = (idx: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== idx));
    if (activeVariantIdx >= idx) {
      setActiveVariantIdx(Math.max(0, activeVariantIdx - 1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Product name is required.");
    if (!form.basePrice || isNaN(Number(form.basePrice))) return setError("Valid price is required.");

    for (const v of variants) {
      if (v.images.length === 0) {
        return setError(`Please upload at least one image for color: ${v.colour.split(":")[1] || "Unknown"}`);
      }
    }

    // Kurta sizes: dedupe by size, keep only valid rows; require at least one
    let kurtaSizes: { size: string; stock: number }[] = [];
    if (defaultCategory === "Kurta Set") {
      const seen = new Set<string>();
      for (const row of sizeStocks) {
        if (seen.has(row.size)) return setError(`Duplicate size "${row.size}". Each size once.`);
        seen.add(row.size);
        kurtaSizes.push({ size: row.size, stock: Number(row.stock) || 0 });
      }
      if (kurtaSizes.length === 0) return setError("Add at least one size for the kurta set.");
    }

    setIsSaving(true);
    
    // Create a group ID if multiple variants
    const variantGroupId = variants.length > 1 && defaultCategory !== "Jewellery" ? crypto.randomUUID() : undefined;
    let anyError = false;

    // Create all variants
    for (const v of variants) {
      const fabricValue = defaultCategory === "Kurta Set" ? "N/A" : form.fabric;
      const colourValue = defaultCategory === "Jewellery" ? "#FFFFFF:N/A" : v.colour;
      // For kurtas and jewellery, the chosen sub-type (e.g. Anarkali, Necklaces)
      // becomes the product category so it appears under /collections/<sub-type>.
      const productTypeValue =
        defaultCategory === "Kurta Set" || defaultCategory === "Jewellery" ? form.fabric : defaultCategory;

      // For kurtas, total stock is the sum of per-size stock
      const stockValue =
        defaultCategory === "Kurta Set"
          ? kurtaSizes.reduce((sum, s) => sum + s.stock, 0)
          : Number(v.stock) || 0;

      const res = await createProductAction({
        name: form.name,
        description: form.description,
        basePrice: Number(form.basePrice),
        fabric: fabricValue,
        colour: colourValue, // Saved as "#HEX:Name"
        occasion: form.occasion,
        stock: stockValue,
        careInstructions: form.careInstructions,
        deliveryInfo: form.deliveryInfo,
        returnPolicy: form.returnPolicy,
        variantGroupId,
        productType: productTypeValue,
        sizes: defaultCategory === "Kurta Set" ? kurtaSizes : undefined,
        images: v.images.map((img, idx) => ({ url: img.url, publicId: img.publicId, isPrimary: idx === 0 })),
      });

      if (!res.success) {
        setError(`Failed to create variant ${colourValue}. Error: ${res.error}`);
        anyError = true;
        break; // Stop creating if one fails
      }
    }

    setIsSaving(false);

    if (!anyError) {
      setSuccess(true);
      setForm(defaultForm);
      setVariants([createDefaultVariant()]);
      setActiveVariantIdx(0);
      setTimeout(() => {
        setSuccess(false);
        onCreated();
        onClose();
      }, 1200);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2000,
          animation: "fade-in 0.2s ease",
        }}
      />
      <div
        style={{
          position: "fixed", top: 0, right: 0, height: "100vh", width: "min(600px, 96vw)",
          backgroundColor: "#FCFBF7", zIndex: 2001, overflowY: "auto", overflowX: "hidden",
          boxShadow: "-8px 0 40px rgba(74,14,23,0.12)",
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{
          padding: "24px 28px", borderBottom: "1px solid rgba(74,14,23,0.1)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "linear-gradient(135deg, #4A0E17 0%, #6d1422 100%)", color: "#FCFBF7",
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#D4AF37", marginBottom: "4px" }}>
              Admin Mode
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 500, margin: 0, color: "#FCFBF7" }}>
              Add New Product
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#FCFBF7", cursor: "pointer", padding: "4px" }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {error && <div style={{ padding: "12px 16px", background: "#fff1f1", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "4px", fontSize: "0.85rem", color: "#c0392b" }}>⚠ {error}</div>}
          {success && <div style={{ padding: "12px 16px", background: "#f0fff4", border: "1px solid rgba(39,174,96,0.3)", borderRadius: "4px", fontSize: "0.85rem", color: "#27ae60" }}>✓ Products created successfully!</div>}

          {/* BASIC INFO */}
          <div>
            <h3 style={sectionHeaderStyle}>1. Basic Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Product Name <span style={{ color: "#c0392b" }}>*</span></label>
                <input style={inputStyle} value={form.name} onChange={(e) => handleField("name", e.target.value)} placeholder="e.g., Deep Crimson Kanchipuram Silk / Royal Blue Kurta Set" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Price (₹) <span style={{ color: "#c0392b" }}>*</span></label>
                  <input type="number" min="0" style={inputStyle} value={form.basePrice} onChange={(e) => handleField("basePrice", e.target.value)} placeholder="e.g., 25000" />
                </div>
                <div>
                  {defaultCategory === "Kurta Set" ? (
                    <>
                      <label style={labelStyle}>Kurta Type</label>
                      <select style={inputStyle} value={form.fabric} onChange={(e) => handleField("fabric", e.target.value)}>
                        {KURTA_TYPES.map((k) => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </>
                  ) : defaultCategory === "Jewellery" ? (
                    <>
                      <label style={labelStyle}>Jewellery Type</label>
                      <select style={inputStyle} value={form.fabric} onChange={(e) => handleField("fabric", e.target.value)}>
                        {JEWELLERY_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </>
                  ) : (
                    <>
                      <label style={labelStyle}>Category Focus</label>
                      <select style={inputStyle} value={form.occasion} onChange={(e) => handleField("occasion", e.target.value)}>
                        {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </>
                  )}
                </div>
              </div>

              {/* Fabric/Material — sarees only */}
              {defaultCategory !== "Jewellery" && defaultCategory !== "Kurta Set" && (
                <div>
                  <label style={labelStyle}>Fabric / Material</label>
                  <select style={inputStyle} value={form.fabric} onChange={(e) => handleField("fabric", e.target.value)}>
                    {FABRICS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label style={labelStyle}>Description <span style={{ color: "#c0392b" }}>*</span></label>
                <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.description} onChange={(e) => handleField("description", e.target.value)} placeholder="Describe the weave, craftsmanship, uniqueness…" />
              </div>
            </div>
          </div>

          {/* VARIANTS / IMAGES */}
          <div>
            {defaultCategory !== "Jewellery" ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ ...sectionHeaderStyle, margin: 0 }}>2. Color Variants</h3>
                  <button
                    type="button"
                    onClick={addVariant}
                    style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", fontWeight: 600, color: "#4A0E17", background: "none", border: "1px solid #4A0E17", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
                  >
                    <Plus size={14} /> Add Color
                  </button>
                </div>
                
                {/* Variant Tabs */}
                <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px" }}>
                  {variants.map((v, idx) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setActiveVariantIdx(idx)}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "6px 12px", borderRadius: "100px", border: activeVariantIdx === idx ? "2px solid #D4AF37" : "1px solid rgba(74,14,23,0.2)",
                        background: activeVariantIdx === idx ? "var(--color-cream)" : "#fff",
                        cursor: "pointer", whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: v.colour.split(":")[0] || "#ccc" }} />
                      <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#4A0E17" }}>{v.colour.split(":")[1] || "Color"}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <h3 style={{ ...sectionHeaderStyle, margin: 0, marginBottom: "12px" }}>2. Images & Stock</h3>
            )}

            {/* Active Variant Editor */}
            <div style={{ padding: "16px", border: "1px solid rgba(74,14,23,0.15)", borderRadius: "6px", background: "#fcfcfc", position: "relative" }}>
              {variants.length > 1 && defaultCategory !== "Jewellery" && (
                <button type="button" onClick={() => removeVariant(activeVariantIdx)} style={{ position: "absolute", top: "16px", right: "16px", color: "#c0392b", background: "none", border: "none", cursor: "pointer" }}>
                  <Trash2 size={18} />
                </button>
              )}
              
              <div style={{ display: "grid", gridTemplateColumns: defaultCategory === "Jewellery" ? "minmax(0, 1fr)" : "minmax(0, 1fr) minmax(0, 1fr)", gap: "12px", marginBottom: "16px" }}>
                {defaultCategory !== "Jewellery" && (
                  <div>
                    <label style={labelStyle}>Select Color</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {PREDEFINED_COLORS.map((c) => {
                        const value = `${c.hex}:${c.name}`;
                        const isActive = activeVariant.colour === value;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => handleVariantField("colour", value)}
                            title={c.name}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              backgroundColor: c.hex,
                              border: isActive ? "2px solid var(--color-brown)" : "1px solid rgba(0,0,0,0.1)",
                              outline: isActive ? "2px solid #fff" : "none",
                              outlineOffset: "-4px",
                              cursor: "pointer",
                              boxShadow: isActive ? "0 0 0 2px var(--color-gold)" : "none",
                              transition: "transform 0.2s"
                            }}
                            onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.transform = "scale(1.1)"; }}
                            onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.transform = "scale(1)"; }}
                          />
                        );
                      })}
                    </div>
                    <div style={{ marginTop: "8px", fontSize: "0.85rem", color: "var(--color-brown-500)", fontWeight: 500 }}>
                      Selected: {activeVariant.colour.split(":")[1] || "Color"}
                    </div>
                  </div>
                )}
                {defaultCategory === "Kurta Set" ? (
                  <div>
                    <label style={labelStyle}>Sizes & Stock</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {sizeStocks.map((row, idx) => (
                        <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <select
                            style={{ ...inputStyle, flex: 1 }}
                            value={row.size}
                            onChange={(e) => updateSizeRow(idx, "size", e.target.value)}
                          >
                            {KURTA_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <input
                            type="number"
                            min="0"
                            style={{ ...inputStyle, width: "90px" }}
                            value={row.stock}
                            placeholder="Stock"
                            onChange={(e) => updateSizeRow(idx, "stock", e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeSizeRow(idx)}
                            disabled={sizeStocks.length <= 1}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#c0392b", padding: "4px", display: "flex", alignItems: "center", opacity: sizeStocks.length <= 1 ? 0.4 : 1 }}
                            title="Remove size"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addSizeRow} style={{ marginTop: "8px", fontSize: "0.78rem", color: "#4A0E17", background: "none", border: "1px dashed rgba(74,14,23,0.3)", borderRadius: "4px", padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Plus size={14} /> Add size
                    </button>
                  </div>
                ) : (
                  <div>
                    <label style={labelStyle}>Stock</label>
                    <input type="number" min="0" style={inputStyle} value={activeVariant.stock} onChange={(e) => handleVariantField("stock", e.target.value)} />
                  </div>
                )}
              </div>

              {/* Image Upload for Active Variant */}
              <div>
                <label style={labelStyle}>Images {defaultCategory !== "Jewellery" && `for ${activeVariant.colour.split(":")[1]}`}</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: "2px dashed rgba(74,14,23,0.2)", borderRadius: "6px", padding: "16px", textAlign: "center", cursor: "pointer", background: "rgba(74,14,23,0.02)" }}
                >
                  {isUploading ? (
                    <div style={{ color: "#9a7a50", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <Loader size={20} style={{ animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: "0.85rem" }}>Uploading…</span>
                    </div>
                  ) : (
                    <div style={{ color: "#9a7a50", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <Upload size={20} />
                      <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Upload images</span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleFileSelect(e.target.files)} />
                
                {activeVariant.images.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                    {activeVariant.images.map((img, idx) => (
                      <div key={idx} style={{ position: "relative", width: "60px", height: "80px", borderRadius: "4px", overflow: "hidden", border: idx === 0 ? "2px solid #D4AF37" : "1px solid rgba(74,14,23,0.15)" }}>
                        <img src={img.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        {idx === 0 && <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(212,175,55,0.9)", fontSize: "0.5rem", textAlign: "center", color: "#1a0a0e", fontWeight: 700 }}>PRIMARY</span>}
                        <button type="button" onClick={() => removeImage(idx)} style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(192,57,43,0.85)", border: "none", borderRadius: "50%", width: "16px", height: "16px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                )}
                {process.env.NODE_ENV === "development" && (
                  <button type="button" onClick={handleMockUpload} style={{ marginTop: "8px", fontSize: "0.7rem", color: "#3498db", background: "none", border: "none", cursor: "pointer" }}>[Dev] Mock Image</button>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving || isUploading}
            style={{
              width: "100%", padding: "16px", marginTop: "8px",
              background: isSaving ? "#a0a0a0" : "linear-gradient(135deg, #4A0E17, #6d1422)",
              color: "#FCFBF7", border: "none", borderRadius: "3px", cursor: isSaving ? "not-allowed" : "pointer",
              fontSize: "0.95rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
            }}
          >
            {isSaving ? "Creating Variants…" : `✦ Create ${variants.length} Product Variant${variants.length > 1 ? 's' : ''}`}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  color: "#4A0E17",
  marginBottom: "12px",
  fontFamily: "var(--font-serif)",
  borderBottom: "1px solid rgba(74,14,23,0.1)",
  paddingBottom: "8px",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em",
  textTransform: "uppercase", color: "#6b4c3b", marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", border: "1px solid rgba(74,14,23,0.18)",
  borderRadius: "4px", background: "#fff", fontSize: "0.9rem", color: "#1a0a0e",
  outline: "none", boxSizing: "border-box",
};
