import { prisma } from "@/lib/prisma";
import EditSectionButton from "../admin/EditSectionButton";

export default async function InstagramStrip({ isAdmin = false }: { isAdmin?: boolean }) {
  // Fetch instagram posts from CMS
  const dbPosts = await prisma.banner.findMany({
    where: { type: "INSTAGRAM_POST", isActive: true },
    orderBy: { orderNum: "asc" },
  });

  // Fallback posts if none exist
  const instagramPosts = dbPosts.length > 0 ? dbPosts : [
    { id: "1", color: "#4A0E17", title: "Kanchipuram Dreams ✨" },
    { id: "2", color: "#3D2314", title: "Banarasi Royalty 👑" },
    { id: "3", color: "#8C1A29", title: "Bridal Ready 💍" },
    { id: "4", color: "#2A0810", title: "Pure Elegance 🌸" },
    { id: "5", color: "#5C3825", title: "Chanderi Magic ✦" },
    { id: "6", color: "#4A0E17", title: "Heritage Weaves 🪡" },
  ];

  return (
    <section
      id="instagram-strip"
      style={{
        backgroundColor: "var(--color-cream)",
        padding: "var(--section-gap) 0",
        position: "relative",
      }}
    >
      {isAdmin && (
        <EditSectionButton
          bannerType="INSTAGRAM_POST"
          sectionName="Instagram"
          recommendedSize="600x600px (1:1 Square)"
          top="20px"
          right="20px"
        />
      )}

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
          {instagramPosts.map((post: { id: string; color?: string; title?: string | null; imageUrl?: string; redirectUrl?: string | null; caption?: string }) => (
            <a
              key={post.id}
              href={post.redirectUrl || "https://www.instagram.com/drapes_de_dzire?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", textDecoration: "none" }}
            >
              <div
                style={{
                  aspectRatio: "1",
                  background: post.imageUrl 
                    ? `url(${post.imageUrl}) center/cover no-repeat` 
                    : `linear-gradient(145deg, ${post.color} 0%, ${post.color}cc 100%)`,
                  borderRadius: "4px",
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                  transition: "transform 0.3s ease",
                }}
                className="ig-card-wrapper"
              >
                {/* Decorative pattern for fallbacks */}
                {!post.imageUrl && (
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage:
                        "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212,175,55,0.06) 10px, rgba(212,175,55,0.06) 11px)",
                    }}
                  />
                )}
                
                {!post.imageUrl && (
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
                        color: "#D4AF37",
                        opacity: 0.15,
                        fontFamily: "var(--font-serif)",
                      }}
                    >
                      ✦
                    </span>
                  </div>
                )}

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
                    {post.title || post.caption || "View on Instagram"}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Global style for hover state since it's a Server Component */}
        <style>{`
          .ig-card-wrapper:hover .ig-overlay {
            opacity: 1 !important;
          }
          .ig-card-wrapper:hover {
            transform: scale(1.02);
          }
        `}</style>

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
