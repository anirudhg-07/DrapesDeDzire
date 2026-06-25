"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, PlusCircle, Loader, PackageOpen } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { deleteProductAction } from "@/actions/admin-products";
import AddSareeDrawer from "@/components/admin/AddSareeDrawer";

export default function AdminProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [drawerCategory, setDrawerCategory] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const primaryImage = (p: Product) =>
    p.images.find((i) => i.isPrimary)?.imageUrl ?? p.images[0]?.imageUrl ?? null;

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This also removes its images and cannot be undone.`)) return;
    setDeletingId(p.id);
    const res = await deleteProductAction(p.id);
    setDeletingId(null);
    if (res.success) router.refresh();
    else alert(res.error || "Failed to delete.");
  };

  return (
    <div>
      {/* Header + Add buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontFamily: "var(--font-serif)", color: "#4A0E17", margin: 0 }}>Products</h1>
          <p style={{ fontSize: "0.85rem", color: "#6b4c3b", margin: "4px 0 0" }}>{products.length} active product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["Saree", "Kurta Set", "Jewellery"].map((cat) => (
            <button key={cat} onClick={() => setDrawerCategory(cat)} style={addBtn}>
              <PlusCircle size={15} /> {cat}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "28px", background: "#fff", border: "1px solid rgba(74,14,23,0.1)", borderRadius: "10px", color: "#6b4c3b" }}>
          <PackageOpen size={20} /> No products yet — use the buttons above to add one.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {products.map((p) => {
            const img = primaryImage(p);
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px", background: "#fff", border: "1px solid rgba(74,14,23,0.1)", borderRadius: "10px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", width: "56px", height: "70px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, background: "#f4f1ea" }}>
                  {img && <Image src={img} alt={p.name} fill sizes="56px" style={{ objectFit: "cover" }} />}
                </div>

                <div style={{ flex: 1, minWidth: "160px" }}>
                  <p style={{ fontSize: "0.92rem", fontWeight: 600, color: "#1a0a0e", margin: "0 0 4px" }}>{p.name}</p>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "0.78rem", color: "#6b4c3b" }}>
                    <span style={{ textTransform: "capitalize" }}>{p.categorySlug?.replace(/-/g, " ") || "—"}</span>
                    <span style={{ fontWeight: 600, color: "#4A0E17" }}>₹{Number(p.basePrice).toLocaleString("en-IN")}</span>
                    <span style={{ color: p.stock > 0 ? "#1e7e44" : "#c0392b" }}>
                      {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <Link href={`/products/${p.id}?adminEdit=1`} style={{ ...iconBtn, color: "#4A0E17" }} title="Edit">
                    <Pencil size={16} />
                  </Link>
                  <button onClick={() => handleDelete(p)} disabled={deletingId === p.id} style={{ ...iconBtn, color: "#c0392b" }} title="Delete">
                    {deletingId === p.id ? <Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddSareeDrawer
        isOpen={drawerCategory !== null}
        onClose={() => setDrawerCategory(null)}
        defaultCategory={drawerCategory ?? undefined}
        onCreated={() => {
          setDrawerCategory(null);
          router.refresh();
        }}
      />

      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const addBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 14px",
  borderRadius: "6px",
  border: "1px solid var(--color-maroon, #4A0E17)",
  background: "transparent",
  color: "#4A0E17",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

const iconBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "34px",
  height: "34px",
  borderRadius: "6px",
  border: "1px solid rgba(74,14,23,0.15)",
  background: "#fff",
  cursor: "pointer",
};
