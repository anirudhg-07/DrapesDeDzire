# API & Server Actions Specification
**Project Drapes De Dzire** - Next.js 15 Backend Routes & Server Actions

---

## 1. Directory Structure Organization

Next.js 15 is configured with Server Actions (for page mutations) and standard Route Handlers (for programmatic webhook integrations).

```
src/
├── app/
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── clerk/route.ts           # Clerk webhook (User synchronization)
│   │   │   └── razorpay/route.ts        # Razorpay payment status webhook fallback
│   │   └── checkout/
│   │       ├── create-order/route.ts    # Initiates Razorpay Order
│   │       └── verify-payment/route.ts  # Verifies Razorpay cryptographic signature
│   └── actions/
│       ├── products.ts                  # Admin product CRUD operations
│       ├── banners.ts                   # Admin banner scheduling operations
│       ├── wishlist.ts                  # Customer wishlist addition/deletion
│       ├── reviews.ts                   # Review creation and moderation
│       ├── addresses.ts                 # Customer shipping address management
│       └── orders.ts                    # Order lifecycle tracking and admin updates
```

---

## 2. API Endpoints Specification

### 2.1. POST `/api/webhooks/clerk`
*   **Purpose:** Listens to Clerk authentication events to keep local PostgreSQL users in sync.
*   **Security:** Enforces Clerk Webhook HMAC-SHA256 signature verification.
*   **Headers:**
    *   `svix-id`: Event Identifier
    *   `svix-timestamp`: Request Epoch Time
    *   `svix-signature`: Cryptographic HMAC signature
*   **Payload (JSON):**
    ```json
    {
      "data": {
        "id": "user_2T2W12345...",
        "email_addresses": [{ "email_address": "customer@gmail.com" }],
        "first_name": "Anirudh",
        "last_name": "Gupta"
      },
      "type": "user.created"
    }
    ```
*   **Database Operations:**
    *   Creates/updates the corresponding `User` record inside the PostgreSQL database using Prisma `upsert`.

### 2.2. POST `/api/checkout/create-order`
*   **Purpose:** Reserves inventory, registers a pending order in PostgreSQL, and generates a Razorpay Order ID.
*   **Authentication:** Requires valid Clerk JWT Session Token.
*   **Payload (JSON):**
    ```json
    {
      "addressId": "addr_uuid_123456",
      "items": [
        { "productId": "prod_uuid_789", "quantity": 1 }
      ]
    }
    ```
*   **Execution Logic (Transactions):**
    ```typescript
    // Database isolated execution
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Verify and decrement inventory
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product?.name || item.productId}`);
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
      
      // 2. Create Order in PENDING status
      const order = await tx.order.create({ ... });
      
      // 3. Request Razorpay Order ID from Razorpay SDK
      const razorpayOrder = await razorpay.orders.create({
        amount: order.totalAmount * 100, // Razorpay calculates in paise
        currency: "INR",
        receipt: order.orderNumber,
      });

      // 4. Update Order record with razorpayOrderId
      return tx.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: razorpayOrder.id }
      });
    });
    ```
*   **Response (JSON - 200 OK):**
    ```json
    {
      "success": true,
      "razorpayOrderId": "order_Hn83Yhn9U1",
      "amount": 3250000,
      "currency": "INR"
    }
    ```

### 2.3. POST `/api/checkout/verify-payment`
*   **Purpose:** Validates the signature returned from Razorpay Hosted checkout overlay.
*   **Payload (JSON):**
    ```json
    {
      "razorpay_order_id": "order_Hn83Yhn9U1",
      "razorpay_payment_id": "pay_Hn83Yhn9U1",
      "razorpay_signature": "signature_hash_value"
    }
    ```
*   **Verification Algorithm:**
    ```typescript
    import crypto from "crypto";
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");
      
    if (expectedSignature === razorpay_signature) {
      // Mark Order Status to PAID and log payment
    } else {
      // Mark Order Status to FAILED and return failure code
    }
    ```

### 2.4. POST `/api/webhooks/razorpay`
*   **Purpose:** Capture webhook fallback from Razorpay for payments that were successful but the customer closed the tab before returning to the Drapes De Dzire app.
*   **Security:** Verify webhook signature via Razorpay Signature Verification Header (`X-Razorpay-Signature`).
*   **Database Operations:** If order is still `PENDING`, update to `PAID`. Otherwise, safely ignore (already processed by verify-payment endpoint).

---

## 3. Server Actions Specification

Server Actions are used in Next.js 15 for security and execution efficiency. All database operations must be isolated to server boundaries.

### 3.1. `wishlistActions.ts`
*   **`toggleWishlistItemAction(productId: string)`**
    *   *Authorization:* Authenticated user.
    *   *Process:* Resolves clerk user context. If already in `Wishlist` table, deletes it. If not present, creates it.
    *   *Return:* `{ success: boolean, action: 'added' | 'removed' }`

### 3.2. `reviewActions.ts`
*   **`submitProductReviewAction(productId: string, rating: number, comment: string)`**
    *   *Authorization:* Authenticated user.
    *   *Verification Logic:* Queries `Order` and `OrderItem` tables to check if the user has a confirmed `DELIVERED` order of that `productId`. If false, rejects submission.
    *   *Process:* Writes review to DB with `isApproved: false` and `isVerifiedPurchase: true`.
    *   *Return:* `{ success: boolean, message: "Review submitted for moderation." }`
*   **`moderateReviewAction(reviewId: string, approve: boolean)`**
    *   *Authorization:* Whitelisted Admin.
    *   *Process:* If `approve === true`, sets `isApproved: true`. Otherwise, deletes the review.
    *   *Return:* `{ success: boolean }`

### 3.3. `addressActions.ts`
*   **`upsertAddressAction(addressData: AddressInputSchema)`**
    *   *Authorization:* Authenticated user.
    *   *Process:* Validates shape using Zod parser. If `isDefault` is checked, sets all other user address records' `isDefault` to `false` before inserting/updating.
    *   *Return:* `{ success: boolean, addressId: string }`

### 3.4. `productActions.ts`
*   **`createProductAction(data: ProductInputSchema)`**
    *   *Authorization:* Whitelisted Admin.
    *   *Process:* Zod validation. Directly writes product records and coordinates image relational records with Cloudinary public asset IDs.
*   **`deleteProductAction(productId: string)`**
    *   *Authorization:* Whitelisted Admin.
    *   *Process:* Deletes from PostgreSQL. Calls Cloudinary SDK to remove corresponding stored images securely.

### 3.5. `bannerActions.ts`
*   **`updateBannersAction(banners: BannerInputArray)`**
    *   *Authorization:* Whitelisted Admin.
    *   *Process:* Updates details, image links, and display order sequence. Revalidates Next.js layout cache for homepage (`revalidatePath('/')`).
