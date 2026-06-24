"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Loader, Trash2, ArrowUp, ArrowDown, Pencil, Check, Link2 } from "lucide-react";
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

// Ready-made destinations so admins pick where a banner links to,
// instead of typing a raw URL. Mirrors the site's navigation.
const LINK_GROUPS: { label: string; options: { name: string; href: string }[] }[] = [
  {
    label: "Pages",
    options: [
      { name: "Home page", href: "/" },
      { name: "All Collections", href: "/collections" },
      { name: "Bridal", href: "/collections/bridal" },
    ],
  },
  {
    label: "Sarees",
    options: [
      { name: "Kanchipuram Silk", href: "/collections/kanchipuram-silk" },
      { name: "Banarasi Silk", href: "/collections/banarasi-silk" },
      { name: "Chanderi", href: "/collections/chanderi" },
      { name: "Georgette", href: "/collections/georgette" },
      { name: "Designer", href: "/collections/designer" },
    ],
  },
  {
    label: "Kurta Sets",
    options: [
      { name: "Anarkali", href: "/collections/anarkali" },
      { name: "Straight Cut", href: "/collections/straight-cut" },
      { name: "Sharara", href: "/collections/sharara" },
    ],
  },
  {
    label: "Jewellery",
    options: [
      { name: "Necklaces", href: "/collections/necklaces" },
      { name: "Bangles", href: "/collections/bangles" },
      { name: "Earrings", href: "/collections/earrings" },
    ],
  },
];

const KNOWN_LINKS = LINK_GROUPS.flatMap((g) => g.options);

function linkLabel(href: string | null | undefined): string {
  if (!href) return "No link — banner is not clickable";
  const match = KNOWN_LINKS.find((o) => o.href === href);
  return match ? match.name : href;
}

// Dropdown for choosing a destination, with a "Custom link" escape hatch.
function DestinationPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isKnown = KNOWN_LINKS.some((o) => o.href === value);
  const [custom, setCustom] = useState(!!value && !isKnown);

  const selectValue = custom ? "__custom__" : isKnown ? value : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <select
        style={inputStyle}
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__custom__") {
            setCustom(true);
            onChange("");
          } else {
            setCustom(false);
            onChange(v);
          }
        }}
      >
        <option value="">— No link (banner not clickable) —</option>
        {LINK_GROUPS.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.options.map((o) => (
              <option key={o.href} value={o.href}>
                {o.name}
              </option>
            ))}
          </optgroup>
        ))}
        <option value="__custom__">Custom link…</option>
      </select>
      {custom && (
        <input
          style={inputStyle}
          value={value}
          placeholder="e.g. /products/my-product"
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export default function EditBannerDrawer({ isOpen, onClose, bannerType, sectionName, recommendedSize, onUpdated }: EditBannerDrawerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add new banner state
  const [redirectUrl, setRedirectUrl] = useState("");
  const [title, setTitle] = useState(""); // only used for FEATURED_STORY
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newImage, setNewImage] = useState<{ url: string; publicId: string; previewUrl: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline edit state for existing banners
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLink, setEditLink] = useState("");

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
      setEditingId(null);
    }
  }, [isOpen, bannerType]);

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
    const mockUrl = bannerType === "HERO"
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
      title: bannerType === "FEATURED_STORY" ? title : "",
      subtitle: "",
      description: "",
      ctaText: "",
      redirectUrl,
      accentColor: "#D4AF37",
      orderNum: banners.length + 1,
    });

    setIsSaving(false);

    if (res.success) {
      setRedirectUrl("");
      setTitle("");
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

  const startEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setEditLink(banner.redirectUrl || "");
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const res = await updateBannerAction(editingId, { redirectUrl: editLink });
    if (res.success) {
      setEditingId(null);
      loadBanners();
      onUpdated();
    } else {
      alert("Failed to save changes.");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === banners.length - 1) return;

    const newBanners = [...banners];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    setBanners(newBanners);

    await Promise.all([
      updateBannerAction(newBanners[index].id, { orderNum: index + 1 }),
      updateBannerAction(newBanners[targetIndex].id, { orderNum: targetIndex + 1 }),
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
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2000,
          animation: "fade-in 0.2s ease",
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, height: "100vh", width: "min(600px, 96vw)",
          backgroundColor: "#FCFBF7", zIndex: 2001, overflowY: "auto",
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
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 500, margin: 0, color: "#FCFBF7" }}>
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
            <h3 style={{ fontSize: "1rem", color: "#4A0E17", marginBottom: "16px", fontWeight: 600 }}>Current Active Banners</h3>
            {isLoading ? (
              <p style={{ fontSize: "0.9rem", color: "#6b4c3b" }}>Loading...</p>
            ) : banners.length === 0 ? (
              <p style={{ fontSize: "0.9rem", color: "#6b4c3b", fontStyle: "italic" }}>No banners added yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {banners.map((banner, idx) => (
                  <div key={banner.id} style={{ padding: "12px", border: "1px solid rgba(74,14,23,0.1)", borderRadius: "6px", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={banner.imageUrl} alt="Banner" style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: banner.redirectUrl ? "#1a0a0e" : "#9a7a50" }}>
                          <Link2 size={14} />
                          <p style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {linkLabel(banner.redirectUrl)}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <button onClick={() => handleMove(idx, "up")} disabled={idx === 0} style={iconBtnStyle}><ArrowUp size={16} /></button>
                        <button onClick={() => handleMove(idx, "down")} disabled={idx === banners.length - 1} style={iconBtnStyle}><ArrowDown size={16} /></button>
                      </div>

                      <button onClick={() => startEdit(banner)} style={iconBtnStyle} title="Edit link">
                        <Pencil size={17} />
                      </button>
                      <button onClick={() => handleDelete(banner.id)} style={{ ...iconBtnStyle, color: "#c0392b" }} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Inline edit: change where this banner links to */}
                    {editingId === banner.id && (
                      <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed rgba(74,14,23,0.15)" }}>
                        <label style={labelStyle}>Tapping this banner opens</label>
                        <DestinationPicker value={editLink} onChange={setEditLink} />
                        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                          <button onClick={handleSaveEdit} style={savePillStyle}>
                            <Check size={15} /> Save
                          </button>
                          <button onClick={() => setEditingId(null)} style={cancelPillStyle}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr style={{ border: "none", borderTop: "1px solid rgba(74,14,23,0.1)" }} />

          {/* Add New Form */}
          <form onSubmit={handleAddBanner} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "1rem", color: "#4A0E17", marginBottom: "4px", fontWeight: 600 }}>Add New Banner</h3>

            {error && (
              <div style={{ padding: "12px 16px", background: "#fff1f1", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "4px", fontSize: "0.85rem", color: "#c0392b" }}>
                ⚠ {error}
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label style={labelStyle}>Banner Image <span style={{ color: "#c0392b" }}>*</span></label>
              <p style={{ fontSize: "0.75rem", color: "#6b4c3b", marginBottom: "8px" }}>{recommendedSize}</p>

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
                  <img src={newImage.previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain", background: "#f4f1ea" }} />
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

            {/* Title only for FEATURED_STORY */}
            {bannerType === "FEATURED_STORY" && (
              <div>
                <label style={labelStyle}>Title</label>
                <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional title overlay" />
              </div>
            )}

            {/* Destination picker (replaces hard-to-type URL field) */}
            <div>
              <label style={labelStyle}>When tapped, open</label>
              <DestinationPicker value={redirectUrl} onChange={setRedirectUrl} />
            </div>

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
              {isSaving ? "Saving…" : "✦ Add Banner"}
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

const savePillStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  background: "linear-gradient(135deg, #4A0E17, #6d1422)",
  color: "#FCFBF7",
  border: "none",
  borderRadius: "4px",
  padding: "8px 16px",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer",
};

const cancelPillStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid rgba(74,14,23,0.2)",
  color: "#6b4c3b",
  borderRadius: "4px",
  padding: "8px 16px",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer",
};
