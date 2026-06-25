// src/app/admin/page.tsx
import Link from "next/link";
import { ShoppingBag, Package, ImageIcon, Sparkles, ArrowRight } from "lucide-react";
import { prisma, isDbConfigured } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getCounts() {
  if (!isDbConfigured()) return { products: 0, orders: 0, banners: 0, pending: 0 };
  try {
    const [products, orders, banners, pending] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.banner.count({ where: { type: "HERO", isActive: true } }),
      prisma.order.count({ where: { status: { in: ["PENDING", "PAID", "PROCESSING"] } } }),
    ]);
    return { products, orders, banners, pending };
  } catch {
    return { products: 0, orders: 0, banners: 0, pending: 0 };
  }
}

const cards = [
  { href: "/admin/orders", label: "Orders", desc: "View & update customer orders", icon: ShoppingBag, key: "orders" as const },
  { href: "/admin/products", label: "Products", desc: "Add, edit & remove products", icon: Package, key: "products" as const },
  { href: "/admin/banners", label: "Hero Banners", desc: "Manage homepage banners", icon: ImageIcon, key: "banners" as const },
  { href: "/admin/media", label: "Image Cleanup", desc: "Remove unused Cloudinary images", icon: Sparkles, key: null },
];

export default async function AdminDashboard() {
  const counts = await getCounts();

  return (
    <div>
      <div style={{ marginBottom: "8px" }}>
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9a7a50", fontWeight: 700 }}>
          Drapes De Dzire
        </p>
        <h1 style={{ fontSize: "1.9rem", fontFamily: "var(--font-serif)", color: "#4A0E17", margin: "4px 0 0" }}>
          Admin Dashboard
        </h1>
      </div>

      {counts.pending > 0 && (
        <Link href="/admin/orders" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "16px", padding: "10px 16px", background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "8px", color: "#6d1422", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
          {counts.pending} order{counts.pending > 1 ? "s" : ""} need attention <ArrowRight size={15} />
        </Link>
      )}

      {/* Stat + nav cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "28px" }}>
        {cards.map((c) => {
          const Icon = c.icon;
          const count = c.key ? counts[c.key] : null;
          return (
            <Link
              key={c.href}
              href={c.href}
              style={{
                display: "block",
                padding: "22px",
                background: "#fff",
                border: "1px solid rgba(74,14,23,0.1)",
                borderRadius: "12px",
                textDecoration: "none",
                boxShadow: "0 1px 3px rgba(74,14,23,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "linear-gradient(135deg, #4A0E17, #6d1422)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37" }}>
                  <Icon size={20} />
                </div>
                {count !== null && (
                  <span style={{ fontSize: "1.8rem", fontWeight: 700, color: "#4A0E17", fontFamily: "var(--font-serif)", lineHeight: 1 }}>
                    {count}
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: "1.05rem", color: "#1a0a0e", margin: "16px 0 4px", fontWeight: 700 }}>{c.label}</h2>
              <p style={{ fontSize: "0.85rem", color: "#6b4c3b", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                {c.desc} <ArrowRight size={13} style={{ color: "#9a7a50" }} />
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
