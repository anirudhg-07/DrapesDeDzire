// src/components/products/ZoomLens.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ZoomLensProps {
  src: string;
  alt: string;
}

export default function ZoomLens({ src, alt }: ZoomLensProps) {
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [hasHover, setHasHover] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the device has hover capability (i.e. mouse, not touch screen)
    const mediaQuery = window.matchMedia("(hover: hover)");
    
    // Defer the state update to avoid cascading synchronous renders inside the effect body
    const timeoutId = setTimeout(() => {
      setHasHover(mediaQuery.matches);
    }, 0);

    const handler = (e: MediaQueryListEvent) => setHasHover(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => {
      clearTimeout(timeoutId);
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !hasHover) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    // Calculate cursor positions in percentage relative to the card bounds
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        cursor: showZoom && hasHover ? "zoom-out" : (hasHover ? "zoom-in" : "default"),
        overflow: "hidden",
        borderRadius: "4px",
        backgroundColor: "var(--color-cream)",
        boxShadow: "var(--shadow-luxury)",
        aspectRatio: "3/4",
        width: "100%",
      }}
      onMouseEnter={() => hasHover && setShowZoom(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (hasHover) {
          setShowZoom(false);
          // Reset origin smoothly to center on leave
          setZoomPos({ x: 50, y: 50 });
        }
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
        style={{
          objectFit: "cover",
          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
          transform: showZoom && hasHover ? "scale(2.2)" : "scale(1)",
          transition: showZoom && hasHover
            ? "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)" 
            : "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform-origin 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      />

      {/* Decorative Golden Corner Frames */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          width: "20px",
          height: "20px",
          borderTop: "2px solid var(--color-gold)",
          borderLeft: "2px solid var(--color-gold)",
          pointerEvents: "none",
          opacity: showZoom && hasHover ? 0.3 : 0.8,
          transition: "opacity 0.2s ease",
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          width: "20px",
          height: "20px",
          borderTop: "2px solid var(--color-gold)",
          borderRight: "2px solid var(--color-gold)",
          pointerEvents: "none",
          opacity: showZoom && hasHover ? 0.3 : 0.8,
          transition: "opacity 0.2s ease",
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "12px",
          left: "12px",
          width: "20px",
          height: "20px",
          borderBottom: "2px solid var(--color-gold)",
          borderLeft: "2px solid var(--color-gold)",
          pointerEvents: "none",
          opacity: showZoom && hasHover ? 0.3 : 0.8,
          transition: "opacity 0.2s ease",
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "12px",
          right: "12px",
          width: "20px",
          height: "20px",
          borderBottom: "2px solid var(--color-gold)",
          borderRight: "2px solid var(--color-gold)",
          pointerEvents: "none",
          opacity: showZoom && hasHover ? 0.3 : 0.8,
          transition: "opacity 0.2s ease",
          zIndex: 5,
        }}
      />

      {/* Subtle overlay hint */}
      {!showZoom && hasHover && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(74, 14, 23, 0.8)",
            color: "var(--color-cream-100)",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.05em",
            pointerEvents: "none",
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
          }}
        >
          Hover to inspect weave
        </div>
      )}
    </div>
  );
}
