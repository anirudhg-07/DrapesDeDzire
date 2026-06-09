"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const slides = [
  {
    id: 1,
    headline: "Heritage in Every Thread",
    subheadline: "Kanchipuram Silk",
    body: "Centuries of craftsmanship, woven into timeless elegance. Discover our curated collection of authentic handwoven silk sarees.",
    cta: "Explore Kanchipuram",
    href: "/collections/kanchipuram-silk",
    accent: "#D4AF37",
    bg: "linear-gradient(135deg, #2A0810 0%, #4A0E17 45%, #8C1A29 100%)",
  },
  {
    id: 2,
    headline: "Draped in Royalty",
    subheadline: "Banarasi Silk",
    body: "From the sacred looms of Varanasi — opulent Banarasi silks adorned with intricate zari work, fit for a queen.",
    cta: "Shop Banarasi",
    href: "/collections/banarasi-silk",
    accent: "#E2C456",
    bg: "linear-gradient(135deg, #1E0F08 0%, #3D2314 50%, #5C3825 100%)",
  },
  {
    id: 3,
    headline: "Your Perfect Bridal Look",
    subheadline: "Bridal Collection",
    body: "Begin your forever in breathtaking luxury. Handpicked bridal sarees crafted for your most cherished moments.",
    cta: "View Bridal Collection",
    href: "/collections/bridal",
    accent: "#D4AF37",
    bg: "linear-gradient(135deg, #2A0810 0%, #4A0E17 35%, #3D2314 100%)",
  },
];

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActive((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 400);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx: number) => {
    if (idx === active) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActive(idx);
      setIsTransitioning(false);
    }, 300);
  };

  const slide = slides[active];

  return (
    <section
      id="hero"
      aria-label="Hero banner"
      style={{
        position: "relative",
        minHeight: "85vh",
        display: "flex",
        alignItems: "center",
        background: slide.bg,
        transition: "background 0.8s ease",
        overflow: "hidden",
      }}
    >
      {/* Decorative pattern overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(212,175,55,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(212,175,55,0.05) 0%, transparent 40%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Ornamental corner accents */}
      {["top-8 left-8", "top-8 right-8", "bottom-8 left-8", "bottom-8 right-8"].map(
        (pos, i) => (
          <div
            key={i}
            aria-hidden
            style={{
              position: "absolute",
              ...(pos.includes("top") ? { top: "2rem" } : { bottom: "2rem" }),
              ...(pos.includes("left") ? { left: "2rem" } : { right: "2rem" }),
              width: "40px",
              height: "40px",
              borderTop: pos.includes("top")
                ? `1px solid rgba(212,175,55,0.3)`
                : "none",
              borderBottom: pos.includes("bottom")
                ? `1px solid rgba(212,175,55,0.3)`
                : "none",
              borderLeft: pos.includes("left")
                ? `1px solid rgba(212,175,55,0.3)`
                : "none",
              borderRight: pos.includes("right")
                ? `1px solid rgba(212,175,55,0.3)`
                : "none",
              opacity: 0.7,
            }}
          />
        )
      )}

      {/* Main content */}
      <div className="section-container" style={{ width: "100%", position: "relative", zIndex: 1 }}>
        <div
          style={{
            maxWidth: "680px",
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "translateY(12px)" : "translateY(0)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          {/* Subheadline pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.375rem 1rem",
              backgroundColor: "rgba(212,175,55,0.12)",
              border: `1px solid rgba(212,175,55,0.3)`,
              borderRadius: "2px",
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: slide.accent,
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: slide.accent,
                fontFamily: "var(--font-sans)",
              }}
            >
              {slide.subheadline}
            </span>
          </div>

          {/* Main headline */}
          <h1
            style={{
              fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
              fontFamily: "var(--font-serif)",
              color: "var(--color-ivory)",
              fontWeight: 600,
              lineHeight: 1.1,
              marginBottom: "1.5rem",
              letterSpacing: "-0.01em",
            }}
          >
            {slide.headline}
          </h1>

          {/* Gold decorative line */}
          <div
            style={{
              width: "3rem",
              height: "2px",
              background: `linear-gradient(90deg, ${slide.accent}, transparent)`,
              marginBottom: "1.5rem",
            }}
          />

          {/* Body text */}
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.125rem)",
              color: "rgba(252,251,247,0.75)",
              lineHeight: 1.75,
              marginBottom: "2.5rem",
              maxWidth: "520px",
              fontFamily: "var(--font-sans)",
            }}
          >
            {slide.body}
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href={slide.href}>
              <button
                style={{
                  padding: "0.875rem 2rem",
                  backgroundColor: slide.accent,
                  color: "var(--color-maroon)",
                  border: "none",
                  borderRadius: "2px",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  fontFamily: "var(--font-sans)",
                  boxShadow: `0 4px 24px rgba(212,175,55,0.35)`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    `0 8px 32px rgba(212,175,55,0.5)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    `0 4px 24px rgba(212,175,55,0.35)`;
                }}
              >
                {slide.cta}
              </button>
            </Link>
            <Link href="/collections">
              <button
                style={{
                  padding: "0.875rem 2rem",
                  backgroundColor: "transparent",
                  color: "rgba(252,251,247,0.85)",
                  border: "1px solid rgba(252,251,247,0.3)",
                  borderRadius: "2px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(252,251,247,0.6)";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--color-ivory)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(252,251,247,0.3)";
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(252,251,247,0.85)";
                }}
              >
                All Collections
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "0.625rem",
          zIndex: 2,
        }}
      >
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              width: idx === active ? "2rem" : "0.5rem",
              height: "0.375rem",
              borderRadius: "3px",
              backgroundColor:
                idx === active
                  ? "var(--color-gold)"
                  : "rgba(212,175,55,0.3)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.35s ease",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: "2.5rem",
          bottom: "2.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          opacity: 0.5,
        }}
      >
        <span
          style={{
            fontSize: "0.625rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-gold-400)",
            writingMode: "vertical-rl",
            fontFamily: "var(--font-sans)",
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: "1px",
            height: "3rem",
            background:
              "linear-gradient(to bottom, var(--color-gold-400), transparent)",
          }}
        />
      </div>
    </section>
  );
}
