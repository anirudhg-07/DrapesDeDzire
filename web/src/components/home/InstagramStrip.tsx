"use client";

// Placeholder Instagram strip — will be connected to Instagram API or Cloudinary gallery in a later phase
const instagramPosts = [
  { id: "1", color: "#4A0E17", accent: "#D4AF37", caption: "Kanchipuram Dreams ✨" },
  { id: "2", color: "#3D2314", accent: "#E2C456", caption: "Banarasi Royalty 👑" },
  { id: "3", color: "#8C1A29", accent: "#D4AF37", caption: "Bridal Ready 💍" },
  { id: "4", color: "#2A0810", accent: "#E2C456", caption: "Pure Elegance 🌸" },
  { id: "5", color: "#5C3825", accent: "#D4AF37", caption: "Chanderi Magic ✦" },
  { id: "6", color: "#4A0E17", accent: "#E2C456", caption: "Heritage Weaves 🪡" },
];

export default function InstagramStrip() {
  return (
    <section
      id="instagram-strip"
      style={{
        backgroundColor: "var(--color-cream)",
        padding: "var(--section-gap) 0",
      }}
    >
      <div className="section-container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
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
            Follow Our Journey
          </p>
          <h2
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontFamily: "var(--font-serif)",
              color: "var(--color-maroon)",
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            @drapes_de_dzire
          </h2>
        </div>

        {/* Photo grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "0.5rem",
          }}
        >
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href="https://www.instagram.com/drapes_de_dzire?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", textDecoration: "none" }}
            >
              <div
                style={{
                  aspectRatio: "1",
                  background: `linear-gradient(145deg, ${post.color} 0%, ${post.color}cc 100%)`,
                  borderRadius: "4px",
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  const overlay = (e.currentTarget as HTMLElement).querySelector(".ig-overlay") as HTMLElement;
                  if (overlay) overlay.style.opacity = "1";
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  const overlay = (e.currentTarget as HTMLElement).querySelector(".ig-overlay") as HTMLElement;
                  if (overlay) overlay.style.opacity = "0";
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                }}
              >
                {/* Decorative pattern */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212,175,55,0.06) 10px, rgba(212,175,55,0.06) 11px)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "2rem",
                      color: post.accent,
                      opacity: 0.15,
                      fontFamily: "var(--font-serif)",
                    }}
                  >
                    ✦
                  </span>
                </div>

                {/* Hover overlay */}
                <div
                  className="ig-overlay"
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(74,14,23,0.75)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    padding: "0.75rem",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-ivory)",
                      textAlign: "center",
                      fontFamily: "var(--font-sans)",
                      lineHeight: 1.4,
                    }}
                  >
                    {post.caption}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <a
            href="https://www.instagram.com/drapes_de_dzire"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              className="btn-outline"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span>Follow on Instagram</span>
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}
