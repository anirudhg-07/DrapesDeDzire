import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Drapes De Dzire",
  description: "Sign in to your Drapes De Dzire account to shop premium handwoven sarees.",
};

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: "var(--color-ivory)",
        padding: "2.5rem 1rem 4rem",
        backgroundImage:
          "radial-gradient(ellipse at 70% 20%, rgba(212,175,55,0.06) 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(74,14,23,0.05) 0%, transparent 50%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "480px" }}>
        {/* Brand header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-gold-600)",
              fontFamily: "var(--font-sans)",
              marginBottom: "0.5rem",
            }}
          >
            Welcome Back
          </p>
          <h1
            style={{
              fontSize: "1.875rem",
              fontFamily: "var(--font-serif)",
              color: "var(--color-maroon)",
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            Drapes De Dzire
          </h1>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "var(--color-brown-500)",
              marginTop: "0.5rem",
              fontFamily: "var(--font-sans)",
            }}
          >
            Sign in to explore premium handwoven sarees
          </p>
        </div>

        {/* Clerk SignIn component */}
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: { width: "100%" },
              card: {
                boxShadow: "0 8px 48px rgba(74,14,23,0.10), 0 2px 8px rgba(74,14,23,0.06)",
                border: "1px solid var(--color-cream-200)",
                borderRadius: "4px",
                backgroundColor: "white",
              },
              headerTitle: { display: "none" },
              headerSubtitle: { display: "none" },
              socialButtonsBlockButton: {
                border: "1px solid var(--color-cream-200)",
                borderRadius: "2px",
                backgroundColor: "white",
                color: "var(--color-brown)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9375rem",
                fontWeight: 500,
              },
              formButtonPrimary: {
                backgroundColor: "var(--color-maroon)",
                borderRadius: "2px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              },
              footerActionLink: {
                color: "var(--color-maroon)",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
