// src/app/collections/loading.tsx
// Specific skeleton loader matching the PLP layout structure (Sidebar filters + 6 product cards)

export default function CollectionsLoading() {
  return (
    <div style={{ backgroundColor: "var(--color-ivory)", minHeight: "90vh", padding: "2.5rem 0 4rem" }}>
      <div className="section-container">
        {/* Header Shimmer */}
        <div style={{ marginBottom: "3rem", borderBottom: "1px solid var(--color-cream-200)", paddingBottom: "2rem" }}>
          <div className="skeleton" style={{ width: "140px", height: "12px", marginBottom: "0.75rem" }} />
          <div className="skeleton" style={{ width: "320px", height: "2.5rem", marginBottom: "1rem" }} />
          <div className="skeleton" style={{ width: "60%", height: "1.25rem" }} />
        </div>

        {/* Action Bar Shimmer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div className="skeleton" style={{ width: "180px", height: "16px" }} />
          <div className="skeleton" style={{ width: "150px", height: "36px", borderRadius: "2px" }} />
        </div>

        {/* Content Layout Shimmer */}
        <div style={{ display: "flex", gap: "2.5rem" }}>
          {/* Sidebar Shimmer */}
          <aside style={{ width: "260px", flexShrink: 0, display: "none" }} className="lg-flex flex-col gap-6">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-cream-200)", paddingBottom: "1rem" }}>
              <div className="skeleton" style={{ width: "80px", height: "16px" }} />
            </div>
            
            {/* Filter Section 1 */}
            <div style={{ borderBottom: "1px solid var(--color-cream-100)", paddingBottom: "1.25rem" }}>
              <div className="skeleton" style={{ width: "60px", height: "14px", marginBottom: "0.75rem" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {[80, 110, 95, 70].map((w, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div className="skeleton" style={{ width: "14px", height: "14px", borderRadius: "2px" }} />
                    <div className="skeleton" style={{ width: `${w}px`, height: "12px" }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Section 2 */}
            <div style={{ borderBottom: "1px solid var(--color-cream-100)", paddingBottom: "1.25rem" }}>
              <div className="skeleton" style={{ width: "50px", height: "14px", marginBottom: "0.75rem" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {[90, 75, 100].map((w, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div className="skeleton" style={{ width: "14px", height: "14px", borderRadius: "2px" }} />
                    <div className="skeleton" style={{ width: `${w}px`, height: "12px" }} />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Saree Grid Shimmer */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "2rem"
            }}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "var(--color-cream)",
                    borderRadius: "2px",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-luxury)",
                    border: "1px solid var(--color-cream-100)"
                  }}
                >
                  <div className="skeleton" style={{ aspectRatio: "3/4" }} />
                  <div style={{ padding: "1.25rem" }}>
                    <div className="skeleton" style={{ width: "100px", height: "10px", marginBottom: "0.5rem" }} />
                    <div className="skeleton" style={{ width: "90%", height: "14px", marginBottom: "0.5rem" }} />
                    <div className="skeleton" style={{ width: "70%", height: "10px", marginBottom: "1.25rem" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.875rem", borderTop: "1px solid var(--color-cream-200)" }}>
                      <div className="skeleton" style={{ width: "80px", height: "20px" }} />
                      <div className="skeleton" style={{ width: "90px", height: "32px", borderRadius: "1px" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
