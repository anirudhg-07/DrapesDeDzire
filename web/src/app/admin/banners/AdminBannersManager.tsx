"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Pencil, ImageOff, ExternalLink } from "lucide-react";
import type { Banner } from "@prisma/client";
import { getBannersByTypeAction } from "@/actions/admin-banners";
import EditBannerDrawer from "@/components/admin/EditBannerDrawer";

export default function AdminBannersManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getBannersByTypeAction("HERO");
    if (res.success && res.banners) setBanners(res.banners);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontFamily: "var(--font-serif)", color: "#4A0E17", margin: 0 }}>Hero Banners</h1>
          <p style={{ fontSize: "0.85rem", color: "#6b4c3b", margin: "4px 0 0" }}>
            {loading ? "Loading…" : `${banners.length} active banner${banners.length !== 1 ? "s" : ""} on the homepage`}
          </p>
        </div>
        <button onClick={() => setDrawerOpen(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "6px", border: "none", background: "linear-gradient(135deg, #4A0E17, #6d1422)", color: "#FCFBF7", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          <Pencil size={15} /> Manage Banners
        </button>
      </div>

      {loading ? null : banners.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "28px", background: "#fff", border: "1px solid rgba(74,14,23,0.1)", borderRadius: "10px", color: "#6b4c3b" }}>
          <ImageOff size={20} /> No banners yet — click “Manage Banners” to add one.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
          {banners.map((b) => (
            <div key={b.id} style={{ background: "#fff", border: "1px solid rgba(74,14,23,0.1)", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "#f4f1ea" }}>
                <Image src={b.imageUrl} alt={b.title || "Banner"} fill sizes="320px" style={{ objectFit: "cover" }} />
              </div>
              <div style={{ padding: "12px 14px" }}>
                <p style={{ fontSize: "0.75rem", color: "#9a7a50", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                  <ExternalLink size={12} />
                  {b.redirectUrl ? <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.redirectUrl}</span> : <span style={{ fontStyle: "italic" }}>No link</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditBannerDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        bannerType="HERO"
        sectionName="Hero Slider Banners"
        recommendedSize="Wide landscape (e.g. 1920x1080 / 16:9) shows best across phone & desktop. Any size works — the full image is always shown."
        onUpdated={load}
      />
    </div>
  );
}
