// src/components/products/PLPClient.tsx
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Filter, SlidersHorizontal, X, Heart, PlusCircle, Pencil } from "lucide-react";
import { Product, Category } from "@/lib/catalog";
import { useAuth } from "@clerk/nextjs";
import { toggleWishlistAction, getWishlistAction } from "@/actions/wishlist";
import AddSareeDrawer from "@/components/admin/AddSareeDrawer";

interface PLPClientProps {
  initialProducts: Product[];
  categories: Category[];
  categoryTitle?: string;
  categoryDescription?: string;
  isAdmin?: boolean;
}

const FABRICS = ["Kanchipuram Silk", "Banarasi Silk", "Chanderi", "Georgette", "Organza"];
const COLOURS = ["Deep Crimson", "Royal Blue", "Forest Green", "Mustard Gold", "Peach Pink", "Ivory White", "Midnight Black"];
const OCCASIONS = ["Bridal", "Festive", "Designer", "Casual"];

export default function PLPClient({
  initialProducts,
  categories: _categories,
  categoryTitle = "Exquisite Collections",
  categoryDescription = "Browse through our curated showroom of handloom masterpieces, handwoven by India's finest master weavers.",
  isAdmin = false,
}: PLPClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse initial filters from URL
  const getSelectedFilters = (paramName: string): string[] => {
    const val = searchParams.get(paramName);
    return val ? val.split(",") : [];
  };

  const [selectedFabrics, setSelectedFabrics] = useState<string[]>(getSelectedFilters("fabric"));
  const [selectedColours, setSelectedColours] = useState<string[]>(getSelectedFilters("colour"));
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(getSelectedFilters("occasion"));
  const [priceMin, setPriceMin] = useState<number>(Number(searchParams.get("priceMin")) || 10000);
  const [priceMax, setPriceMax] = useState<number>(Number(searchParams.get("priceMax")) || 60000);
  const [sort, setSort] = useState<string>(searchParams.get("sort") || "newest");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { isSignedIn } = useAuth();
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      getWishlistAction().then((res) => {
        if (res.success && res.items) {
          setWishlistedIds(new Set(res.items.map((item) => item.productId)));
        }
      });
    } else {
      setWishlistedIds(new Set());
    }
  }, [isSignedIn]);

  const handleWishlistToggle = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (togglingId) return;
    setTogglingId(productId);
    try {
      const res = await toggleWishlistAction(productId);
      if (res.success) {
        setWishlistedIds((prev) => {
          const next = new Set(prev);
          if (res.action === "added") {
            next.add(productId);
          } else {
            next.delete(productId);
          }
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  // Sync state with URL change (e.g. back button)
  useEffect(() => {
    setSelectedFabrics(getSelectedFilters("fabric"));
    setSelectedColours(getSelectedFilters("colour"));
    setSelectedOccasions(getSelectedFilters("occasion"));
    setPriceMin(Number(searchParams.get("priceMin")) || 10000);
    setPriceMax(Number(searchParams.get("priceMax")) || 60000);
    setSort(searchParams.get("sort") || "newest");
  }, [searchParams]);

  // Apply filters by pushing to URL router
  const applyFilters = (
    fabrics: string[],
    colours: string[],
    occasions: string[],
    minP: number,
    maxP: number,
    sortBy: string
  ) => {
    const params = new URLSearchParams();
    
    if (fabrics.length > 0) params.set("fabric", fabrics.join(","));
    if (colours.length > 0) params.set("colour", colours.join(","));
    if (occasions.length > 0) params.set("occasion", occasions.join(","));
    if (minP > 10000) params.set("priceMin", minP.toString());
    if (maxP < 60000) params.set("priceMax", maxP.toString());
    if (sortBy !== "newest") params.set("sort", sortBy);
    
    // Carry over search query if present
    const currentSearch = searchParams.get("search");
    if (currentSearch) params.set("search", currentSearch);

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleFilter = (list: string[], setList: (val: string[]) => void, item: string, paramName: string) => {
    const updated = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
    setList(updated);
    
    // Apply changes immediately
    if (paramName === "fabric") applyFilters(updated, selectedColours, selectedOccasions, priceMin, priceMax, sort);
    if (paramName === "colour") applyFilters(selectedFabrics, updated, selectedOccasions, priceMin, priceMax, sort);
    if (paramName === "occasion") applyFilters(selectedFabrics, selectedColours, updated, priceMin, priceMax, sort);
  };

  const clearAllFilters = () => {
    setSelectedFabrics([]);
    setSelectedColours([]);
    setSelectedOccasions([]);
    setPriceMin(10000);
    setPriceMax(60000);
    router.push(pathname, { scroll: false });
  };

  return (
    <div style={{ backgroundColor: "var(--color-ivory)", minHeight: "90vh", padding: "2rem 0 4rem" }}>
      <div className="section-container">
        {/* Editorial Page Header */}
        <div style={{ marginBottom: "3rem", borderBottom: "1px solid var(--color-cream-200)", paddingBottom: "2rem" }}>
          <span style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-gold-600)",
            fontFamily: "var(--font-sans)",
            display: "block",
            marginBottom: "0.5rem"
          }}>
            Drapes De Dzire Showroom
          </span>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontFamily: "var(--font-serif)",
            color: "var(--color-maroon)",
            fontWeight: 600,
            lineHeight: 1.15,
            marginBottom: "1rem"
          }}>
            {categoryTitle}
          </h1>
          <p style={{
            fontSize: "1.0625rem",
            color: "var(--color-brown-500)",
            lineHeight: 1.7,
            maxWidth: "700px",
            fontFamily: "var(--font-sans)"
          }}>
            {categoryDescription}
          </p>
        </div>

        {/* Action Bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          gap: "1rem"
        }}>
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg-hidden"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1rem",
              border: "1px solid var(--color-cream-200)",
              backgroundColor: "var(--color-cream)",
              color: "var(--color-brown)",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              borderRadius: "2px",
              fontFamily: "var(--font-sans)"
            }}
          >
            <Filter size={16} />
            Filters
          </button>

          <div style={{ display: "none" }} className="lg-flex">
            <span style={{ fontSize: "0.875rem", color: "var(--color-brown-500)", fontFamily: "var(--font-sans)" }}>
              Showing {initialProducts.length} exquisite sarees
            </span>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <label htmlFor="sort-dropdown" style={{
              fontSize: "0.8125rem",
              color: "var(--color-brown-500)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
              fontFamily: "var(--font-sans)"
            }}>
              Sort By:
            </label>
            <select
              id="sort-dropdown"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                applyFilters(selectedFabrics, selectedColours, selectedOccasions, priceMin, priceMax, e.target.value);
              }}
              style={{
                padding: "0.5rem 2rem 0.5rem 1rem",
                border: "1px solid var(--color-cream-200)",
                backgroundColor: "var(--color-cream)",
                color: "var(--color-brown)",
                fontSize: "0.875rem",
                borderRadius: "2px",
                fontFamily: "var(--font-sans)",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Popularity</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        <div style={{ display: "flex", gap: "2.5rem" }}>
          {/* Desktop Filter Sidebar */}
          <aside style={{
            width: "260px",
            flexShrink: 0,
            display: "none"
          }} className="lg-flex flex-col gap-6">
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--color-cream-200)",
              paddingBottom: "1rem"
            }}>
              <h3 style={{
                fontSize: "0.9375rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--color-maroon)",
                fontFamily: "var(--font-sans)"
              }}>
                Filters
              </h3>
              {(selectedFabrics.length > 0 || selectedColours.length > 0 || selectedOccasions.length > 0 || priceMin > 10000 || priceMax < 60000) && (
                <button
                  onClick={clearAllFilters}
                  style={{
                    border: "none",
                    background: "none",
                    color: "var(--color-gold-600)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)"
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Fabric Filter */}
            <div style={{ borderBottom: "1px solid var(--color-cream-100)", paddingBottom: "1.25rem" }}>
              <h4 style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-brown)",
                marginBottom: "0.75rem",
                fontFamily: "var(--font-sans)"
              }}>
                Fabric
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {FABRICS.map((fabric) => (
                  <label key={fabric} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer", color: "var(--color-brown-500)", fontFamily: "var(--font-sans)" }}>
                    <input
                      type="checkbox"
                      checked={selectedFabrics.includes(fabric)}
                      onChange={() => toggleFilter(selectedFabrics, setSelectedFabrics, fabric, "fabric")}
                      style={{ accentColor: "var(--color-maroon)" }}
                    />
                    {fabric}
                  </label>
                ))}
              </div>
            </div>

            {/* Colour Filter */}
            <div style={{ borderBottom: "1px solid var(--color-cream-100)", paddingBottom: "1.25rem" }}>
              <h4 style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-brown)",
                marginBottom: "0.75rem",
                fontFamily: "var(--font-sans)"
              }}>
                Colour
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {COLOURS.map((colour) => (
                  <label key={colour} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer", color: "var(--color-brown-500)", fontFamily: "var(--font-sans)" }}>
                    <input
                      type="checkbox"
                      checked={selectedColours.includes(colour)}
                      onChange={() => toggleFilter(selectedColours, setSelectedColours, colour, "colour")}
                      style={{ accentColor: "var(--color-maroon)" }}
                    />
                    {colour}
                  </label>
                ))}
              </div>
            </div>

            {/* Occasion Filter */}
            <div style={{ borderBottom: "1px solid var(--color-cream-100)", paddingBottom: "1.25rem" }}>
              <h4 style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-brown)",
                marginBottom: "0.75rem",
                fontFamily: "var(--font-sans)"
              }}>
                Occasion
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {OCCASIONS.map((occ) => (
                  <label key={occ} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer", color: "var(--color-brown-500)", fontFamily: "var(--font-sans)" }}>
                    <input
                      type="checkbox"
                      checked={selectedOccasions.includes(occ)}
                      onChange={() => toggleFilter(selectedOccasions, setSelectedOccasions, occ, "occasion")}
                      style={{ accentColor: "var(--color-maroon)" }}
                    />
                    {occ}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h4 style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-brown)",
                marginBottom: "0.75rem",
                fontFamily: "var(--font-sans)"
              }}>
                Price Range
              </h4>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.6875rem", textTransform: "uppercase", color: "var(--color-brown-300)" }}>Min (₹)</label>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(Number(e.target.value))}
                    onBlur={() => applyFilters(selectedFabrics, selectedColours, selectedOccasions, priceMin, priceMax, sort)}
                    style={{
                      width: "100%",
                      padding: "0.375rem 0.5rem",
                      border: "1px solid var(--color-cream-200)",
                      backgroundColor: "var(--color-cream)",
                      color: "var(--color-brown)",
                      fontSize: "0.8125rem"
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.6875rem", textTransform: "uppercase", color: "var(--color-brown-300)" }}>Max (₹)</label>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    onBlur={() => applyFilters(selectedFabrics, selectedColours, selectedOccasions, priceMin, priceMax, sort)}
                    style={{
                      width: "100%",
                      padding: "0.375rem 0.5rem",
                      border: "1px solid var(--color-cream-200)",
                      backgroundColor: "var(--color-cream)",
                      color: "var(--color-brown)",
                      fontSize: "0.8125rem"
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => applyFilters(selectedFabrics, selectedColours, selectedOccasions, priceMin, priceMax, sort)}
                className="btn-maroon"
                style={{ width: "100%", padding: "0.5rem 0", fontSize: "0.75rem" }}
              >
                Apply Range
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <div style={{ flex: 1 }}>
            {initialProducts.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "5rem 2rem",
                backgroundColor: "var(--color-cream)",
                border: "1px dashed var(--color-cream-200)",
                borderRadius: "4px"
              }}>
                <SlidersHorizontal size={40} style={{ color: "var(--color-gold)", marginBottom: "1rem" }} />
                <h3 style={{ fontSize: "1.25rem", fontFamily: "var(--font-serif)", color: "var(--color-maroon)", marginBottom: "0.5rem" }}>
                  No Sarees Match Your Selection
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--color-brown-500)", marginBottom: "1.5rem" }}>
                  Try adjusting your filters or resetting them to view our full collection.
                </p>
                <button onClick={clearAllFilters} className="btn-maroon" style={{ padding: "0.625rem 1.5rem" }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "2rem"
              }}>
                {/* Admin: Add New Saree card */}
                {isAdmin && (
                  <div
                    onClick={() => setAddDrawerOpen(true)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "var(--color-cream)",
                      border: "2px dashed rgba(212,175,55,0.5)",
                      borderRadius: "2px",
                      aspectRatio: "3/4",
                      cursor: "pointer",
                      gap: "0.75rem",
                      transition: "all 0.25s ease",
                      color: "#9a7a50",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#D4AF37";
                      e.currentTarget.style.background = "rgba(212,175,55,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)";
                      e.currentTarget.style.background = "var(--color-cream)";
                    }}
                  >
                    <PlusCircle size={40} style={{ color: "#D4AF37" }} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      Add New Saree
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#b0a090" }}>Click to open upload form</span>
                  </div>
                )}
                {initialProducts.map((product) => {
                  const primaryImg = product.images.find(img => img.isPrimary) || product.images[0];
                  
                  return (
                    <div
                      key={product.id}
                      className="group"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "var(--color-cream)",
                        borderRadius: "2px",
                        overflow: "hidden",
                        boxShadow: "var(--shadow-luxury)",
                        border: "1px solid var(--color-cream-100)",
                        transition: "all 0.4s ease"
                      }}
                    >
                      {/* Image Frame */}
                      <div style={{ display: "block", position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
                        <Link href={`/products/${product.id}`} style={{ display: "block", position: "relative", width: "100%", height: "100%" }}>
                          <Image
                            src={primaryImg?.imageUrl || "/logo.png"}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            style={{
                              objectFit: "cover",
                              transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                            }}
                            className="hover-scale-img"
                          />
                          {/* Out Of Stock overlay */}
                          {product.stock === 0 && (
                            <div style={{
                              position: "absolute",
                              inset: 0,
                              backgroundColor: "rgba(61,35,20,0.6)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--color-ivory)",
                              fontFamily: "var(--font-serif)",
                              fontSize: "1.125rem",
                              letterSpacing: "0.05em",
                              backdropFilter: "blur(2px)"
                            }}>
                              Out of Stock
                            </div>
                          )}
                        </Link>
                        {/* Fabric Badge */}
                        <div style={{
                          position: "absolute",
                          top: "0.75rem",
                          left: "0.75rem",
                          backgroundColor: "rgba(74,14,23,0.85)",
                          color: "var(--color-gold-400)",
                          padding: "0.25rem 0.625rem",
                          fontSize: "0.625rem",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          borderRadius: "1px",
                          zIndex: 5
                        }}>
                          {product.fabric}
                        </div>
                      {/* Wishlist Heart Icon */}
                        <button
                          onClick={(e) => handleWishlistToggle(e, product.id)}
                          disabled={togglingId === product.id}
                          style={{
                            position: "absolute",
                            top: "0.75rem",
                            right: "0.75rem",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(4px)",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            zIndex: 10,
                            color: wishlistedIds.has(product.id) ? "var(--color-maroon)" : "var(--color-brown-300)",
                            boxShadow: "0 2px 8px rgba(74,14,23,0.1)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.08)";
                            e.currentTarget.style.backgroundColor = "#ffffff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
                          }}
                        >
                          <Heart
                            size={18}
                            fill={wishlistedIds.has(product.id) ? "var(--color-maroon)" : "none"}
                          />
                        </button>
                        {/* Admin Edit Button */}
                        {isAdmin && (
                          <Link
                            href={`/products/${product.id}?adminEdit=1`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: "absolute",
                              bottom: "0.75rem",
                              right: "0.75rem",
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(212,175,55,0.92)",
                              border: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              zIndex: 10,
                              color: "#1a0a0e",
                              boxShadow: "0 2px 8px rgba(74,14,23,0.2)",
                              textDecoration: "none",
                            }}
                            title="Edit this saree"
                          >
                            <Pencil size={15} />
                          </Link>
                        )}
                      </div>

                      {/* Detail Frame */}
                      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                        <span style={{
                          fontSize: "0.6875rem",
                          color: "var(--color-gold-600)",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "0.375rem"
                        }}>
                          {product.colour.includes(":") ? product.colour.split(":")[1] : product.colour} &middot; {product.occasion}
                        </span>
                        
                        <Link href={`/products/${product.id}`} style={{ textDecoration: "none" }}>
                          <h3 style={{
                            fontFamily: "var(--font-serif)",
                            fontSize: "1.0625rem",
                            fontWeight: 600,
                            color: "var(--color-maroon)",
                            lineHeight: 1.3,
                            marginBottom: "0.5rem"
                          }}>
                            {product.name}
                          </h3>
                        </Link>
                        
                        <p style={{
                          fontSize: "0.75rem",
                          color: "var(--color-brown-300)",
                          lineHeight: 1.5,
                          marginBottom: "1rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          height: "2.25rem"
                        }}>
                          {product.description}
                        </p>

                        <div style={{
                          marginTop: "auto",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderTop: "1px solid var(--color-cream-200)",
                          paddingTop: "0.875rem"
                        }}>
                          <span style={{
                            fontSize: "1.125rem",
                            fontWeight: 700,
                            color: "var(--color-brown)",
                            fontFamily: "var(--font-sans)"
                          }}>
                            ₹{product.basePrice.toLocaleString("en-IN")}
                          </span>

                          <Link
                            href={`/products/${product.id}`}
                            className="btn-gold"
                            style={{
                              padding: "0.5rem 0.875rem",
                              fontSize: "0.75rem",
                              letterSpacing: "0.04em",
                              textDecoration: "none",
                              display: "inline-block",
                              borderRadius: "1px"
                            }}
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Modal Drawer */}
      {sidebarOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 100,
          animation: "fade-in 0.2s ease"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: "300px",
            backgroundColor: "var(--color-ivory)",
            boxShadow: "var(--shadow-luxury-lg)",
            padding: "2rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-cream-200)", paddingBottom: "1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-maroon)" }}>Filters</h3>
              <button onClick={() => setSidebarOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--color-brown)" }}>
                <X size={20} />
              </button>
            </div>

            {/* Fabric */}
            <div>
              <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-brown)", marginBottom: "0.5rem" }}>Fabric</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {FABRICS.map((fabric) => (
                  <label key={fabric} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--color-brown-500)" }}>
                    <input
                      type="checkbox"
                      checked={selectedFabrics.includes(fabric)}
                      onChange={() => toggleFilter(selectedFabrics, setSelectedFabrics, fabric, "fabric")}
                      style={{ accentColor: "var(--color-maroon)" }}
                    />
                    {fabric}
                  </label>
                ))}
              </div>
            </div>

            {/* Colour */}
            <div>
              <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-brown)", marginBottom: "0.5rem" }}>Colour</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {COLOURS.map((colour) => (
                  <label key={colour} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--color-brown-500)" }}>
                    <input
                      type="checkbox"
                      checked={selectedColours.includes(colour)}
                      onChange={() => toggleFilter(selectedColours, setSelectedColours, colour, "colour")}
                      style={{ accentColor: "var(--color-maroon)" }}
                    />
                    {colour}
                  </label>
                ))}
              </div>
            </div>

            {/* Occasion */}
            <div>
              <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-brown)", marginBottom: "0.5rem" }}>Occasion</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {OCCASIONS.map((occ) => (
                  <label key={occ} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--color-brown-500)" }}>
                    <input
                      type="checkbox"
                      checked={selectedOccasions.includes(occ)}
                      onChange={() => toggleFilter(selectedOccasions, setSelectedOccasions, occ, "occasion")}
                      style={{ accentColor: "var(--color-maroon)" }}
                    />
                    {occ}
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-brown)", marginBottom: "0.5rem" }}>Price Range</h4>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  style={{ width: "100%", padding: "0.375rem 0.5rem", border: "1px solid var(--color-cream-200)", backgroundColor: "var(--color-cream)", color: "var(--color-brown)", fontSize: "0.8125rem" }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  style={{ width: "100%", padding: "0.375rem 0.5rem", border: "1px solid var(--color-cream-200)", backgroundColor: "var(--color-cream)", color: "var(--color-brown)", fontSize: "0.8125rem" }}
                />
              </div>
              <button
                onClick={() => {
                  applyFilters(selectedFabrics, selectedColours, selectedOccasions, priceMin, priceMax, sort);
                  setSidebarOpen(false);
                }}
                className="btn-maroon"
                style={{ width: "100%", padding: "0.625rem 0" }}
              >
                Apply Range
              </button>
            </div>
            
            <button
              onClick={() => {
                clearAllFilters();
                setSidebarOpen(false);
              }}
              style={{
                border: "1px solid var(--color-cream-200)",
                backgroundColor: "transparent",
                color: "var(--color-brown)",
                padding: "0.625rem 0",
                fontSize: "0.875rem",
                fontWeight: 600,
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                borderRadius: "2px"
              }}
            >
              Reset All
            </button>
          </div>
        </div>
      )}

      {/* Admin: Add Saree Drawer */}
      {isAdmin && (
        <AddSareeDrawer
          isOpen={addDrawerOpen}
          onClose={() => setAddDrawerOpen(false)}
          onCreated={() => router.refresh()}
        />
      )}

      {/* Group Hover Scale Styling helper */}
      <style>{`
        .hover-scale-img:hover {
          transform: scale(1.05) !important;
        }
      `}</style>
    </div>
  );
}
