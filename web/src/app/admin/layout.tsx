import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  if (!admin) redirect("/");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#faf8f5" }}>
      <nav
        style={{
          background: "linear-gradient(90deg, #1a0a0e 0%, #4A0E17 100%)",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          height: "52px",
          borderBottom: "1px solid rgba(212,175,55,0.3)",
          overflowX: "auto",
          whiteSpace: "nowrap",
          scrollbarWidth: "none",
        }}
      >
        <span
          style={{
            color: "#D4AF37",
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginRight: "4px",
            flexShrink: 0,
          }}
        >
          Admin
        </span>
        {[
          { label: "Orders", href: "/admin/orders" },
          { label: "Products", href: "/admin/products" },
          { label: "Banners", href: "/admin/banners" },
          { label: "Media", href: "/admin/media" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: "rgba(212,175,55,0.75)",
              fontSize: "0.78rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/"
          style={{
            marginLeft: "auto",
            paddingLeft: "16px",
            color: "rgba(255,255,255,0.45)",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          ← Back to Site
        </Link>
      </nav>
      <div style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}