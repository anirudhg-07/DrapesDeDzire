"use client";
// src/components/admin/AddSareeDrawer.tsx
// Slide-out admin drawer to create new sarees with Cloudinary image upload

import React, { useState, useRef } from "react";
import { X, Upload, Plus, Loader } from "lucide-react";
import {
  uploadImageToCloudinaryAction,
  createProductAction,
} from "@/actions/admin-products";

const FABRICS = ["Kanchipuram Silk", "Banarasi Silk", "Chanderi", "Georgette", "Organza"];
const OCCASIONS = ["Bridal", "Festive", "Designer", "Casual"];
const COLOURS = ["Deep Crimson", "Royal Blue", "Forest Green", "Mustard Gold", "Peach Pink", "Ivory White", "Midnight Black", "Emerald Teal", "Coral Orange", "Lavender Purple"];

interface UploadedImage {
  url: string;
  publicId: string;
  previewUrl: string;
}

interface AddSareeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const defaultForm = {
  name: "",
  description: "",
  basePrice: "",
  fabric: FABRICS[0],
  colour: COLOURS[0],
  occasion: OCCASIONS[0],
  stock: "10",
  careInstructions: "Dry clean only. Store wrapped in clean, soft cotton or muslin cloth in a dark wardrobe.",
  deliveryInfo: "Complimentary premium packing. Pan-India tracked shipping via DHL/Delhivery. Delivery in 3-7 business days.",
  returnPolicy: "Easy returns within 7 days of delivery. Product must be unused, untampered, with all tags intact.",
};

export default function AddSareeDrawer({ isOpen, onClose, onCreated }: AddSareeDrawerProps) {
  const [form, setForm] = useState(defaultForm);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError("");

    for (const file of Array.from(files)) {
      const previewUrl = URL.createObjectURL(file);
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadImageToCloudinaryAction(fd);
      if (res.success && res.url && res.publicId) {
        setImages((prev) => [...prev, { url: res.url!, publicId: res.publicId!, previewUrl }]);
      } else {
        setError(res.error || "Image upload failed.");
      }
    }
    setIsUploading(false);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMockUpload = () => {
    const mockUrl = "https://images.unsplash.com/photo-1610189013233-5c8e221371ba?auto=format&fit=crop&w=800&q=80";
    setImages((prev) => [...prev, { url: mockUrl, publicId: `mock_${Date.now()}`, previewUrl: mockUrl }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Saree name is required.");
    if (!form.description.trim()) return setError("Description is required.");
    if (!form.basePrice || isNaN(Number(form.basePrice))) return setError("Valid price is required.");
    if (images.length === 0) return setError("Please upload at least one image.");

    setIsSaving(true);
    const res = await createProductAction({
      name: form.name,
      description: form.description,
      basePrice: Number(form.basePrice),
      fabric: form.fabric,
      colour: form.colour,
      occasion: form.occasion,
      stock: Number(form.stock) || 0,
      careInstructions: form.careInstructions,
      deliveryInfo: form.deliveryInfo,
      returnPolicy: form.returnPolicy,
      images: images.map((img, idx) => ({ url: img.url, publicId: img.publicId, isPrimary: idx === 0 })),
    });
    setIsSaving(false);

    if (res.success) {
      setSuccess(true);
      setForm(defaultForm);
      setImages([]);
      setTimeout(() => {
        setSuccess(false);
        onCreated();
        onClose();
      }, 1200);
    } else {
      setError(res.error || "Failed to create saree.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 200,
          animation: "fade-in 0.2s ease",
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, height: "100vh", width: "min(560px, 96vw)",
          backgroundColor: "#FCFBF7", zIndex: 201, overflowY: "auto",
          boxShadow: "-8px 0 40px rgba(74,14,23,0.12)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
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
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 500, margin: 0 }}>
              Add New Saree
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#FCFBF7", cursor: "pointer", padding: "4px" }}>
            <X size={22} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Error / Success */}
          {error && (
            <div style={{ padding: "12px 16px", background: "#fff1f1", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "4px", fontSize: "0.85rem", color: "#c0392b" }}>
              ⚠ {error}
            </div>
          )}
          {success && (
            <div style={{ padding: "12px 16px", background: "#f0fff4", border: "1px solid rgba(39,174,96,0.3)", borderRadius: "4px", fontSize: "0.85rem", color: "#27ae60" }}>
              ✓ Saree created successfully!
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label style={labelStyle}>Product Images <span style={{ color: "#c0392b" }}>*</span></label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed rgba(74,14,23,0.2)", borderRadius: "6px", padding: "24px",
                textAlign: "center", cursor: "pointer", background: "rgba(74,14,23,0.02)",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#D4AF37")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(74,14,23,0.2)")}
            >
              {isUploading ? (
                <div style={{ color: "#9a7a50", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <Loader size={28} style={{ animation: "spin 1s linear infinite" }} />
                  <span style={{ fontSize: "0.85rem" }}>Uploading to Cloudinary…</span>
                </div>
              ) : (
                <div style={{ color: "#9a7a50", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <Upload size={28} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Click to upload images</span>
                  <span style={{ fontSize: "0.75rem" }}>PNG, JPG, WEBP · Multiple files allowed</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            {/* Image Previews */}
            {images.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                {images.map((img, idx) => (
                  <div key={idx} style={{ position: "relative", width: "72px", height: "96px", borderRadius: "4px", overflow: "hidden", border: idx === 0 ? "2px solid #D4AF37" : "1px solid rgba(74,14,23,0.15)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {idx === 0 && (
                      <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(212,175,55,0.9)", fontSize: "0.55rem", textAlign: "center", color: "#1a0a0e", fontWeight: 700, padding: "2px", letterSpacing: "0.06em" }}>
                        PRIMARY
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(192,57,43,0.85)", border: "none", borderRadius: "50%", width: "18px", height: "18px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: "72px", height: "96px", borderRadius: "4px", border: "2px dashed rgba(74,14,23,0.2)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9a7a50" }}
                >
                  <Plus size={18} />
                </button>
              </div>
            )}
            
            {/* Dev Mode Mock Button */}
            {process.env.NODE_ENV === "development" && (
              <button
                type="button"
                onClick={handleMockUpload}
                style={{ marginTop: "12px", fontSize: "0.75rem", color: "#3498db", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
              >
                [Dev] Add Mock Image (Bypass Cloudinary)
              </button>
            )}
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>Saree Name <span style={{ color: "#c0392b" }}>*</span></label>
            <input style={inputStyle} value={form.name} onChange={(e) => handleField("name", e.target.value)} placeholder="e.g., Deep Crimson Kanchipuram Silk — Heritage Zari" />
          </div>

          {/* Row: Fabric + Occasion */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Fabric</label>
              <select style={inputStyle} value={form.fabric} onChange={(e) => handleField("fabric", e.target.value)}>
                {FABRICS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Occasion</label>
              <select style={inputStyle} value={form.occasion} onChange={(e) => handleField("occasion", e.target.value)}>
                {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Colour + Stock */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Colour</label>
              <select style={inputStyle} value={form.colour} onChange={(e) => handleField("colour", e.target.value)}>
                {COLOURS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Stock (units)</label>
              <input type="number" min="0" style={inputStyle} value={form.stock} onChange={(e) => handleField("stock", e.target.value)} />
            </div>
          </div>

          {/* Price */}
          <div>
            <label style={labelStyle}>Price (₹) <span style={{ color: "#c0392b" }}>*</span></label>
            <input type="number" min="0" style={inputStyle} value={form.basePrice} onChange={(e) => handleField("basePrice", e.target.value)} placeholder="e.g., 25000" />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description <span style={{ color: "#c0392b" }}>*</span></label>
            <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.description} onChange={(e) => handleField("description", e.target.value)} placeholder="Describe this saree's weave, craftsmanship, and uniqueness…" />
          </div>

          {/* Care Instructions */}
          <div>
            <label style={labelStyle}>Care Instructions</label>
            <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={form.careInstructions} onChange={(e) => handleField("careInstructions", e.target.value)} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSaving || isUploading}
            style={{
              width: "100%", padding: "16px",
              background: isSaving ? "#a0a0a0" : "linear-gradient(135deg, #4A0E17, #6d1422)",
              color: "#FCFBF7", border: "none", borderRadius: "3px", cursor: isSaving ? "not-allowed" : "pointer",
              fontSize: "0.95rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
              fontFamily: "inherit", transition: "opacity 0.2s",
            }}
          >
            {isSaving ? "Creating Saree…" : "✦ Create Saree"}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#6b4c3b",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid rgba(74,14,23,0.18)",
  borderRadius: "4px",
  background: "#fff",
  fontSize: "0.9rem",
  color: "#1a0a0e",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};
