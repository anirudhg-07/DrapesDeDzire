"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Banner } from "@prisma/client";
import { ChevronLeft, ChevronRight, Edit3 } from "lucide-react";
import EditBannerDrawer from "@/components/admin/EditBannerDrawer";
import Image from "next/image";

interface HeroSectionProps {
  initialBanners?: Banner[];
  isAdmin?: boolean;
}

export default function HeroSection({ initialBanners = [], isAdmin = false }: HeroSectionProps) {
  const [active, setActive] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [slides, setSlides] = useState<Banner[]>(initialBanners);

  // If no banners from DB yet, provide a fallback to prevent blank screen
  const displaySlides = slides.length > 0 ? slides : [{
    id: 'fallback',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6153c?auto=format&fit=crop&w=1920&q=80',
    title: 'Heritage in Every Thread',
    subtitle: 'Kanchipuram Silk',
    description: 'Centuries of craftsmanship, woven into timeless elegance. Discover our curated collection of authentic handwoven silk sarees.',
    ctaText: 'Explore Collection',
    redirectUrl: '/collections',
    accentColor: '#D4AF37'
  } as Banner];

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActive((prev) => (prev + 1) % displaySlides.length);
      setIsTransitioning(false);
    }, 400);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActive((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
      setIsTransitioning(false);
    }, 400);
  };

  useEffect(() => {
    // Auto slide
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [active, displaySlides.length]);

  const goTo = (idx: number) => {
    if (idx === active || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActive(idx);
      setIsTransitioning(false);
    }, 300);
  };

  // Reload banners after admin updates
  const handleBannersUpdated = async () => {
    // We can do a router.refresh() or fetch directly.
    // For simplicity, a page reload works best to sync all server components.
    window.location.reload();
  };

  const slide = displaySlides[active];

  return (
    <section
      id="hero"
      aria-label="Hero banner"
      style={{
        position: "relative",
        minHeight: "85vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "#1a0a0e" // fallback dark bg
      }}
    >
      {isAdmin && (
        <button
          onClick={() => setIsEditDrawerOpen(true)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 50,
            background: "rgba(212,175,55,0.9)",
            color: "#1a0a0e",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <Edit3 size={16} /> Edit Hero Banners
        </button>
      )}

      {/* Background Image with crossfade transition */}
      {displaySlides.map((s, idx) => (
        <div 
          key={s.id}
          style={{
            position: "absolute",
            inset: 0,
            opacity: idx === active ? 1 : 0,
            transition: "opacity 0.8s ease-in-out",
            zIndex: 0
          }}
        >
          <Image
            src={s.imageUrl}
            alt={s.title || 'Hero Background'}
            fill
            priority={idx === 0}
            style={{ objectFit: 'cover' }}
          />
          {/* Dark gradient overlay to ensure text is readable */}
          {(s.title || s.subtitle || s.description || s.ctaText) && (
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to right, rgba(26,10,14,0.9) 0%, rgba(26,10,14,0.5) 50%, rgba(26,10,14,0.1) 100%)"
            }} />
          )}
        </div>
      ))}

      {/* Navigation Arrows */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2rem" }}>
        <button onClick={handlePrev} style={arrowStyle} aria-label="Previous slide"><ChevronLeft size={32} /></button>
        <button onClick={handleNext} style={arrowStyle} aria-label="Next slide"><ChevronRight size={32} /></button>
      </div>

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
          zIndex: 1
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
              borderTop: pos.includes("top") ? `1px solid rgba(212,175,55,0.3)` : "none",
              borderBottom: pos.includes("bottom") ? `1px solid rgba(212,175,55,0.3)` : "none",
              borderLeft: pos.includes("left") ? `1px solid rgba(212,175,55,0.3)` : "none",
              borderRight: pos.includes("right") ? `1px solid rgba(212,175,55,0.3)` : "none",
              opacity: 0.7,
              zIndex: 1
            }}
          />
        )
      )}

      {/* Main content */}
      <div className="section-container" style={{ width: "100%", position: "relative", zIndex: 2 }}>
        <div
          style={{
            maxWidth: "680px",
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "translateY(12px)" : "translateY(0)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          {slide.subtitle && (
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
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: slide.accentColor || "#D4AF37", display: "inline-block" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: slide.accentColor || "#D4AF37", fontFamily: "var(--font-sans)" }}>
                {slide.subtitle}
              </span>
            </div>
          )}

          {slide.title && (
            <h1
              style={{
                fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
                fontFamily: "var(--font-serif)",
                color: "var(--color-ivory)",
                fontWeight: 600,
                lineHeight: 1.1,
                marginBottom: "1.5rem",
                letterSpacing: "-0.01em",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)"
              }}
            >
              {slide.title}
            </h1>
          )}

          {(slide.title || slide.description) && (
            <div style={{ width: "3rem", height: "2px", background: `linear-gradient(90deg, ${slide.accentColor || '#D4AF37'}, transparent)`, marginBottom: "1.5rem" }} />
          )}

          {slide.description && (
            <p
              style={{
                fontSize: "clamp(1rem, 2vw, 1.125rem)",
                color: "rgba(252,251,247,0.85)",
                lineHeight: 1.75,
                marginBottom: "2.5rem",
                maxWidth: "520px",
                fontFamily: "var(--font-sans)",
                textShadow: "0 1px 3px rgba(0,0,0,0.5)"
              }}
            >
              {slide.description}
            </p>
          )}

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {slide.ctaText && slide.redirectUrl && (
              <Link href={slide.redirectUrl}>
                <button
                  style={{
                    padding: "0.875rem 2rem",
                    backgroundColor: slide.accentColor || "#D4AF37",
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
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {slide.ctaText}
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.625rem", zIndex: 10 }}>
        {displaySlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              width: idx === active ? "2rem" : "0.5rem",
              height: "0.375rem",
              borderRadius: "3px",
              backgroundColor: idx === active ? "var(--color-gold)" : "rgba(212,175,55,0.3)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.35s ease",
              padding: 0,
            }}
          />
        ))}
      </div>

      {isAdmin && (
        <EditBannerDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          bannerType="HERO"
          sectionName="Hero Slider Banners"
          recommendedSize="1920x1080px (16:9 Landscape)"
          onUpdated={handleBannersUpdated}
        />
      )}
    </section>
  );
}

const arrowStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(212,175,55,0.3)",
  color: "#FCFBF7",
  borderRadius: "50%",
  width: "48px",
  height: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  pointerEvents: "auto",
  backdropFilter: "blur(4px)",
  transition: "all 0.2s ease"
};
