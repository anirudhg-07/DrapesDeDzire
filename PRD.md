
# Product Requirements Document (PRD)
## Project Drapes De Dzire: Premium Saree E-Commerce Platform
**Version:** 1.0.0  
**Date:** June 8, 2026  
**Authors:** Senior Product Manager & Senior Software Architect

---

## 1. Executive Summary & Brand Personality

### 1.1. Introduction
Project **Drapes De Dzire** is an enterprise-grade, premium e-commerce platform designed to sell luxury sarees across India. Rather than presenting a typical transactional grid of items, the website is engineered to replicate the sensory experience of walking into a high-end, physical boutique showroom. The design balances traditional Indian artistry with modern web animations and a clean, luxury aesthetic.

*   **Brand Name:** Drapes De Dzire
*   **Logo Asset:** Located in `/public/logo.png` (represents the traditional ornament, paisley, and saree drape illustration in beige and gold).

### 1.2. Brand Personality
The brand identity is governed by six key characteristics:
*   **Elegant:** Refined typography, balanced layouts, and generous whitespace.
*   **Premium:** Exquisite product imagery, gold accents, and fluid interactions.
*   **Traditional:** Deep cultural resonance, honoring the heritage of weaving styles.
*   **Luxurious:** An unhurried, boutique-like shopping experience with rich storytelling.
*   **Modern:** Built on a modern tech stack (Next.js 15, Clerk, Tailwind, Framer Motion) for lightning-fast, secure shopping.
*   **Trustworthy:** Transparent policies, verified reviews, and highly secure payment gateways.


---

## 2. Business Requirements

### 2.1. Catalog & Inventory
*   **Initial Catalog Size:** 50 to 100 premium sarees.
*   **Stock Management:** Real-time stock counts. Items must be marked as "Out of Stock" immediately when inventory hits zero. No backorders allowed for initial release.

### 2.2. Shipping & Fulfilment
*   **Geographical Scope:** Pan India shipping only.
*   **Shipping Rates:** Free shipping for premium products, or flat-rate shipping calculated during checkout based on delivery partner integrations (e.g., Shiprocket/Delhivery).

### 2.3. Payments
*   **Supported Gateways:** Razorpay only.
*   **Cash on Delivery (COD):** Strictly disabled. All orders require full upfront payment via UPI, Credit/Debit cards, Net Banking, or supported Wallets through Razorpay.
*   **Currency:** Indian Rupees (INR) exclusively.

### 2.4. Authentication & User Profile
*   **Authentication Engine:** Clerk Authentication.
*   **Sign-In Method:** Google Social Login (OAuth 2.0).
*   **Auth Enforcement:** Guests can browse the homepage, collections, and product detail pages. However, the system must enforce login *before* any item can be added to the cart, wishlist, or checkout flow.
*   **Customer Profile Data Collected:**
    *   Full Name
    *   Email Address (verified via Clerk)
    *   Primary Phone Number (Indian format: `+91 XXXXXXXXXX`)
    *   Alternate Phone Number (Optional)
    *   Shipping Address (Line 1, Line 2, Land mark)
    *   City
    *   State
    *   Pincode (6-digit validation matching shipping regions)

### 2.5. Administrative Controls
*   **Admin Scope:** Single administrative account.
*   **Authorization:** The admin is identified through a hardcoded/environment-configured whitelisted email address (e.g., `admin@drapesdedzire.in`).
*   **Registration:** No public sign-up for administrative accounts. Admin logins are checked against the whitelisted email after authenticating via Google/Clerk.
*   **Admin Dashboard:** Restricted route `/admin/*` protected via Next.js middleware checking user claims and the whitelisted email.

---

## 3. Product Features & Scope

Detailed information about architecture, user flows, database schemas, and API design are modularized into separate, dedicated engineering documents located in the `docs/` directory:

*   **[System Architecture & Diagrams](file:///Users/anirudhg/Desktop/drapes/docs/architecture.md):** Architectural flows, authentication, Razorpay payment verification sequence, and Mermaid diagrams.
*   **[Database Schema (Prisma & PostgreSQL)](file:///Users/anirudhg/Desktop/drapes/docs/schema.prisma):** Comprehensive schema detailing users, categories, products, orders, reviews, addresses, and banners.
*   **[Wireframes & UX Guidelines](file:///Users/anirudhg/Desktop/drapes/docs/wireframes.md):** ASCII wireframes for Homepage, PLP, PDP, Checkout steps, and Admin screens with CSS theme setup.
*   **[API & Server Actions Specification](file:///Users/anirudhg/Desktop/drapes/docs/api_specification.md):** Specification of Server Actions and REST API routes (webhooks/checkout).
*   **[Security & Threat Analysis](file:///Users/anirudhg/Desktop/drapes/docs/security_plan.md):** Threat modeling, payment verification, and security controls.
*   **[Testing, Deployment & Roadmap](file:///Users/anirudhg/Desktop/drapes/docs/testing_and_deployment.md):** Development timeline, testing setup, and future scalability.

### 3.1. Detailed Feature Breakdown

```
drapes/
├── PRD.md                       <-- This Master Document
└── docs/
    ├── architecture.md          <-- Systems design & data flowcharts
    ├── wireframes.md            <-- Page-by-page wireframe grids & UI theme
    ├── schema.prisma            <-- Prisma PostgreSQL schema definition
    ├── api_specification.md     <-- Server Actions & Webhook APIs
    ├── security_plan.md         <-- Security threat model & controls
    └── testing_and_deployment.md<-- Test cases, DevOps, and Roadmap
```

---

## 4. Feature List

### 4.1. Visitor Features (Unauthenticated)
*   **Browse Homepage:** High-end boutique layout featuring Hero banners, curated collections, and new arrivals.
*   **View Collections:** Filter and sort through available sarees without logging in.
*   **View Product Details:** High-resolution product images, zoom lens capability, pricing, fabric, and saree details.
*   **Search:** Text-based search to find sarees by category, colour, fabric, or occasion.

### 4.2. Customer Features (Authenticated)
*   **Manage Wishlist:** Add and remove sarees to/from a personal wishlist.
*   **Add to Cart:** Move items from details page or wishlist to the active shopping cart (login forced prior).
*   **Checkout & Payment:** 3-step checkout with address inputs, order review, and integration with Razorpay Hosted Checkout.
*   **Order Tracking:** Access to a visual timeline tracking orders from "Placed" through "Delivered".
*   **Review and Rating:** Submit ratings and written feedback. Reviews are only submitted by customers who have a verified purchase of that specific saree.

### 4.3. Admin Features (Whitelisted Account Only)
*   **Overview Dashboard:** High-level metrics tracking total orders, total revenue, and listing recent orders.
*   **Product Management:** Complete CRUD interface to Add, Edit, and Delete products, select categories, and manage image uploads.
*   **Banner Management:** Control homepage hero banners, seasonal/festival banners, promotional sliders (enable, disable, and upload images).
*   **Order Fulfilment:** Update order state (Mark as Processing, Shipped with tracking code, Delivered, or Cancelled).
*   **Customer Directory:** View registered customers and their associated order history.
*   **Review Moderation:** Approve or flag and remove submitted customer reviews.

---

## 5. User Stories

### US-101: Boutique Shopping Experience
**As a** high-end fashion shopper,  
**I want to** enter a website that looks and feels like a luxurious showroom,  
**So that** I feel the premium value of the sarees and build immediate trust in the brand.
*   **Acceptance Criteria:**
    *   Homepage loads in under 2 seconds.
    *   Color palette strictly uses Ivory, Cream, Gold accents, Deep Maroon, and Rich Brown.
    *   Images use Next.js `next/image` to prevent layout shifts (CLS) and leverage lazy loading.
    *   Hero section features editorial-grade images with a serif brand statement.

### US-102: Interactive Product Browsing
**As a** customer browsing sarees,  
**I want to** hover over saree cards to see quick details and zoom in on details pages,  
**So that** I can assess the fabric weave and patterns before making a purchase.
*   **Acceptance Criteria:**
    *   Hovering over a product card on desktop smoothly zooms the image by 5-10% and overlays fabric type, color, price, and occasion.
    *   Mobile users tap a clean "Quick View" button/icon on the card to see a summary modal.
    *   The Product Details Page (PDP) features a Zoom Lens component to inspect weaving details up close.

### US-103: Authenticated Cart Gate
**As a** guest browsing sarees,  
**I want to** be prompted to sign in when clicking "Add to Cart" or "Add to Wishlist",  
**So that** my selections are securely stored in my account profile database.
*   **Acceptance Criteria:**
    *   Clicking "Add to Cart" or "Add to Wishlist" as a guest triggers a redirect to the Clerk Google Sign-In page.
    *   After successful authentication, the user is redirected back to the product details page, and the item is added to their cart or wishlist.

### US-104: Secure Payment Checkout
**As an** authenticated customer ready to purchase,  
**I want to** enter my shipping address, review my order, and complete payment via Razorpay,  
**So that** my payment is handled securely without entering card details on the Drapes De Dzire website.
*   **Acceptance Criteria:**
    *   All shipping address fields (Name, Phone, Alternate Phone, Address, City, State, Pincode) are validated client-side and server-side.
    *   Payment is handled via Razorpay standard hosted checkout.
    *   No card details or bank passwords are processed or stored on the Drapes De Dzire server.
    *   Order is marked as "Paid" only after the server verifies the Razorpay payment signature.

### US-105: Admin Product Control
**As the** boutique owner,  
**I want to** add and edit premium sarees in the catalog and update banners,  
**So that** my inventory and front-page promotions reflect active boutique stock.
*   **Acceptance Criteria:**
    *   The `/admin` routes check for Clerk authentication and verify if the email is whitelisted in environment variables. Non-admins receive a 403 Forbidden page.
    *   The Add/Edit Product form validates names, prices (must be positive), stock quantities (must be integers >= 0), and categories.
    *   Image uploads are sent directly to Cloudinary via signed requests, restricting file sizes to 5MB.
