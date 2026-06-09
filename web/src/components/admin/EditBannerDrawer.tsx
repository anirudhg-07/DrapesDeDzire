"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Plus, Loader, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { BannerType, Banner } from "@prisma/client";
import { getBannersByTypeAction, createBannerAction, deleteBannerAction, updateBannerAction } from "@/actions/admin-banners";
import { uploadImageToCloudinaryAction } from "@/actions/admin-products";

interface EditBannerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bannerType: BannerType;
  sectionName: string;
  recommendedSize: string;
  onUpdated: () => void;
}

const defaultForm = {
  title: "",
  subtitle: "",
  description: "",
  ctaText: "",
  redirectUrl: "",
  accentColor: "#D4AF37",
};

export default function EditBannerDrawer({ isOpen, onClose, bannerType, sectionName, recommendedSize, onUpdated }: EditBannerDrawerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Add new banner state
  const [form, setForm] = useState(defaultForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newImage, setNewImage] = useState<{ url: string; publicId: string; previewUrl: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBanners = async () => {
    setIsLoading(true);
    const res = await getBannersByTypeAction(bannerType);
    if (res.success && res.banners) {
      setBanners(res.banners);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadBanners();
    }
  }, [isOpen, bannerType]);

  const handleField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    setError("");

    const file = files[0];
    const previewUrl = URL.createObjectURL(file);
    const fd = new FormData();
    fd.append("file", file);
    
    const res = await uploadImageToCloudinaryAction(fd);
    if (res.success && res.url && res.publicId) {
      setNewImage({ url: res.url, publicId: res.publicId, previewUrl });
    } else {
      setError(res.error || "Image upload failed.");
    }
    setUploadingImage(false);
  };

  const handleMockUpload = () => {
    const mockUrl = bannerType === 'HERO' 
      ? "https://images.unsplash.com/photo-1583391733958-d25e07fac04f?auto=format&fit=crop&w=1920&q=80"
      : "https://images.unsplash.com/photo-1610189013233-5c8e221371ba?auto=format&fit=crop&w=800&q=80";
    setNewImage({ url: mockUrl, publicId: `mock_${Date.now()}`, previewUrl: mockUrl });
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newImage) return setError("Please upload an image first.");

    setIsSaving(true);
    const res = await createBannerAction({
      type: bannerType,
      imageUrl: newImage.url,
      publicId: newImage.publicId,
      title: form.title,
      subtitle: form.subtitle,
      description: form.description,
      ctaText: form.ctaText,
      redirectUrl: form.redirectUrl,
      accentColor: form.accentColor,
      orderNum: banners.length + 1,
    });
    
    setIsSaving(false);

    if (res.success) {
      setForm(defaultForm);
      setNewImage(null);
      loadBanners();
      onUpdated();
    } else {
      setError(res.error || "Failed to create banner.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    const res = await deleteBannerAction(id);
    if (res.success) {
      loadBanners();
      onUpdated();
    } else {
      alert("Failed to delete.");
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === banners.length - 1) return;

    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;
    
    setBanners(newBanners);

    // Save order
    await Promise.all([
      updateBannerAction(newBanners[index].id, { orderNum: index + 1 }),
      updateBannerAction(newBanners[targetIndex].id, { orderNum: targetIndex + 1 })
    ]);
    
    onUpdated();
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
          position: "fixed", top: 0, right: 0, height: "100vh", width: "min(600px, 96vw)",
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
              Edit {sectionName}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#FCFBF7", cursor: "pointer", padding: "4px" }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ flex: 1, padding: "28px", display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Current Images List */}
          <div>
            <h3 style={{ fontSize: "1rem", color: "#4A0E17", marginBottom: "16px", fontWeight: 600 }}>Current Active Images</h3>
            {isLoading ? (
              <p style={{ fontSize: "0.9rem", color: "#6b4c3b" }}>Loading...</p>
            ) : banners.length === 0 ? (
              <p style={{ fontSize: "0.9rem", color: "#6b4c3b", fontStyle: "italic" }}>No images added yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {banners.map((banner, idx) => (
                  <div key={banner.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px", border: "1px solid rgba(74,14,23,0.1)", borderRadius: "6px", background: "#fff" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banner.imageUrl} alt={banner.title || "Banner"} style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.9rem", fontWeight: 600, margin: "0 0 4px 0", color: "#1a0a0e" }}>{banner.title || "Untitled Image"}</p>
                      {banner.subtitle && <p style={{ fontSize: "0.8rem", color: "#6b4c3b", margin: 0 }}>{banner.subtitle}</p>}
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} style={iconBtnStyle}><ArrowUp size={16} /></button>
                      <button onClick={() => handleMove(idx, 'down')} disabled={idx === banners.length - 1} style={iconBtnStyle}><ArrowDown size={16} /></button>
                    </div>
                    
                    <button onClick={() => handleDelete(banner.id)} style={{ ...iconBtnStyle, color: "#c0392b" }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr style={{ border: "none", borderTop: "1px solid rgba(74,14,23,0.1)" }} />

          {/* Add New Form */}
          <form onSubmit={handleAddBanner} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "1rem", color: "#4A0E17", marginBottom: "4px", fontWeight: 600 }}>Add New Image</h3>
            
            {error && (
              <div style={{ padding: "12px 16px", background: "#fff1f1", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "4px", fontSize: "0.85rem", color: "#c0392b" }}>
                ⚠ {error}
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label style={labelStyle}>Upload Image <span style={{ color: "#c0392b" }}>*</span></label>
              <p style={{ fontSize: "0.75rem", color: "#6b4c3b", marginBottom: "8px" }}>Recommended dimensions: {recommendedSize}</p>
              
              {!newImage ? (
                <>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: "2px dashed rgba(74,14,23,0.2)", borderRadius: "6px", padding: "32px 24px",
                      textAlign: "center", cursor: "pointer", background: "rgba(74,14,23,0.02)",
                    }}
                  >
                    {uploadingImage ? (
                      <div style={{ color: "#9a7a50", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <Loader size={28} style={{ animation: "spin 1s linear infinite" }} />
                        <span style={{ fontSize: "0.85rem" }}>Uploading to Cloudinary…</span>
                      </div>
                    ) : (
                      <div style={{ color: "#9a7a50", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <Upload size={28} />
                        <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Click to upload image</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileSelect(e.target.files)} />
                  
                  {process.env.NODE_ENV === "development" && (
                    <button type="button" onClick={handleMockUpload} style={{ marginTop: "12px", fontSize: "0.75rem", color: "#3498db", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                      [Dev] Add Mock Image (Bypass Cloudinary)
                    </button>
                  )}
                </>
              ) : (
                <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "6px", overflow: "hidden", border: "1px solid rgba(74,14,23,0.15)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={newImage.previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={() => setNewImage(null)}
                    style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(192,57,43,0.85)", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Optional Text Fields (Depending on Banner Type) */}
            {bannerType === 'HERO' && (
              <>
                <div>
                  <label style={labelStyle}>Subheadline (Pill)</label>
                  <input style={inputStyle} value={form.subtitle} onChange={(e) => handleField("subtitle", e.target.value)} placeholder="e.g., Kanchipuram Silk" />
                </div>
                <div>
                  <label style={labelStyle}>Main Headline</label>
                  <input style={inputStyle} value={form.title} onChange={(e) => handleField("title", e.target.value)} placeholder="e.g., Heritage in Every Thread" />
                </div>
                <div>
                  <label style={labelStyle}>Description / Body</label>
                  <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.description} onChange={(e) => handleField("description", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Call to Action Button Text</label>
                  <input style={inputStyle} value={form.ctaText} onChange={(e) => handleField("ctaText", e.target.value)} placeholder="e.g., Explore Collection" />
                </div>
                <div>
                  <label style={labelStyle}>Button Link URL</label>
                  <input style={inputStyle} value={form.redirectUrl} onChange={(e) => handleField("redirectUrl", e.target.value)} placeholder="e.g., /collections/kanchipuram-silk" />
                </div>
              </>
            )}

            {(bannerType === 'FEATURED_STORY') && (
              <>
                <div>
                  <label style={labelStyle}>Title</label>
                  <input style={inputStyle} value={form.title} onChange={(e) => handleField("title", e.target.value)} placeholder="Optional title overlay" />
                </div>
                <div>
                  <label style={labelStyle}>Link URL</label>
                  <input style={inputStyle} value={form.redirectUrl} onChange={(e) => handleField("redirectUrl", e.target.value)} placeholder="e.g., /about" />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSaving || uploadingImage}
              style={{
                width: "100%", padding: "16px", marginTop: "8px",
                background: isSaving ? "#a0a0a0" : "linear-gradient(135deg, #4A0E17, #6d1422)",
                color: "#FCFBF7", border: "none", borderRadius: "3px", cursor: isSaving ? "not-allowed" : "pointer",
                fontSize: "0.95rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                fontFamily: "inherit", transition: "opacity 0.2s",
              }}
            >
              {isSaving ? "Saving…" : "✦ Add to Section"}
            </button>
          </form>
        </div>
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

const iconBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#6b4c3b",
  padding: "4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
