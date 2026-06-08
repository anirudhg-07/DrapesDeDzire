# System Architecture & Flows
**Project Drapes De Dzire** - Technical Architecture & Lifecycle Design

---

## 1. System Architecture Diagram

Below is the high-level architecture diagram representing Next.js 15, Clerk Auth, Postgres (via Prisma), Cloudinary, Resend, and Razorpay integrations.

```mermaid
graph TD
    %% Clients
    User[Customer Browser] <-->|HTTPS / HTML & JSON| CDN[Vercel CDN Edge]
    Admin[Admin Browser] <-->|HTTPS / HTML & JSON| CDN
    
    %% Application Layer
    CDN <-->|Routing & Render| NextServer[Next.js 15 App Router Server]
    
    subgraph Next.js 15 Environment (Vercel)
        NextServer -->|Server Components & SSR| Pages[React Pages / UI]
        NextServer -->|Server Actions| Actions[Next.js Server Actions]
        NextServer -->|API Routes| APIRoutes[Next.js API Routes]
    end

    %% Database & ORM
    Actions -->|Prisma Client| DB[(PostgreSQL Database)]
    APIRoutes -->|Prisma Client| DB

    %% External Systems & APIs
    Actions -->|Signed Upload Request| Cloudinary[Cloudinary Image Storage]
    Actions -->|Trigger Email| Resend[Resend Mail Service]
    Actions -->|Create Razorpay Order| Razorpay[Razorpay Payment API]
    
    %% Webhook Handlers
    Clerk[Clerk Auth Provider] -->|Webhook: User Events| APIRoutes
    RazorpayWebhook[Razorpay Gateways] -->|Webhook: Payment Success| APIRoutes

    %% Authentication Client Integration
    Pages <-->|JWT Tokens & Sign-In| Clerk SDK[Clerk Client SDK]
```

---

## 2. Authentication & User Sync Flow

The authentication utilizes **Clerk Auth** with Google OAuth 2.0. Users are persisted in the PostgreSQL database via a secure Webhook sync to ensure data integrity and query capability for orders, reviews, and wishlists.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Client as Next.js Client (Clerk SDK)
    participant Clerk as Clerk Auth Server
    participant App as Next.js API Webhook
    participant DB as PostgreSQL (Prisma)

    Customer->>Client: Click Google Sign-In
    Client->>Clerk: Redirect to Clerk Google Auth
    Clerk->>Customer: Render Google Sign-in Portal
    Customer->>Clerk: Submit Credentials
    Clerk->>Customer: Authenticate & Redirect to Drapes De Dzire App
    Clerk-->>App: Event: user.created (Webhooks with HMAC Secret)
    App->>App: Validate HMAC Signature
    App->>DB: Upsert User (Email, ID, Name)
    Client->>Client: Obtain Session JWT Token
```

---

## 3. Checkout & Razorpay Payment Verification Flow

Since security is a primary concern, the platform utilizes **Razorpay Hosted Checkout** with strict server-side signature verification.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Client as Next.js Client
    participant Actions as Next.js Server Actions
    participant DB as PostgreSQL (Prisma)
    participant Razorpay as Razorpay API
    participant RazorpaySDK as Razorpay CheckOut SDK
    participant Webhook as Next.js API Webhook

    Customer->>Client: Click "Proceed to Pay"
    Client->>Actions: createOrderAction(AddressDetails, CartItems)
    Actions->>DB: Check Stock Availability
    DB-->>Actions: Stock Available
    Actions->>DB: Create Pending Order & Address
    Actions->>Razorpay: API Call: Create Order (Amount, Currency, Order ID)
    Razorpay-->>Actions: Return Razorpay Order ID (order_XXXXX)
    Actions->>DB: Save Razorpay Order ID on Order Record
    Actions-->>Client: Return Razorpay Order Details
    Client->>RazorpaySDK: Open Payment Modal(options, order_XXXXX)
    Customer->>RazorpaySDK: Enter Details & Pay
    RazorpaySDK-->>Client: Return payment_id, signature, order_id
    Client->>Actions: verifyPaymentAction(payment_id, signature, order_id)
    Actions->>Actions: Calculate HMAC-SHA256 Signature using Razorpay Key Secret
    
    alt Signature Matches
        Actions->>DB: Mark Order as "PAID", Update Inventory, Create Payment Log
        Actions-->>Client: Return Success
        Client->>Customer: Display Order Confirmation Page & Visual Timeline
    else Signature Verification Fails
        Actions->>DB: Mark Payment / Order as "FAILED"
        Actions-->>Client: Return Failure Alert
        Client->>Customer: Display Payment Failed Screen
    end

    %% Webhook Backup Path
    Note over Razorpay, Webhook: Webhook Fallback Path (in case customer closes browser early)
    Razorpay->>Webhook: Webhook Event: payment.captured (Signed)
    Webhook->>Webhook: Validate Webhook Signature
    Webhook->>DB: If Order is still "PENDING", update to "PAID", Update Inventory
```

---

## 4. Visual Order Timeline Lifecycle

The order state machine ensures that status values are locked in sequence and cannot skip invalid steps.

```mermaid
stateDiagram-v2
    [*] --> PENDING : User initiates checkout
    PENDING --> PAID : Razorpay Signature Verified / Webhook Captured
    PENDING --> FAILED : Razorpay payment fails or expires
    PAID --> PROCESSING : Admin opens order and marks "Processing"
    PROCESSING --> SHIPPED : Admin ships & inputs tracking code
    SHIPPED --> OUT_FOR_DELIVERY : Courier status updates (or manual update)
    OUT_FOR_DELIVERY --> DELIVERED : Marked delivered (final state)
    
    %% Cancel paths
    PENDING --> CANCELLED : Timeout / User abandons
    PAID --> CANCELLED : Admin issues refund (Razorpay Refund API)
    PROCESSING --> CANCELLED : Out of stock issue (Refund triggered)
    
    CANCELLED --> [*]
    DELIVERED --> [*]
```

---

## 5. Complete Visitor & Customer Journey

The visual flowchart details the navigation steps from initial entry to successful order delivery:

```mermaid
graph TD
    Start([Landing on Homepage]) --> Browse[Browse Hero Banner & Featured Collections]
    Browse --> ClickProduct[Click on Saree Card]
    ClickProduct --> PDP[View Product Details Page: Multi-image, Care Instructions]
    
    PDP --> AddCart{Click "Add to Cart"}
    AddCart -->|Not Logged In| AuthRedirect[Redirect to Clerk Authentication]
    AuthRedirect --> GoogleAuth[Login via Google]
    GoogleAuth --> PDP
    
    AddCart -->|Logged In| Cart[Add Saree to Cart]
    Cart --> Checkout[Checkout Step 1: Address Input]
    Checkout --> OrderSummary[Checkout Step 2: Review Order Details]
    OrderSummary --> RazorpayModal[Checkout Step 3: Razorpay Payment Portal]
    
    RazorpayModal --> Confirm{Payment Success?}
    Confirm -->|Yes| OrderConfirmation[Order Confirmation Page: Details Summary]
    Confirm -->|No| Checkout
    
    OrderConfirmation --> OrderTracking[Order Tracking: Live Progress Timeline]
    OrderTracking --> End([Product Delivered])
```
