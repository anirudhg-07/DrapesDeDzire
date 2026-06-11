# 🪡 Drapes De Dzire

> *A luxury saree e-commerce platform — where tradition meets modern elegance.*

Drapes De Dzire is an enterprise-grade, premium saree shopping platform built to replicate the sensory experience of walking into a high-end boutique showroom. Designed for the discerning Indian fashion buyer, it fuses deep cultural heritage with modern web performance and a seamless transactional flow.

---

## ✨ Features

### For Shoppers (Unauthenticated)
- **Boutique Homepage** — Hero banners, curated collections, and new arrivals with editorial-grade imagery
- **Product Browsing** — Filter and sort through 50+ premium sarees by category, colour, fabric, or occasion
- **Product Detail Pages** — High-resolution images with a zoom lens to inspect weave details up close
- **Smart Search** — Find sarees instantly by keyword, fabric type, or occasion

### For Customers (Authenticated)
- **Wishlist** — Save sarees to a personal wishlist, synced to your account in real time
- **Cart Drawer** — Slide-in cart panel with live quantity controls and subtotal recalculation
- **3-Step Checkout** — Shipping address validation → Order review with GST calculation → Razorpay payment
- **Order Tracking** — Visual timeline from placement through delivery
- **Verified Reviews** — Leave ratings and reviews only on sarees you have purchased

### For Admins (Whitelisted Account)
- **Dashboard** — High-level metrics: total orders, revenue, and recent activity
- **Product Management** — Full CRUD for sarees, categories, and Cloudinary image uploads
- **Banner Management** — Control homepage hero and promotional banners
- **Order Fulfilment** — Update order states (Processing → Shipped → Delivered / Cancelled)
- **Customer Directory** — View registered users and their order histories
- **Review Moderation** — Approve or remove customer-submitted reviews

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Authentication | Clerk (Google OAuth 2.0) |
| Database | Neon Serverless PostgreSQL |
| ORM | Prisma (`@prisma/adapter-neon`) |
| Payments | Razorpay (Hosted Checkout + Webhooks) |
| Image Hosting | Cloudinary |
| Email | Resend (optional) |

---

## 🗂 Project Structure

```
DrapesDeDzire/
├── web/                    # Next.js application source
├── public/                 # Static assets (logo, images)
├── docs/                   # Engineering documentation
│   ├── architecture.md     # System design & data flow diagrams
│   ├── wireframes.md       # Page wireframes & UI theme guide
│   ├── schema.prisma       # Prisma PostgreSQL schema
│   ├── api_specification.md
│   ├── security_plan.md
│   └── testing_and_deployment.md
├── PRD.md                  # Product Requirements Document
└── PROJECT_STATUS.md       # Current build status & env guide
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech/) PostgreSQL database
- A [Clerk](https://clerk.com/) application with Google login enabled
- A [Razorpay](https://razorpay.com/) account (use Test Mode for local dev)
- A [Cloudinary](https://cloudinary.com/) account (required for admin image uploads)

### Installation

```bash
# Clone the repository
git clone https://github.com/anirudhg-07/DrapesDeDzire.git
cd DrapesDeDzire/web

# Install dependencies
npm install

# Set up your environment variables (see below)
cp .env.example .env

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** On first boot, if the database is empty, the system will automatically seed 7 categories and 50 sarees within ~1.5 seconds.

---

## ⚙️ Environment Variables

Create a `.env` file inside the `web/` directory with the following keys:

```env
# Database
DATABASE_URL=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Razorpay Payments
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Cloudinary (required for Admin mode)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Admin Access
ADMIN_WHITELIST_EMAIL=admin@yourdomain.com

# Resend Email (optional)
RESEND_API_KEY=
```

Refer to [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) for step-by-step instructions on obtaining each credential from Clerk, Razorpay, and Cloudinary.

---

## 🧪 Testing the Full Flow

Once running locally, you can verify the complete transactional loop:

```
[Sign In with Google]
        ↓
[Browse Collections → Add to Wishlist]
        ↓
[Add to Cart → Adjust Quantity]
        ↓
[Checkout: Address → Review → Razorpay Payment Modal]
        ↓
[Confetti Success Screen + Order ID (e.g. DRP-20260611-XXXX)]
```

For sandbox payments, select **Netbanking** or **UPI** in the Razorpay modal and click **Success** to simulate a completed transaction.

---

## 🔐 Security Highlights

- Payments are processed entirely via Razorpay's hosted checkout — no card data ever touches the application server
- Every payment is server-verified using Razorpay's SHA-256 HMAC signature before an order is marked `PAID`
- Stock deductions and order records are written atomically via Prisma database transactions
- Admin routes (`/admin/*`) are protected by Next.js middleware checking both Clerk authentication and a whitelisted email

---

## 🗺 Roadmap

- [x] **Phase 1–3** — Authentication, product catalog, wishlist, cart, 3-step checkout, Razorpay integration, payment verification
- [ ] **Phase 4** — Customer profile dashboard, saved addresses, and order tracking timeline
- [ ] **Phase 5** — Inline admin dashboard with live product/stock editing and Cloudinary upload portal
- [ ] **Phase 6** — E2E testing (Playwright), Core Web Vitals audit, SEO, and production deployment

---

## 🎨 Brand Identity

The Drapes De Dzire aesthetic is governed by a palette of **Ivory, Cream, Gold, Deep Maroon, and Rich Brown** — evoking the warmth and richness of handwoven Indian textiles. Typography is serif-led, layouts are generous with whitespace, and every interaction is designed to feel unhurried and boutique-quality.

---

## 📄 License

This project is proprietary. All rights reserved © Drapes De Dzire 2026.
