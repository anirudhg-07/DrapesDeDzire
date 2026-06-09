// src/app/loading.tsx — Homepage skeleton loader
// Shows while the homepage server components are loading
export default function HomeLoading() {
  return (
    <div style={{ backgroundColor: "var(--color-ivory)", minHeight: "100vh" }}>
      {/* Hero skeleton */}
      <div
        style={{
          minHeight: "85vh",
          background: "linear-gradient(135deg, #2A0810 0%, #4A0E17 100%)",
          display: "flex",
          alignItems: "center",
          padding: "2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Shimmer overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s linear infinite",
          }}
        />
        <div style={{ maxWidth: "680px", width: "100%" }}>
          {/* Tag pill skeleton */}
          <div
            style={{
              width: "160px",
              height: "28px",
              borderRadius: "2px",
              backgroundColor: "rgba(212,175,55,0.12)",
              marginBottom: "1.5rem",
              animation: "shimmer 2s linear infinite",
              backgroundSize: "200% 100%",
            }}
          />
          {/* Headline skeletons */}
          <div
            style={{
              height: "clamp(2.25rem, 6vw, 4.5rem)",
              width: "90%",
              borderRadius: "4px",
              backgroundColor: "rgba(255,255,255,0.08)",
              marginBottom: "0.75rem",
              animation: "shimmer 2s linear infinite",
              backgroundSize: "200% 100%",
            }}
          />
          <div
            style={{
              height: "clamp(2.25rem, 6vw, 4.5rem)",
              width: "65%",
              borderRadius: "4px",
              backgroundColor: "rgba(255,255,255,0.08)",
              marginBottom: "1.5rem",
              animation: "shimmer 2s linear infinite",
              backgroundSize: "200% 100%",
            }}
          />
          {/* Gold line */}
          <div
            style={{
              width: "3rem",
              height: "2px",
              backgroundColor: "rgba(212,175,55,0.3)",
              marginBottom: "1.5rem",
            }}
          />
          {/* Body text skeletons */}
          {[100, 90, 75].map((width, i) => (
            <div
              key={i}
              style={{
                height: "1rem",
                width: `${width}%`,
                borderRadius: "4px",
                backgroundColor: "rgba(255,255,255,0.06)",
                marginBottom: "0.625rem",
                animation: "shimmer 2s linear infinite",
                backgroundSize: "200% 100%",
              }}
            />
          ))}
          {/* CTA skeletons */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginTop: "2.5rem",
              flexWrap: "wrap",
            }}
          >
            {[180, 150].map((w, i) => (
              <div
                key={i}
                style={{
                  width: `${w}px`,
                  height: "52px",
                  borderRadius: "2px",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  animation: "shimmer 2s linear infinite",
                  backgroundSize: "200% 100%",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Collections grid skeleton */}
      <div
        style={{
          backgroundColor: "var(--color-cream)",
          padding: "var(--section-gap) 0",
        }}
      >
        <div className="section-container">
          {/* Title skeleton */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="skeleton" style={{ width: "120px", height: "12px", margin: "0 auto 0.75rem" }} />
            <div className="skeleton" style={{ width: "280px", height: "2.5rem", margin: "0 auto" }} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{
                  height: "200px",
                  borderRadius: "4px",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* New arrivals skeleton */}
      <div style={{ padding: "var(--section-gap) 0", backgroundColor: "var(--color-cream)" }}>
        <div className="section-container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "2.5rem",
            }}
          >
            <div>
              <div className="skeleton" style={{ width: "80px", height: "12px", marginBottom: "0.5rem" }} />
              <div className="skeleton" style={{ width: "200px", height: "2rem" }} />
            </div>
            <div className="skeleton" style={{ width: "100px", height: "40px", borderRadius: "2px" }} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "2px",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-luxury)",
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div className="skeleton" style={{ aspectRatio: "3/4" }} />
                <div
                  style={{
                    padding: "1rem 1.25rem 1.25rem",
                    backgroundColor: "var(--color-cream)",
                  }}
                >
                  <div className="skeleton" style={{ width: "80px", height: "10px", marginBottom: "0.5rem" }} />
                  <div className="skeleton" style={{ width: "90%", height: "1rem", marginBottom: "0.375rem" }} />
                  <div className="skeleton" style={{ width: "60%", height: "1rem", marginBottom: "0.75rem" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="skeleton" style={{ width: "80px", height: "1.25rem" }} />
                    <div className="skeleton" style={{ width: "60px", height: "32px", borderRadius: "2px" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
