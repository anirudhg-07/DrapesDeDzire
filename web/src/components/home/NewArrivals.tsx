"use client";

import Link from "next/link";

// Placeholder product cards — will be replaced with DB data in Phase 3
const placeholderProducts = [
  {
    id: "1",
    name: "Kanchipuram Pure Silk — Ruby Zari",
    price: 24500,
    fabric: "Kanchipuram Silk",
    slug: "kanchipuram-pure-silk-ruby-zari",
    color: "#4A0E17",
    accent: "#D4AF37",
  },
  {
    id: "2",
    name: "Banarasi Meenakari Brocade",
    price: 18900,
    fabric: "Banarasi Silk",
    slug: "banarasi-meenakari-brocade",
    color: "#3D2314",
    accent: "#E2C456",
  },
  {
    id: "3",
    name: "Chanderi Ivory Tissue Saree",
    price: 8200,
    fabric: "Chanderi",
    slug: "chanderi-ivory-tissue",
    color: "#8C1A29",
    accent: "#D4AF37",
  },
  {
    id: "4",
    name: "Bridal Kanjivaram — Peacock Motif",
    price: 42000,
    fabric: "Bridal Silk",
    slug: "bridal-kanjivaram-peacock",
    color: "#2A0810",
    accent: "#E2C456",
  },
];

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function NewArrivals() {
  return (
    <section
      id="new-arrivals"
      style={{
        backgroundColor: "var(--color-cream)",
        padding: "var(--section-gap) 0",
      }}
    >
      <div className="section-container">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-gold-600)",
                fontFamily: "var(--font-sans)",
                marginBottom: "0.5rem",
              }}
            >
              Just In
            </p>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontFamily: "var(--font-serif)",
                color: "var(--color-maroon)",
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              New Arrivals
            </h2>
          </div>
          <Link href="/products?sort=newest">
            <button className="btn-outline" style={{ fontSize: "0.8125rem" }}>
              View All →
            </button>
          </Link>
        </div>

        {/* Product grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {placeholderProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: (typeof placeholderProducts)[0] }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      style={{ display: "block", textDecoration: "none" }}
    >
      <div
        className="product-card"
        style={{ cursor: "pointer" }}
      >
        {/* Image placeholder — will be replaced with Cloudinary image in Phase 3 */}
        <div
          style={{
            aspectRatio: "3/4",
            background: `linear-gradient(145deg, ${product.color} 0%, ${product.color}aa 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Pattern */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(212,175,55,0.05) 15px, rgba(212,175,55,0.05) 16px)",
            }}
          />
          <span
            style={{
              fontSize: "3rem",
              opacity: 0.15,
              color: product.accent,
              fontFamily: "var(--font-serif)",
            }}
          >
            ✦
          </span>

          {/* NEW badge */}
          <div
            style={{
              position: "absolute",
              top: "0.75rem",
              left: "0.75rem",
              backgroundColor: "var(--color-gold)",
              color: "var(--color-maroon)",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0.25rem 0.625rem",
              borderRadius: "2px",
              fontFamily: "var(--font-sans)",
            }}
          >
            New
          </div>
        </div>

        {/* Card info */}
        <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-gold-600)",
              fontFamily: "var(--font-sans)",
              marginBottom: "0.375rem",
            }}
          >
            {product.fabric}
          </p>
          <h3
            style={{
              fontSize: "0.9375rem",
              fontFamily: "var(--font-serif)",
              color: "var(--color-maroon)",
              fontWeight: 600,
              lineHeight: 1.3,
              marginBottom: "0.75rem",
            }}
          >
            {product.name}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--color-brown)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {formatPrice(product.price)}
            </p>
            <button
              onClick={(e) => e.preventDefault()}
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-maroon)",
                background: "none",
                border: "1px solid var(--color-maroon)",
                borderRadius: "2px",
                padding: "0.375rem 0.75rem",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--color-maroon)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--color-ivory)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--color-maroon)";
              }}
            >
              View
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
