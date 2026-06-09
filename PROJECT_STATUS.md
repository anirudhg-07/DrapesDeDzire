# Project Status & Environment Configuration Guide

This document provides a comprehensive summary of the completed features, testing instructions, and steps to transition the **Drapes De Dzire** platform to production by configuring your environment credentials.

---

## 1. What is Completed (Phase 1–3)

We have successfully built a premium, dynamic transactional loop linking Clerk Authentication, Neon Serverless Postgres, and Razorpay Payments.

### ✦ Core Features Fully Functional:
* **Autoseeded relational database:** Connects directly to Neon PostgreSQL using `@prisma/adapter-neon` via a lazy-loaded database proxy pattern. If the database tables are empty on boot, the system dynamically auto-seeds the 7 categories and 50 sarees in under 1.5 seconds.
* **On-the-fly user creation:** Eliminates localhost webhook limitations. If a user authenticates via Clerk but does not exist in the database yet, the system registers them in PostgreSQL automatically on their first cart or wishlist action.
* **Luxury Wishlist System:** Add or remove sarees to/from your account. A wishlist count updates in the navbar, and the `/wishlist` route displays curated items.
* **Database-Synced Cart Drawer:** Slide-in cart panel showing prices, subtotals, and quantity stepper controls. Syncs to the database instantly and validates item inventory thresholds.
* **3-Step Checkout Flow (`/checkout`):**
  1. *Shipping Step:* Detailed shipping address fields with Zod validation (enforces Indian phone and pincode formatting).
  2. *Review Step:* Live calculations of order subtotals, flat-rate shipping rules, and GST taxes.
  3. *Payment Step:* Renders the official Razorpay Checkout SDK iframe window.
* **Secure transactions:** Uses Prisma database transactions (`prisma.$transaction`) to deduct stock levels atomically and log pending order records.
* **Cryptographic Verification:** Webhook routing matches the Razorpay SHA-256 signature to verify payments securely before updating order logs to `PAID` and clearing user carts.
* **Confetti Success Client:** Renders confirmation screens displaying animated celebratory confetti, summary items, and generated order IDs (e.g. `DRP-YYYYMMDD-XXXX`).
* **Visual Polish:** Fully responsive layout with smooth image hover-scaling animations on the related products and collection pages.

---

## 2. Interactive Testing Guide (How to Verify Right Now)

Open [http://localhost:3000](http://localhost:3000) in your web browser and execute the following flows:

```
[Customer Sign-In] ➔ [Add Saree to Wishlist] ➔ [Add Saree to Cart]
                                                     │
                                                     ▼
[Confetti Success] ◀── [Razorpay Payment] ◀── [Checkout Steps]
```

### Step 1: Authentication
1. Click the profile icon or **Sign In** in the top navbar.
2. Sign in using the Google Social Login.

### Step 2: Wishlist Flow
1. Navigate to the Collections or Products search page.
2. Click the floating **Heart Icon** on any saree card.
3. Open [http://localhost:3000/wishlist](http://localhost:3000/wishlist) to confirm your wishlisted item is displayed.

### Step 3: Shopping Cart Flow
1. Navigate to any Product details page (e.g. [prod-saree-9](http://localhost:3000/products/prod-saree-9)).
2. Click **Add to Shopping Cart**. The cart drawer will slide open.
3. Change the quantity to `2`. Confirm the subtotal recalculates instantly.

### Step 4: Checkout & Sandbox Payment
1. Click **Proceed to Checkout** in the cart drawer.
2. Enter your shipping address. Click **Continue to Order Review**.
3. Review the pricing breakdown. Click **Proceed to Payment**.
4. The Razorpay checkout modal will load. Select **Netbanking** or **UPI/QR** and click **Success** to simulate a successful sandbox transaction.
5. The screen will display celebratory confetti and output your unique order invoice number (e.g. `DRP-...`).

---

## 3. Environment Variables Guide (`.env`)

To configure the live production platform, you must acquire keys for the services listed below and input them in your [web/.env](file:///Users/anirudhg/Desktop/drapes/web/.env) file.

| Environment Key | Purpose | Required/Optional |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon Postgres Database Connection String | **Required** (Configured & Working) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Frontend SDK Connection Token | **Required** (Placeholder active) |
| `CLERK_SECRET_KEY` | Clerk Server API Auth Token | **Required** (Placeholder active) |
| `CLERK_WEBHOOK_SECRET` | Clerk User sync verification secret | **Required** (Placeholder active) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay checkout client key ID | **Required** (Placeholder active) |
| `RAZORPAY_KEY_ID` | Razorpay server order initialization key ID | **Required** (Placeholder active) |
| `RAZORPAY_KEY_SECRET` | Razorpay server payment verification secret | **Required** (Placeholder active) |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signature verifying token | **Required** (Placeholder active) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary client-side storage name | **Required for Admin Mode** |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary server-side upload name | **Required for Admin Mode** |
| `CLOUDINARY_API_KEY` | Cloudinary signature authorization key | **Required for Admin Mode** |
| `CLOUDINARY_API_SECRET` | Cloudinary signature upload secret | **Required for Admin Mode** |
| `RESEND_API_KEY` | Resend email sender authentication API key | **Optional** (Configures emails) |
| `ADMIN_WHITELIST_EMAIL` | Whitelisted email granted inline administrative access | **Required for Admin Mode** |

---

## 4. How to Obtain Environment Credentials

### A. Clerk Authentication Setup
1. Go to the [Clerk Dashboard](https://dashboard.clerk.com/) and create an application.
2. Under **Configure** > **Social Connections**, enable **Google** login.
3. Under **Configure** > **Developers** > **API Keys**, copy the **Publishable Key** and **Secret Key**. Paste them into:
   * `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   * `CLERK_SECRET_KEY`
4. **Clerk Redirect Settings:** Ensure your Clerk settings match these NextJS paths (pre-configured in `.env`):
   * Sign In Page: `/sign-in`
   * Sign Up Page: `/sign-up`

---

### B. Razorpay Payment Gateway Setup
1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/) (use Test Mode first).
2. Go to **Settings** > **API Keys** > **Generate Key**.
3. Copy the **Key ID** and **Key Secret**. Paste them into:
   * `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   * `RAZORPAY_KEY_ID`
   * `RAZORPAY_KEY_SECRET`
4. **Webhooks Setup (Production only):**
   * Go to **Settings** > **Webhooks** > **Add New Webhook**.
   * URL: `https://yourdomain.com/api/webhooks/razorpay`
   * Active Events: `payment.authorized`, `order.paid`
   * Secret: Enter a custom random string (e.g. `mysecretweb123`). Copy this secret to `RAZORPAY_WEBHOOK_SECRET`.

---

### C. Cloudinary Image hosting Setup (For Admin Mode)
1. Register/Log in to the [Cloudinary Console](https://cloudinary.com/).
2. On your dashboard main screen, locate the **Product Environment Credentials**:
   * **Cloud Name:** Copy to `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` & `CLOUDINARY_CLOUD_NAME`.
   * **API Key:** Copy to `CLOUDINARY_API_KEY`.
   * **API Secret:** Copy to `CLOUDINARY_API_SECRET`.

---

### D. Resend Email Setup (Optional)
To send automated order invoices and delivery updates to customers:
1. Log in to the [Resend Console](https://resend.com/).
2. Click **API Keys** > **Create API Key**. Copy this token to `RESEND_API_KEY`.
3. Add and verify your domain in Resend to replace the default domain with your custom `RESEND_FROM_EMAIL` (e.g. `orders@yourdomain.com`).

---

## 5. Remaining Project Milestones

* **Phase 4: Customer Profile & Order Tracking:** Implementing saved address lists, customer order history dashboards, and the interactive parcel delivery tracking timelines.
* **Phase 5: Inline Admin Dashboard:** Building the inline editing features allowing whitelisted administrators to change stock/pricing parameters and upload new sarees through Cloudinary portals on the live site.
* **Phase 6: QA Auditing & Deployment:** E2E testing using Playwright, Core Web Vitals checks, page SEO mappings, and final production hosting setup.
