"use client";

import Link from "next/link";

const collections = [
  {
    name: "Kanchipuram Silk",
    tagline: "South India's Crown Jewel",
    href: "/collections/kanchipuram-silk",
    color: "#4A0E17",
    accentColor: "#D4AF37",
    emoji: "✦",
  },
  {
    name: "Banarasi Silk",
    tagline: "Woven with Zari & Legacy",
    href: "/collections/banarasi-silk",
    color: "#3D2314",
    accentColor: "#E2C456",
    emoji: "◈",
  },
  {
    name: "Chanderi Silk",
    tagline: "Light as a Feather",
    href: "/collections/chanderi",
    color: "#2A0810",
    accentColor: "#D4AF37",
    emoji: "⬡",
  },
  {
    name: "Bridal Collection",
    tagline: "Your Most Special Day",
    href: "/collections/bridal",
    color: "#8C1A29",
    accentColor: "#E2C456",
    emoji: "♡",
  },
  {
    name: "Kurta Sets",
    tagline: "Elegant & Comfortable",
    href: "/collections/kurta-sets",
    color: "#5C3825",
    accentColor: "#D4AF37",
    emoji: "◇",
  },
  {
    name: "Jewellery",
    tagline: "The Perfect Accessory",
    href: "/collections/jewellery",
    color: "#4A0E17",
    accentColor: "#E2C456",
    emoji: "✧",
  },
];

export default function CollectionsGrid() {
  return (
    <section
      id="collections"
      style={{
        backgroundColor: "var(--color-cream)",
        padding: "var(--section-gap) 0",
      }}
    >
      <div className="section-container">
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-gold-600)",
              fontFamily: "var(--font-sans)",
              marginBottom: "0.75rem",
            }}
          >
            Curated for You
          </p>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontFamily: "var(--font-serif)",
              color: "var(--color-maroon)",
              fontWeight: 600,
              lineHeight: 1.2,
              marginBottom: "1rem",
            }}
          >
            Explore Our Collections
          </h2>
          <div className="ornament-divider" style={{ maxWidth: "200px", margin: "0 auto" }}>
            <span style={{ fontFamily: "var(--font-serif)", color: "var(--color-gold)", fontSize: "1.25rem" }}>✦</span>
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {collections.map((col, idx) => (
            <CollectionCard key={col.href} col={col} priority={idx < 3} />
          ))}
        </div>

        {/* View All CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link href="/collections">
            <button className="btn-outline">View All Collections</button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CollectionCard({
  col,
}: {
  col: (typeof collections)[0];
  priority: boolean;
}) {
  return (
    <Link href={col.href} style={{ display: "block", textDecoration: "none" }}>
      <div
        style={{
          position: "relative",
          borderRadius: "4px",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${col.color} 0%, ${col.color}cc 100%)`,
          minHeight: "200px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "1.75rem",
          cursor: "pointer",
          transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease",
          boxShadow: "var(--shadow-luxury)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "var(--shadow-luxury-lg)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-luxury)";
        }}
      >
        {/* Decorative pattern */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            fontSize: "3rem",
            opacity: 0.08,
            color: col.accentColor,
            lineHeight: 1,
            fontFamily: "var(--font-serif)",
          }}
        >
          {col.emoji}
        </div>

        {/* Gold top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, ${col.accentColor}, transparent)`,
          }}
        />

        {/* Content */}
        <div>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: col.accentColor,
              fontFamily: "var(--font-sans)",
              marginBottom: "0.375rem",
              opacity: 0.85,
            }}
          >
            {col.tagline}
          </p>
          <h3
            style={{
              fontSize: "1.25rem",
              fontFamily: "var(--font-serif)",
              color: "var(--color-ivory)",
              fontWeight: 600,
              lineHeight: 1.2,
              marginBottom: "0.75rem",
            }}
          >
            {col.name}
          </h3>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.8125rem",
              color: col.accentColor,
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            Shop Now →
          </span>
        </div>
      </div>
    </Link>
  );
}
