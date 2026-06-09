"use client";

import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const footerCollections = [
  { name: "Kanchipuram Silk", href: "/collections/kanchipuram-silk" },
  { name: "Banarasi Silk", href: "/collections/banarasi-silk" },
  { name: "Chanderi Silk", href: "/collections/chanderi" },
  { name: "Georgette", href: "/collections/georgette" },
  { name: "Bridal Collection", href: "/collections/bridal" },
  { name: "Designer Sarees", href: "/collections/designer" },
];

const footerLinks = [
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Track Order", href: "/orders" },
  { name: "Return Policy", href: "/returns" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--color-maroon-900)",
        color: "var(--color-cream-100)",
        paddingTop: "var(--section-gap)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div className="section-container">
        {/* Top grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "3rem",
            paddingBottom: "3rem",
            borderBottom: "1px solid rgba(244,239,230,0.1)",
          }}
        >
          {/* Brand column */}
          <div style={{ gridColumn: "span 1" }}>
            <Link href="/" style={{ display: "inline-block", marginBottom: "1.25rem" }}>
              <img
                src="/logo.png"
                alt="Drapes De Dzire"
                style={{ height: "60px", width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }}
              />
            </Link>
            <p
              style={{
                fontSize: "0.875rem",
                lineHeight: 1.8,
                color: "rgba(244,239,230,0.65)",
                maxWidth: "280px",
              }}
            >
              Heritage in every thread. We curate India&apos;s finest handwoven
              sarees from master artisans — bringing a boutique showroom
              experience to your doorstep.
            </p>

            {/* Social */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <a
                href="https://www.instagram.com/drapes_de_dzire?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                id="footer-instagram"
                aria-label="Follow on Instagram"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: "1px solid rgba(212,175,55,0.35)",
                  color: "var(--color-gold-400)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(212,175,55,0.1)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--color-gold)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(212,175,55,0.35)";
                }}
              >
                {/* Instagram icon — inline SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-gold-400)",
                marginBottom: "1.25rem",
                fontFamily: "var(--font-sans)",
              }}
            >
              Collections
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {footerCollections.map((col) => (
                <li key={col.href}>
                  <Link
                    href={col.href}
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(244,239,230,0.65)",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color =
                        "var(--color-gold-400)")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color =
                        "rgba(244,239,230,0.65)")
                    }
                  >
                    {col.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-gold-400)",
                marginBottom: "1.25rem",
                fontFamily: "var(--font-sans)",
              }}
            >
              Help & Info
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(244,239,230,0.65)",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color =
                        "var(--color-gold-400)")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color =
                        "rgba(244,239,230,0.65)")
                    }
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-gold-400)",
                marginBottom: "1.25rem",
                fontFamily: "var(--font-sans)",
              }}
            >
              Stay Connected
            </h4>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}
            >
              <a
                href="mailto:hello@drapesdedzire.in"
                id="footer-email"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  color: "rgba(244,239,230,0.65)",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--color-gold-400)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "rgba(244,239,230,0.65)")
                }
              >
                <Mail size={14} />
                hello@drapesdedzire.in
              </a>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  color: "rgba(244,239,230,0.65)",
                }}
              >
                <MapPin size={14} />
                Pan India Delivery
              </div>
            </div>

            {/* Newsletter */}
            <p
              style={{
                fontSize: "0.8125rem",
                color: "rgba(244,239,230,0.5)",
                marginBottom: "0.75rem",
              }}
            >
              Get exclusive offers & saree drops:
            </p>
            <form
              id="newsletter-form"
              onSubmit={(e) => e.preventDefault()}
              style={{ display: "flex", gap: "0.5rem" }}
            >
              <input
                type="email"
                placeholder="Your email"
                aria-label="Newsletter email"
                style={{
                  flex: 1,
                  padding: "0.625rem 0.875rem",
                  fontSize: "0.875rem",
                  backgroundColor: "rgba(244,239,230,0.08)",
                  border: "1px solid rgba(212,175,55,0.25)",
                  borderRadius: "2px",
                  color: "var(--color-cream-100)",
                  outline: "none",
                  fontFamily: "var(--font-sans)",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-gold)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(212,175,55,0.25)")
                }
              />
              <button
                type="submit"
                style={{
                  padding: "0.625rem 1rem",
                  backgroundColor: "var(--color-gold)",
                  color: "var(--color-maroon)",
                  border: "none",
                  borderRadius: "2px",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--color-gold-400)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--color-gold)")
                }
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Trust badges */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "2rem",
            padding: "2rem 0",
            borderBottom: "1px solid rgba(244,239,230,0.08)",
          }}
        >
          {[
            { icon: "🔒", label: "100% Secure Payment", sub: "Razorpay Encrypted" },
            { icon: "✦", label: "Authentic Handwoven", sub: "Direct from Artisans" },
            { icon: "🚚", label: "Pan India Shipping", sub: "Free above ₹5,000" },
            { icon: "↩", label: "Easy Returns", sub: "7-Day Policy" },
          ].map((badge) => (
            <div
              key={badge.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>{badge.icon}</span>
              <div>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "rgba(244,239,230,0.85)",
                  }}
                >
                  {badge.label}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(244,239,230,0.4)",
                  }}
                >
                  {badge.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1.25rem 0",
          }}
        >
          <p style={{ fontSize: "0.8125rem", color: "rgba(244,239,230,0.35)" }}>
            © {new Date().getFullYear()} Drapes De Dzire. All rights reserved.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              color: "rgba(244,239,230,0.35)",
            }}
          >
            <span>Payments by</span>
            <span
              style={{
                fontWeight: 700,
                color: "var(--color-gold-600)",
                letterSpacing: "0.04em",
              }}
            >
              Razorpay
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
