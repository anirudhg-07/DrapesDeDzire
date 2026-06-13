"use client";

import { Award, ShieldCheck, Truck, RotateCcw, Camera, HeartHandshake } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Authenticity Guaranteed",
    body: "Every piece is sourced directly from certified master weavers and creators. We provide a certificate of authenticity with each purchase.",
    num: "01",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    body: "All transactions are encrypted and processed through Razorpay — India's most trusted payment gateway.",
    num: "02",
  },
  {
    icon: Truck,
    title: "Pan India Delivery",
    body: "We ship to every corner of India. Orders above ₹5,000 qualify for complimentary shipping.",
    num: "03",
  },
  {
    icon: RotateCcw,
    title: "Hassle-Free Returns",
    body: "Not fully satisfied? Return within 7 days for a full refund or exchange. No questions asked.",
    num: "04",
  },
  {
    icon: Camera,
    title: "True-to-Life Photos",
    body: "Every product is photographed under natural light to ensure colours are accurately represented.",
    num: "05",
  },
  {
    icon: HeartHandshake,
    title: "Personalised Assistance",
    body: "Our style experts are available to help you choose the perfect piece for any occasion.",
    num: "06",
  },
];

export default function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      style={{
        backgroundColor: "var(--color-ivory)",
        padding: "var(--section-gap) 0",
      }}
    >
      <div className="section-container">
        <div className="why-shop-grid">
          {/* Left Side: Brand Editorial Philosophy */}
          <div
            className="static lg:sticky lg:top-[6rem]"
            style={{
              border: "1px solid var(--color-gold)",
              padding: "3rem 2.5rem",
              borderRadius: "2px",
              backgroundColor: "var(--color-cream)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              minHeight: "350px",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* Elegant serif watermark "D" */}
            <div
              style={{
                position: "absolute",
                bottom: "-2rem",
                right: "-1.5rem",
                fontSize: "13rem",
                fontFamily: "var(--font-display)",
                color: "rgba(212, 175, 55, 0.07)",
                fontWeight: 700,
                lineHeight: 1,
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              D
            </div>

            <div>
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
                The Drapes De Dzire Difference
              </p>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-maroon)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  marginBottom: "1rem",
                }}
              >
                Why Shop With Us?
              </h2>
              <div className="gold-line" style={{ marginBottom: "0.5rem" }} />
            </div>

            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--color-brown-500)",
                lineHeight: 1.8,
                fontFamily: "var(--font-sans)",
                position: "relative",
                zIndex: 1,
              }}
            >
              We exist to bring the finest Indian handloom traditions to your
              doorstep — with the trust, transparency, and service of a
              premium boutique. Each thread is a testimony to centuries-old
              craftsmanship.
            </p>

            <div
              style={{
                fontSize: "0.75rem",
                fontStyle: "italic",
                color: "var(--color-brown-300)",
                marginTop: "1rem",
                position: "relative",
                zIndex: 1,
              }}
            >
              &ldquo;Preserving Indian Weaving Legacies.&rdquo;
            </div>
          </div>

          {/* Right Side: Luxury Curated Feature List */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div key={feature.title} className="why-shop-feature">
                  {/* Luxury Serial Number */}
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "var(--color-gold-600)",
                      minWidth: "2rem",
                      paddingTop: "0.25rem",
                    }}
                  >
                    {feature.num}
                  </span>

                  {/* Icon */}
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(212,175,55,0.06)",
                      border: "1px solid rgba(212,175,55,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-maroon)",
                      flexShrink: 0,
                    }}
                  >
                    <IconComponent size={20} strokeWidth={1.5} />
                  </div>

                  {/* Text Details */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontFamily: "var(--font-serif)",
                        color: "var(--color-maroon)",
                        fontWeight: 600,
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--color-brown-500)",
                        lineHeight: 1.7,
                        fontFamily: "var(--font-sans)",
                        margin: 0,
                      }}
                    >
                      {feature.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
