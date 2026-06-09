import { Playfair_Display, Inter, Cinzel } from "next/font/google";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Drapes De Dzire — Premium Sarees Online | Authentic Indian Silk",
    template: "%s | Drapes De Dzire",
  },
  description:
    "Shop premium handwoven sarees from master artisans of India. Kanchipuram Silk, Banarasi Silk, Bridal & Designer sarees. Authentic, certified, Pan-India shipping.",
  keywords: [
    "premium sarees online",
    "Kanchipuram silk saree",
    "Banarasi silk saree",
    "bridal sarees India",
    "buy sarees online",
    "handwoven sarees",
    "Drapes De Dzire",
    "silk sarees",
    "designer sarees",
  ],
  authors: [{ name: "Drapes De Dzire" }],
  creator: "Drapes De Dzire",
  publisher: "Drapes De Dzire",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://drapesdedzire.in"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://drapesdedzire.in",
    siteName: "Drapes De Dzire",
    title: "Drapes De Dzire — Premium Sarees Online",
    description:
      "Heritage in every thread. Shop authentic, handwoven Indian silk sarees with Pan-India delivery.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Drapes De Dzire — Premium Indian Sarees",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drapes De Dzire — Premium Sarees Online",
    description: "Heritage in every thread. Authentic handwoven Indian silks.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${playfair.variable} ${inter.variable} ${cinzel.variable}`}
      >
        <body
          style={{
            backgroundColor: "var(--color-ivory)",
            color: "var(--color-brown)",
            fontFamily: "var(--font-sans)",
          }}
        >
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main style={{ minHeight: "60vh" }}>{children}</main>
            <Footer />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
