"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  SignOutButton,
  Show,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  User,
  Package,
  LogOut,
  Sparkles,
  Flame,
  Tag,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/components/cart/CartContext";

const categories = [
  {
    title: "Sarees",
    links: [
      { name: "Kanchipuram Silk", href: "/collections/kanchipuram-silk" },
      { name: "Banarasi Silk", href: "/collections/banarasi-silk" },
      { name: "Chanderi", href: "/collections/chanderi" },
      { name: "Georgette", href: "/collections/georgette" },
      { name: "Bridal", href: "/collections/bridal" },
      { name: "Designer", href: "/collections/designer" },
    ],
  },
  {
    title: "Kurta Sets",
    links: [
      { name: "Anarkali", href: "/collections/anarkali" },
      { name: "Straight Cut", href: "/collections/straight-cut" },
      { name: "Sharara", href: "/collections/sharara" },
    ],
  },
  {
    title: "Jewellery",
    links: [
      { name: "Necklaces", href: "/collections/necklaces" },
      { name: "Bangles", href: "/collections/bangles" },
      { name: "Earrings", href: "/collections/earrings" },
    ],
  },
];

// Mobile drawer "Shop" accordions — each has an "All" link + sub-links + a parent page.
const SHOP_SECTIONS = [
  { title: "Sarees", parent: "/collections/sarees", allLabel: "All Sarees", links: categories[0].links },
  { title: "Kurta Sets", parent: "/collections/kurta-set", allLabel: "All Kurta Sets", links: categories[1].links },
  { title: "Jewellery", parent: "/collections/jewellery", allLabel: "All Jewellery", links: categories[2].links },
];

const FEATURED_LINKS = [
  { name: "New Arrivals", href: "/products?sort=newest", Icon: Sparkles },
  { name: "Best Sellers", href: "/products?sort=popular", Icon: Flame },
  { name: "Sale", href: "/products?sort=price-asc", Icon: Tag },
];

const SUPPORT_LINKS = [
  { name: "Track Order", href: "/orders" },
  { name: "Contact Us", href: "mailto:hello@drapesdedzire.in" },
  { name: "FAQs", href: "/faqs" },
];

// Drawer styles — reuse existing brand tokens (colors/typography unchanged)
const drawerDivider: React.CSSProperties = { borderTop: "1px solid var(--color-cream-200)" };
const drawerCategoryTitle: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--color-maroon)",
  fontFamily: "var(--font-sans)",
  letterSpacing: "0.02em",
};
const drawerSubLink: React.CSSProperties = {
  fontSize: "0.9rem",
  color: "var(--color-brown)",
  textDecoration: "none",
  fontFamily: "var(--font-sans)",
};
const drawerAccordionHeader: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};
const drawerAccountLink: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "0.9rem",
  color: "var(--color-brown)",
  textDecoration: "none",
  fontFamily: "var(--font-sans)",
};
const drawerIconCircle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  background: "var(--color-cream)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--color-maroon)",
  flexShrink: 0,
};
const drawerAccountName: React.CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "var(--color-maroon)",
  margin: 0,
  fontFamily: "var(--font-sans)",
};
const drawerPrimaryBtn: React.CSSProperties = {
  flex: 1,
  padding: "0.7rem",
  fontSize: "0.78rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--color-ivory)",
  backgroundColor: "var(--color-maroon)",
  border: "none",
  borderRadius: "2px",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
};
const drawerSecondaryBtn: React.CSSProperties = {
  flex: 1,
  padding: "0.7rem",
  fontSize: "0.78rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--color-maroon)",
  backgroundColor: "transparent",
  border: "1px solid var(--color-maroon)",
  borderRadius: "2px",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Mobile drawer: which Shop accordion is open (only one at a time)
  const [openShop, setOpenShop] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { itemCount, toggleCart } = useCart();
  const { isSignedIn, user } = useUser();

  const closeDrawer = () => {
    setMobileMenuOpen(false);
    setOpenShop(null);
  };

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenShop(null);
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
            {/* Left — Mobile hamburger (moved to the left) */}
            <div
              className="lg-hidden"
              style={{ display: "flex", alignItems: "center", flex: 1 }}
            >
              <button
                id="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Menu"
                className="w-9 h-9 flex items-center justify-center rounded-full border-none bg-transparent cursor-pointer text-[var(--color-maroon)]"
              >
                <Menu size={22} />
              </button>
            </div>

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
                    <div style={{ display: "flex", padding: "1rem" }}>
                      {categories.map((category) => (
                        <div key={category.title} style={{ minWidth: "160px" }}>
                          <p style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "var(--color-maroon)",
                            padding: "0.5rem 1rem",
                            margin: 0,
                          }}>
                            {category.title}
                          </p>
                          {category.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              style={{
                                display: "block",
                                padding: "0.5rem 1rem",
                                fontSize: "0.85rem",
                                color: "var(--color-brown)",
                                transition: "all 0.15s ease",
                                fontFamily: "var(--font-sans)",
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLElement).style.backgroundColor = "var(--color-cream)";
                                (e.target as HTMLElement).style.color = "var(--color-maroon)";
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLElement).style.backgroundColor = "transparent";
                                (e.target as HTMLElement).style.color = "var(--color-brown)";
                              }}
                            >
                              {link.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        borderTop: "1px solid var(--color-cream-200)",
                      }}
                    />
                    <Link
                      href="/collections"
                      style={{
                        display: "block",
                        padding: "0.875rem 1.25rem",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        textAlign: "center",
                        color: "var(--color-gold-600)",
                        fontFamily: "var(--font-sans)",
                        backgroundColor: "var(--color-ivory)",
                        borderBottomLeftRadius: "4px",
                        borderBottomRightRadius: "4px",
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
                className="h-10 lg:h-[60px] w-auto object-contain transition-all duration-300"
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
                className="w-8 h-8 lg:w-10 lg:h-10"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                className="w-8 h-8 lg:w-10 lg:h-10"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                className="w-8 h-8 lg:w-10 lg:h-10"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
              <div className="ml-1 lg:ml-2">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button
                      id="sign-in-btn"
                      style={{
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.75rem",
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
                        whiteSpace: "nowrap",
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
                  placeholder="Search sarees, kurta sets, jewellery…"
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

      </header>

      {/* ─── Mobile navigation drawer ─────────────────────────────── */}
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={closeDrawer}
        className="lg-hidden"
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(26,10,14,0.45)",
          zIndex: 60,
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Drawer panel */}
      <aside
        aria-label="Navigation menu"
        className="lg-hidden"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100dvh",
          width: "85vw",
          maxWidth: "380px",
          backgroundColor: "var(--color-ivory)",
          zIndex: 61,
          display: "flex",
          flexDirection: "column",
          transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: mobileMenuOpen ? "6px 0 32px rgba(74,14,23,0.18)" : "none",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1px solid var(--color-cream-200)",
            flexShrink: 0,
          }}
        >
          <img src="/logo.png" alt="Drapes De Dzire" style={{ height: 34, width: "auto", objectFit: "contain" }} />
          <button onClick={closeDrawer} aria-label="Close menu" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-maroon)", padding: 4 }}>
            <X size={22} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* ACCOUNT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {isSignedIn ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={drawerIconCircle}><User size={18} /></span>
                  <p style={drawerAccountName}>{user?.firstName ? `Hello, ${user.firstName}` : "My Account"}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingLeft: "2px" }}>
                  <Link href="/orders" onClick={closeDrawer} style={drawerAccountLink}><Package size={16} /> Orders</Link>
                  <Link href="/wishlist" onClick={closeDrawer} style={drawerAccountLink}><Heart size={16} /> Wishlist</Link>
                  <SignOutButton>
                    <button onClick={closeDrawer} style={{ ...drawerAccountLink, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
                      <LogOut size={16} /> Logout
                    </button>
                  </SignOutButton>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", gap: "10px" }}>
                  <SignInButton mode="modal">
                    <button onClick={closeDrawer} style={drawerPrimaryBtn}>Sign In</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button onClick={closeDrawer} style={drawerSecondaryBtn}>Create Account</button>
                  </SignUpButton>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <Link href="/wishlist" onClick={closeDrawer} style={drawerAccountLink}><Heart size={16} /> Wishlist</Link>
                  <Link href="/orders" onClick={closeDrawer} style={drawerAccountLink}><Package size={16} /> Orders</Link>
                </div>
              </>
            )}
          </div>

          <div style={drawerDivider} />

          {/* SHOP — accordions (one open at a time) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {SHOP_SECTIONS.map((section) => {
              const isOpen = openShop === section.title;
              return (
                <div key={section.title}>
                  <button
                    onClick={() => setOpenShop(isOpen ? null : section.title)}
                    aria-expanded={isOpen}
                    style={drawerAccordionHeader}
                  >
                    <span style={drawerCategoryTitle}>{section.title}</span>
                    <ChevronDown size={18} style={{ color: "var(--color-gold-600)", transition: "transform 0.22s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }} />
                  </button>
                  {/* Smooth height accordion via grid-template-rows */}
                  <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: "grid-template-rows 0.22s ease" }}>
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "14px 0 4px 12px" }}>
                        <Link href={section.parent} onClick={closeDrawer} style={drawerSubLink}>{section.allLabel}</Link>
                        {section.links.map((l) => (
                          <Link key={l.href} href={l.href} onClick={closeDrawer} style={drawerSubLink}>{l.name}</Link>
                        ))}
                        <Link href={section.parent} onClick={closeDrawer} style={{ ...drawerSubLink, color: "var(--color-gold-600)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                          View All <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={drawerDivider} />

          {/* FEATURED */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {FEATURED_LINKS.map(({ name, href, Icon }) => (
              <Link key={name} href={href} onClick={closeDrawer} style={{ ...drawerCategoryTitle, display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
                <Icon size={17} style={{ color: "var(--color-gold-600)" }} /> {name}
              </Link>
            ))}
          </div>

          <div style={drawerDivider} />

          {/* CUSTOMER SUPPORT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {SUPPORT_LINKS.map((l) => (
              <Link key={l.name} href={l.href} onClick={closeDrawer} style={drawerSubLink}>{l.name}</Link>
            ))}
          </div>
        </div>

        {/* BOTTOM — premium note */}
        <div style={{ borderTop: "1px solid var(--color-cream-200)", padding: "14px 20px", textAlign: "center", flexShrink: 0 }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-gold-600)", margin: 0, fontFamily: "var(--font-sans)" }}>
            ✦ Free Shipping on Orders Above ₹5,000 ✦
          </p>
        </div>
      </aside>

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
