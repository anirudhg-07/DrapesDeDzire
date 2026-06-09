"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";

const collections = [
  { name: "Kanchipuram Silk", href: "/collections/kanchipuram-silk" },
  { name: "Banarasi Silk", href: "/collections/banarasi-silk" },
  { name: "Chanderi", href: "/collections/chanderi" },
  { name: "Georgette", href: "/collections/georgette" },
  { name: "Bridal", href: "/collections/bridal" },
  { name: "Designer", href: "/collections/designer" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { itemCount, toggleCart } = useCart();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCollectionsOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Top announcement bar */}
      <div
        className="w-full py-2 text-center text-xs tracking-widest uppercase"
        style={{
          backgroundColor: "var(--color-maroon)",
          color: "var(--color-gold-400)",
          fontFamily: "var(--font-sans)",
        }}
      >
        ✦ Free shipping on orders above ₹5,000 &nbsp;·&nbsp; Pan India delivery ✦
      </div>

      {/* Main navbar */}
      <header
        id="main-navbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          transition: "all 0.3s ease",
          backgroundColor: isScrolled
            ? "rgba(252,251,247,0.92)"
            : "var(--color-ivory)",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          borderBottom: `1px solid ${isScrolled ? "var(--color-cream-200)" : "transparent"}`,
          boxShadow: isScrolled ? "0 2px 20px rgba(74,14,23,0.06)" : "none",
        }}
      >
        <div className="section-container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "72px",
              gap: "1rem",
            }}
          >
            {/* Left — Collections nav (desktop) */}
            <nav
              style={{
                display: "none",
                alignItems: "center",
                gap: "0.25rem",
                flex: "1",
              }}
              className="lg-flex"
            >
              <div style={{ position: "relative" }}>
                <button
                  id="collections-dropdown-btn"
                  onClick={() => setCollectionsOpen(!collectionsOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--color-brown)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                    fontFamily: "var(--font-sans)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color =
                      "var(--color-maroon)")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color =
                      "var(--color-brown)")
                  }
                >
                  Collections
                  <ChevronDown
                    size={14}
                    style={{
                      transition: "transform 0.2s",
                      transform: collectionsOpen
                        ? "rotate(180deg)"
                        : "rotate(0)",
                    }}
                  />
                </button>

                {collectionsOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "0.5rem",
                      backgroundColor: "var(--color-ivory)",
                      border: "1px solid var(--color-cream-200)",
                      borderRadius: "4px",
                      boxShadow: "var(--shadow-luxury-lg)",
                      minWidth: "220px",
                      padding: "0.5rem 0",
                      animation: "fade-in 0.15s ease",
                    }}
                  >
                    {collections.map((col) => (
                      <Link
                        key={col.href}
                        href={col.href}
                        style={{
                          display: "block",
                          padding: "0.625rem 1.25rem",
                          fontSize: "0.8125rem",
                          color: "var(--color-brown)",
                          transition: "all 0.15s ease",
                          fontFamily: "var(--font-sans)",
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.backgroundColor =
                            "var(--color-cream)";
                          (e.target as HTMLElement).style.color =
                            "var(--color-maroon)";
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.backgroundColor =
                            "transparent";
                          (e.target as HTMLElement).style.color =
                            "var(--color-brown)";
                        }}
                      >
                        {col.name}
                      </Link>
                    ))}
                    <div
                      style={{
                        borderTop: "1px solid var(--color-cream-200)",
                        margin: "0.5rem 0",
                      }}
                    />
                    <Link
                      href="/collections"
                      style={{
                        display: "block",
                        padding: "0.625rem 1.25rem",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "var(--color-gold-600)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      View All Collections →
                    </Link>
                  </div>
                )}
              </div>

              {[
                { name: "New Arrivals", href: "/products?sort=newest" },
                { name: "Bridal", href: "/collections/bridal" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color:
                      pathname === link.href
                        ? "var(--color-maroon)"
                        : "var(--color-brown)",
                    transition: "color 0.2s ease",
                    fontFamily: "var(--font-sans)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color =
                      "var(--color-maroon)")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color =
                      pathname === link.href
                        ? "var(--color-maroon)"
                        : "var(--color-brown)")
                  }
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Center — Logo */}
            <Link
              href="/"
              id="brand-logo"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textDecoration: "none",
                flex: "0 0 auto",
              }}
            >
              <img
                src="/logo.png"
                alt="Drapes De Dzire"
                width={80}
                height={80}
                style={{ objectFit: "contain" }}
              />
            </Link>

            {/* Right — Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                flex: "1",
                justifyContent: "flex-end",
              }}
            >
              {/* Search */}
              <button
                id="search-btn"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "var(--color-brown)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--color-cream)";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--color-maroon)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--color-brown)";
                }}
              >
                <Search size={18} />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                id="wishlist-btn"
                aria-label="Wishlist"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  color: "var(--color-brown)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--color-cream)";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--color-maroon)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--color-brown)";
                }}
              >
                <Heart size={18} />
              </Link>

              {/* Cart */}
              <button
                id="cart-btn"
                onClick={toggleCart}
                aria-label={`Cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "none",
                  background: "none",
                  color: "var(--color-brown)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--color-cream)";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--color-maroon)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--color-brown)";
                }}
              >
                <ShoppingBag size={18} />
                {itemCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      background: "var(--color-maroon)",
                      color: "#FCFBF7",
                      borderRadius: "50%",
                      width: "16px",
                      height: "16px",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                      pointerEvents: "none",
                    }}
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              {/* Auth */}
              <div style={{ marginLeft: "0.5rem" }}>
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button
                      id="sign-in-btn"
                      style={{
                        padding: "0.5rem 1.25rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--color-ivory)",
                        backgroundColor: "var(--color-maroon)",
                        border: "none",
                        borderRadius: "2px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontFamily: "var(--font-sans)",
                      }}
                      onMouseEnter={(e) =>
                        ((
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor = "var(--color-maroon-500)")
                      }
                      onMouseLeave={(e) =>
                        ((
                          e.currentTarget as HTMLElement
                        ).style.backgroundColor = "var(--color-maroon)")
                      }
                    >
                      Sign In
                    </button>
                  </SignInButton>
                </Show>
                <Show when="signed-in">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: { width: 36, height: 36 },
                      },
                    }}
                  />
                </Show>
              </div>

              {/* Mobile hamburger */}
              <button
                id="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
                className="lg-hidden"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "var(--color-maroon)",
                  marginLeft: "0.25rem",
                }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar dropdown */}
        {searchOpen && (
          <div
            style={{
              borderTop: "1px solid var(--color-cream-200)",
              backgroundColor: "var(--color-ivory)",
              padding: "1rem 0",
            }}
          >
            <div className="section-container">
              <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.75rem" }}>
                <input
                  ref={searchRef}
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sarees — Kanchipuram, Banarasi, Bridal…"
                  style={{
                    flex: 1,
                    padding: "0.75rem 1rem",
                    border: "1px solid var(--color-cream-200)",
                    borderRadius: "2px",
                    backgroundColor: "var(--color-cream)",
                    color: "var(--color-brown)",
                    fontSize: "0.9375rem",
                    fontFamily: "var(--font-sans)",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--color-gold)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--color-cream-200)")
                  }
                />
                <button type="submit" className="btn-maroon">
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            style={{
              borderTop: "1px solid var(--color-cream-200)",
              backgroundColor: "var(--color-ivory)",
              padding: "1rem 0 2rem",
            }}
          >
            <div className="section-container">
              <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <p
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-brown-500)",
                    padding: "0.5rem 0",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Collections
                </p>
                {collections.map((col) => (
                  <Link
                    key={col.href}
                    href={col.href}
                    style={{
                      padding: "0.625rem 0",
                      fontSize: "0.9375rem",
                      color: "var(--color-brown)",
                      borderBottom: "1px solid var(--color-cream-200)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {col.name}
                  </Link>
                ))}
                <Link
                  href="/products?sort=newest"
                  style={{
                    padding: "0.625rem 0",
                    fontSize: "0.9375rem",
                    color: "var(--color-brown)",
                    borderBottom: "1px solid var(--color-cream-200)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  New Arrivals
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Desktop nav media query workaround using style tag */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-flex { display: flex !important; }
          .lg-hidden { display: none !important; }
        }
        @media (max-width: 1023px) {
          .lg-flex { display: none !important; }
        }
      `}</style>

      {/* Backdrop for dropdowns */}
      {(collectionsOpen || searchOpen) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
          }}
          onClick={() => {
            setCollectionsOpen(false);
            setSearchOpen(false);
          }}
        />
      )}
    </>
  );
}
