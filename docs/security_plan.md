# Security Architecture & Threat Plan
**Project Drapes De Dzire** - Production Security Strategy & Risk Mitigation

---

## 1. Threat Modeling (STRIDE Analysis)

| Threat Category | Potential Risk in Drapes De Dzire App | Platform Mitigations & Controls |
| :--- | :--- | :--- |
| **Spoofing Identity** | Attacker logs in as the whitelisted Admin using fake credentials or session hijacking. | * Enforce Clerk Multi-Factor Authentication (MFA) for the Admin account. <br> * Validate admin sessions server-side by cross-checking verified email credentials against the strict environment whitelist at each administrative request. |
| **Tampering with Data** | 1. User changes price during checkout payload transmission.<br>2. SQL Injection via search filters. | 1. Product price calculations are fetched and resolved strictly server-side inside Next.js Server Actions using the product's database ID. Frontend prices are ignored for payments.<br>2. Prisma ORM translates inputs into parameterized queries, neutralizing SQL Injection. |
| **Repudiation** | Customer denies placing an order or asserts payment was made but not credited. | * Maintain persistent audit logs of Razorpay transaction signatures (`Payment` table).<br>* Log Clerk user account updates, login IPs, and timestamp identifiers inside centralized platform logs (e.g., Vercel / Axiom logs). |
| **Information Disclosure** | Customer shipping details, addresses, or phone numbers leaked. | * Sensitive DB values are restricted via Prisma selections; never return raw user profiles in client responses.<br>* Force SSL/TLS protocols and enable Strict-Transport-Security (HSTS) headers to block man-in-the-middle sniffing. |
| **Denial of Service (DoS)** | Attacker floods API endpoints (e.g., cart, search, reviews) crashing the database connection pool. | * Deploy rate-limiting middleware on Next.js API routes (e.g., upstash-redis rate limiter).<br>* Configure Prisma connection pooling on Neon/Supabase to handle spikes. |
| **Elevation of Privilege** | Normal customer attempts to hit `/admin` routes or execute admin Server Actions. | * All Admin Server Actions call a helper utility `checkAdminAuth()` that queries Clerk server-side context and verifies matching email address prior to executing DB writes. |

---

## 2. Core Security Controls

### 2.1. Authentication Security (Clerk Integration)
*   **Token Verification:** Clerk handles JWT generation and validation. Next.js middleware decrypts and parses the JWT token for every route check.
*   **Protected Routes:** Middleware block unauthenticated access to `/checkout`, `/wishlist`, `/orders`, and `/admin`.
*   **Admin Whitelist Control:**
    ```typescript
    // src/lib/auth.ts
    import { auth, currentUser } from "@clerk/nextjs/server";
    
    export async function verifyAdmin() {
      const user = await currentUser();
      if (!user) throw new Error("Unauthorized");
      
      const adminEmail = process.env.ADMIN_WHITELIST_EMAIL;
      const verifiedEmail = user.emailAddresses.find(
        (email) => email.emailAddress === adminEmail && email.verification.status === "verified"
      );
      
      if (!verifiedEmail) {
        throw new Error("Forbidden: Access Restricted to Admin");
      }
      return user;
    }
    ```

### 2.2. Payment Security (Razorpay)
*   **Zero Card Retention:** Drapes De Dzire servers never see, store, or process Credit Card numbers, CVV, or bank accounts. Payment is completely delegated to Razorpay Hosted Checkout.
*   **Cryptographic Verification:** Every transaction signature returned from the checkout overlay must match `HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)`.
*   **Secure Transaction Isolation:** Stock counts are checked inside a Database transaction block immediately before initiating the checkout, ensuring double-allocation (race conditions) is impossible.

### 2.3. API Security & Input Validation
*   **Zod Schema Validation:** All APIs and Server Actions validate input payloads using Zod schemas. Any payload containing unexpected structures is immediately rejected before database execution.
*   **Example Review Validation:**
    ```typescript
    export const ReviewSchema = z.object({
      productId: z.string().uuid(),
      rating: z.int().min(1).max(5),
      comment: z.string().min(10).max(500).trim(),
    });
    ```
*   **API Rate Limiting:** Apply rate limit buckets to checkout creation and review submissions:
    *   `/api/checkout/create-order`: Max 5 requests per minute per IP.
    *   `/api/checkout/verify-payment`: Max 5 requests per minute per IP.

### 2.4. Image Upload Security
*   **Cloudinary Signed Uploads:** Images uploaded via the Admin Dashboard use Cloudinary Signed Uploads. The client requests a signed token signature from the server before uploading to Cloudinary, ensuring that only authenticated Admins can upload images.
*   **Size and Format Verification:** The server restricts image files to:
    *   File size: Maximum 5MB.
    *   MIME Types: `image/jpeg`, `image/png`, `image/webp`.

### 2.5. Environmental Integrity & Secrets Management
*   **Encapsulation of Secrets:** Private keys (`DATABASE_URL`, `CLERK_SECRET_KEY`, `RAZORPAY_KEY_SECRET`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY`) are kept in server environment files and never exposed to the client browser.
*   **Content Security Policy (CSP):** Next.js headers config enforces CSP policies to block Cross-Site Scripting (XSS):
    ```javascript
    // next.config.js
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-eval' https://checkout.razorpay.com; connect-src 'self' https://api.razorpay.com https://api.clerk.com; img-src 'self' data: https://res.cloudinary.com; frame-src https://api.razorpay.com;"
      }
    ];
    ```
