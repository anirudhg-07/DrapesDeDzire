
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

// Fallback ratio used until an image reports its real dimensions on load.
const DEFAULT_RATIO = 16 / 9;

export default function HeroSection({ initialBanners = [], isAdmin = false }: HeroSectionProps) {
  const [active, setActive] = useState(0);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [slides] = useState<Banner[]>(initialBanners);
  // Natural aspect ratio (w/h) per banner id, filled in as each image loads.
  const [ratios, setRatios] = useState<Record<string, number>>({});

  const displaySlides = slides.length > 0 ? slides : [{
    id: 'fallback',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6153c?auto=format&fit=crop&w=1920&q=80',
    redirectUrl: '/collections',
  } as Banner];

  const hasMultiple = displaySlides.length > 1;

  const handleNext = () => setActive((prev) => (prev + 1) % displaySlides.length);
  const handlePrev = () => setActive((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  const goTo = (idx: number) => setActive(idx);

  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setInterval(handleNext, 5000);
    return () => clearInterval(timer);
  }, [hasMultiple, displaySlides.length]);

  const handleBannersUpdated = () => window.location.reload();

  const activeSlide = displaySlides[active];
  // Size the banner slot to the active image's real ratio so nothing is cropped
  // and there are no letterbox bars when the upload matches the slot.
  const activeRatio = ratios[activeSlide.id] || DEFAULT_RATIO;

  return (
    <section
      id="hero"
      aria-label="Promotional banners"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: activeRatio,
        maxHeight: "88vh",
        overflow: "hidden",
        backgroundColor: "var(--color-ivory)",
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

      {/* Clickable banner slides with crossfade */}
      {displaySlides.map((s, idx) => {
        const media = (
          <Image
            src={s.imageUrl}
            alt={s.title || "Promotional banner"}
            fill
            priority={idx === 0}
            sizes="100vw"
            style={{ objectFit: "contain" }}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                const r = img.naturalWidth / img.naturalHeight;
                setRatios((prev) => (prev[s.id] ? prev : { ...prev, [s.id]: r }));
              }
            }}
          />
        );

        return (
          <div
            key={s.id}
            style={{
              position: "absolute",
              inset: 0,
              opacity: idx === active ? 1 : 0,
              transition: "opacity 0.6s ease-in-out",
              pointerEvents: idx === active ? "auto" : "none",
              zIndex: idx === active ? 2 : 1,
            }}
          >
            {s.redirectUrl ? (
              <Link
                href={s.redirectUrl}
                aria-label={s.title || "View offer"}
                style={{ display: "block", position: "relative", width: "100%", height: "100%" }}
              >
                {media}
              </Link>
            ) : (
              media
            )}
          </div>
        );
      })}

      {/* Navigation arrows (desktop, only when multiple banners) */}
      {hasMultiple && (
        <div
          className="hidden md:flex"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 10,
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 1.5rem",
          }}
        >
          <button onClick={handlePrev} style={arrowStyle} aria-label="Previous banner">
            <ChevronLeft size={28} />
          </button>
          <button onClick={handleNext} style={arrowStyle} aria-label="Next banner">
            <ChevronRight size={28} />
          </button>
        </div>
      )}

      {/* Slide indicators (only when multiple banners) */}
      {hasMultiple && (
        <div
          style={{
            position: "absolute",
            bottom: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "0.5rem",
            zIndex: 10,
          }}
        >
          {displaySlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Go to banner ${idx + 1}`}
              style={{
                width: idx === active ? "1.75rem" : "0.5rem",
                height: "0.375rem",
                borderRadius: "3px",
                backgroundColor: idx === active ? "var(--color-gold)" : "rgba(212,175,55,0.45)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.35s ease",
                padding: 0,
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          ))}
        </div>
      )}

      {isAdmin && (
        <EditBannerDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          bannerType="HERO"
          sectionName="Hero Slider Banners"
          recommendedSize="Wide landscape (e.g. 1920x1080 / 16:9) shows best across phone & desktop. Any size works — the full image is always shown."
          onUpdated={handleBannersUpdated}
        />
      )}
    </section>
  );
}

const arrowStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.35)",
  border: "1px solid rgba(212,175,55,0.4)",
  color: "#FCFBF7",
  borderRadius: "50%",
  width: "44px",
  height: "44px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  pointerEvents: "auto",
  backdropFilter: "blur(4px)",
  transition: "all 0.2s ease",
};
