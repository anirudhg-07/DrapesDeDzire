// src/app/products/[id]/loading.tsx
// Specific skeleton loader matching the PDP layout structure (Image Gallery + Details column)

export default function ProductDetailsLoading() {
  return (
    <div style={{ backgroundColor: "var(--color-ivory)", minHeight: "100vh", padding: "3.5rem 0 5rem" }}>
      <div className="section-container">
        {/* Breadcrumb Shimmer */}
        <div style={{ marginBottom: "2rem", display: "flex", gap: "0.5rem" }}>
          <div className="skeleton" style={{ width: "60px", height: "12px" }} />
          <div className="skeleton" style={{ width: "8px", height: "12px" }} />
          <div className="skeleton" style={{ width: "90px", height: "12px" }} />
          <div className="skeleton" style={{ width: "8px", height: "12px" }} />
          <div className="skeleton" style={{ width: "120px", height: "12px" }} />
        </div>

        {/* Core details split layout */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", marginBottom: "5rem" }}>
          {/* Left: Gallery Column Shimmer */}
          <div style={{ flex: "1 1 500px", display: "flex", gap: "1rem" }}>
            {/* Thumbnails list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "80px", flexShrink: 0 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{
                    width: "80px",
                    aspectRatio: "3/4",
                    borderRadius: "2px",
                    border: "1px solid var(--color-cream-200)"
                  }}
                />
              ))}
            </div>

            {/* Primary Image Shimmer */}
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ aspectRatio: "3/4", borderRadius: "4px" }} />
            </div>
          </div>

          {/* Right: Info Column Shimmer */}
          <div style={{ flex: "1 1 450px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <div className="skeleton" style={{ width: "120px", height: "12px", marginBottom: "0.5rem" }} />
              <div className="skeleton" style={{ width: "80%", height: "2.5rem", marginBottom: "0.75rem" }} />
              <div className="skeleton" style={{ width: "150px", height: "12px" }} />
            </div>

            {/* Pricing Box Shimmer */}
            <div style={{
              backgroundColor: "var(--color-cream)",
              border: "1px solid var(--color-cream-200)",
              padding: "1.25rem 1.75rem",
              borderRadius: "4px"
            }}>
              <div className="skeleton" style={{ width: "160px", height: "2rem" }} />
            </div>

            {/* Description lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <div className="skeleton" style={{ width: "100%", height: "14px" }} />
              <div className="skeleton" style={{ width: "95%", height: "14px" }} />
              <div className="skeleton" style={{ width: "85%", height: "14px" }} />
              <div className="skeleton" style={{ width: "50%", height: "14px" }} />
            </div>


            {/* CTA Shimmers */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <div className="skeleton" style={{ flex: 1, height: "54px", borderRadius: "2px" }} />
              <div className="skeleton" style={{ flex: 1, height: "54px", borderRadius: "2px" }} />
              <div className="skeleton" style={{ width: "54px", height: "54px", borderRadius: "2px" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
