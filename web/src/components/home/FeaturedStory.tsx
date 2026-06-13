import Link from "next/link";
import { prisma } from "@/lib/prisma";
import EditSectionButton from "../admin/EditSectionButton";
import Image from "next/image";

export default async function FeaturedStory({ isAdmin = false }: { isAdmin?: boolean }) {
  const storyBanners = await prisma.banner.findMany({
    where: { type: "FEATURED_STORY", isActive: true },
    orderBy: { orderNum: "asc" },
  });

  const featuredImage = storyBanners.length > 0 ? storyBanners[0] : null;

  return (
    <section
      id="featured-story"
      style={{
        padding: "var(--section-gap) 0",
        backgroundColor: "var(--color-ivory)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {isAdmin && (
        <EditSectionButton
          bannerType="FEATURED_STORY"
          sectionName="Featured Story"
          recommendedSize="800x1000px (4:5 Portrait)"
          top="20px"
          right="20px"
        />
      )}

      <div className="section-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          {/* Left — Decorative visual block */}
          <div style={{ position: "relative" }}>
            {/* Main card */}
            <div
              style={{
                aspectRatio: "4/5",
                background: "linear-gradient(145deg, #4A0E17 0%, #8C1A29 60%, #D4AF37 100%)",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-luxury-lg)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {featuredImage ? (
                <>
                  <Image src={featuredImage.imageUrl} alt={featuredImage.title || "Featured Story"} fill style={{ objectFit: "cover" }} />
                  {/* Subtle overlay */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(74,14,23,0.8), transparent)" }} />
                </>
              ) : (
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(212,175,55,0.04) 12px, rgba(212,175,55,0.04) 13px)",
                  }}
                />
              )}

              <div style={{ textAlign: "center", padding: "2rem", position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    fontSize: "4rem",
                    fontFamily: "var(--font-serif)",
                    color: "rgba(212,175,55,0.85)",
                    lineHeight: 1,
                    marginBottom: "1rem",
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  ✦
                </div>
                <p
                  style={{
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-ivory)",
                    fontWeight: 600,
                    lineHeight: 1.3,
                    fontStyle: "italic",
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  &quot;Where tradition meets timeless beauty&quot;
                </p>
                <div
                  style={{
                    width: "3rem",
                    height: "2px",
                    backgroundColor: "var(--color-gold)",
                    margin: "1.5rem auto",
                  }}
                />
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-gold)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-sans)",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  Drapes De Dzire
                </p>
              </div>
            </div>

            {/* Floating accent card */}
            <div
              style={{
                position: "absolute",
                bottom: "-1.5rem",
                right: "-1.5rem",
                backgroundColor: "var(--color-gold)",
                color: "var(--color-maroon)",
                padding: "1.25rem 1.5rem",
                borderRadius: "4px",
                boxShadow: "0 8px 32px rgba(212,175,55,0.4)",
                textAlign: "center",
                minWidth: "130px",
              }}
            >
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-serif)",
                  lineHeight: 1,
                  marginBottom: "0.25rem",
                }}
              >
                50+
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Curated Designs
              </p>
            </div>
          </div>

          {/* Right — Story text */}
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-gold-600)",
                fontFamily: "var(--font-sans)",
                marginBottom: "1rem",
              }}
            >
              Our Story
            </p>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontFamily: "var(--font-serif)",
                color: "var(--color-maroon)",
                fontWeight: 600,
                lineHeight: 1.2,
                marginBottom: "1.5rem",
              }}
            >
              A Boutique Born from Passion for Indian Craftsmanship
            </h2>

            <div className="gold-line" style={{ marginBottom: "1.5rem" }} />

            <p
              style={{
                fontSize: "1rem",
                color: "var(--color-brown-500)",
                lineHeight: 1.85,
                marginBottom: "1.25rem",
                fontFamily: "var(--font-sans)",
              }}
            >
              At Drapes De Dzire, we believe that every piece is more than fabric or metal —
              it is a living artwork, a cultural heirloom, and a statement of
              grace passed down through generations.
            </p>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--color-brown-500)",
                lineHeight: 1.85,
                marginBottom: "2rem",
                fontFamily: "var(--font-sans)",
              }}
            >
              We work directly with master weavers from Kanchipuram, Varanasi,
              and Chanderi, alongside expert jewellery artisans — ensuring every piece you receive carries the
              authentic touch of artisanal excellence. No middlemen.
              No compromises.
            </p>

            {/* Stats row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1.5rem",
                padding: "1.5rem 0",
                borderTop: "1px solid var(--color-cream-200)",
                borderBottom: "1px solid var(--color-cream-200)",
                marginBottom: "2rem",
              }}
            >
              {[
                { num: "50+", label: "Exclusive Designs" },
                { num: "100%", label: "Authentic Handwoven" },
                { num: "Pan India", label: "Delivery" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    style={{
                      fontSize: "1.375rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-serif)",
                      color: "var(--color-maroon)",
                      lineHeight: 1,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {stat.num}
                  </p>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-brown-500)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link href="/collections">
              <button className="btn-maroon">Discover Our Collections</button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
