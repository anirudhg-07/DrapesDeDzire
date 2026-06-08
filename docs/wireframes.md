# UX/UI Design Guidelines & Wireframes
**Project Drapes De Dzire** - High-Fidelity ASCII Interface Mockups & Design Tokens

---

## 1. Visual Identity & Design System

### 1.1. Color Palette (Tailored HSL & Hex)
*   **Background (Ivory):** `#FCFBF7` (HSL: `48°, 20%, 98%`) - Crisp, premium light background.
*   **Surface (Cream):** `#F4EFE6` (HSL: `38°, 24%, 93%`) - Warm luxury accents and card backdrops.
*   **Accent Color (Gold):** `#D4AF37` (HSL: `46°, 65%, 52%`) - Brushed metallic gold for high-end styling details, CTAs, and hover states.
*   **Primary Brand Color (Deep Maroon):** `#4A0E17` (HSL: `351°, 68%, 17%`) - Royal silk tone for text headings, header backgrounds, and major CTA buttons.
*   **Secondary Text (Rich Brown):** `#3D2314` (HSL: `22°, 50%, 16%`) - Subtle typography color for body descriptions.

### 1.2. Typography
*   **Headings (H1, H2, H3):** *Playfair Display* or *Cinzel* (Google Fonts) - Premium Editorial Serifs reflecting traditional Indian heritage.
*   **Body Copy & Interface Labels:** *Inter* or *Montserrat* - Highly readable, geometric sans-serif to keep the workspace modern and crisp.

### 1.3. Micro-Animations (Framer Motion)
*   **Page Transitions:** Fade in/out slide up (`y: [10, 0]`, `opacity: [0, 1]`, duration `0.4s` cubic-bezier easing).
*   **Saree Card Hover (Desktop):**
    *   Image scale smoothly from `1.0` to `1.05` (`duration: 0.5s`).
    *   Overlay text moves from bottom up (`y: [20, 0]`, opacity from `0` to `1`).
*   **Add-To-Cart feedback:** Button text changes from "Add to Cart" to "Adding..." with a loading spinner, then snaps to a success green checkmark before reverting.

---

## 2. Page-by-Page Wireframes

### 2.1. Homepage Layout (Mobile-Responsive Grid)

```
================================================================================
  [ D R A P E S   D E   D Z I R E ]      Search Sarees...             Wishlist(2) | Cart(1) | Login
================================================================================
  [ Hero Section - Video/Editorial-grade Imagery Slider ]
  +--------------------------------------------------------------------------+
  |                                                                          |
  |             H E R I T A G E   I N   E V E R Y   T H R E A D              |
  |                   Crafted by Master Artisans of India                    |
  |                                                                          |
  |                            [ SHOP NOW ]                                  |
  |                                                                          |
  +--------------------------------------------------------------------------+

  [ FEATURED COLLECTIONS ]
  +------------------+  +------------------+  +------------------+  +--------...
  | Kanchipuram Silk |  |  Banarasi Silk   |  |  Bridal Special  |  | Cotton ...
  | [View Collection]|  | [View Collection]|  | [View Collection]|  | [View  ...
  +------------------+  +------------------+  +------------------+  +--------...

  [ NEW ARRIVALS ]
  +----------------------+   +----------------------+   +----------------------+
  | [ Image: Saree 1 ]   |   | [ Image: Saree 2 ]   |   | [ Image: Saree 3 ]   |
  | Crimson Kanchipuram  |   | Golden Organza Silk  |   | Royal Blue Banarasi  |
  | Rs. 24,500           |   | Rs. 18,200           |   | Rs. 32,000           |
  | [♥] [ ADD TO CART ]  |   | [♥] [ ADD TO CART ]  |   | [♥] [ ADD TO CART ]  |
  +----------------------+   +----------------------+   +----------------------+

  [ WHY CHOOSE DRAPES ]
  +-----------------------+  +-----------------------+  +-----------------------+
  |   Authentic Weaves    |  |     Secure Payments   |  |   Pan India Shipping  |
  | Silk Mark Certified   |  |    100% Razorpay SSL  |  |   Insured Logistics   |
  +-----------------------+  +-----------------------+  +-----------------------+

  [ FOOTER ]
  D R A P E S   D E   D Z I R E - Luxury Indian Silks                  [ Newsletter Sign-up ]
  About | Shipping | Returns | Terms | Contact      Email: [               ] [SUBMIT]
================================================================================
```

---

### 2.2. Product Listing Page (PLP) with Advanced Filtering

```
================================================================================
  Homepage / Collections / Kanchipuram Silk (12 items)
================================================================================
  FILTERS                      | SORT BY: [ Popularity ] [v]
  -----------------------------+------------------------------------------------
  [v] FABRIC                   | Showing 1 - 9 of 12 sarees
  [ ] Kanchipuram Silk (6)     | 
  [ ] Banarasi Silk (4)        | +------------------------+ +------------------------+
  [ ] Organza (2)              | | [Image: Saree 1]   [♥] | | [Image: Saree 2]   [♥] |
                               | | Crimson Kanchipuram    | | Mustard Georgette    |
  [v] COLOUR                   | | Rs. 28,000             | | Rs. 14,500             |
  [ ] Deep Maroon              | | Fabric: Silk           | | Fabric: Georgette      |
  [ ] Mustard Gold             | | Colour: Maroon         | | Colour: Yellow         |
  [ ] Royal Blue               | +------------------------+ +------------------------+
                               | 
  [v] OCCASION                 | +------------------------+ +------------------------+
  [ ] Bridal                   | | [Image: Saree 3]   [♥] | | [Image: Saree 4]   [♥] |
  [ ] Festive                  | | Forest Green Banarasi  | | Peach Organza Saree    |
  [ ] Designer                 | | Rs. 35,000             | | Rs. 19,000             |
                               | | Fabric: Banarasi Silk  | | Fabric: Organza        |
  [v] PRICE RANGE              | | Colour: Green          | | Colour: Pink           |
  Rs. 10,000 - Rs. 50,000      | +------------------------+ +------------------------+
================================================================================
```
*   **Special Card Hover Behavior:** On hover, the card image zooms to 1.05x, and a sliding drawer card reveals secondary details: `"Fabric: 100% Pure Mulberry Silk | Care: Dry Clean Only | [ QUICK VIEW ]"`.

---

### 2.3. Product Details Page (PDP) with Zoom Lens

```
================================================================================
  Collections / Kanchipuram Silk / Crimson Heritage Saree
================================================================================
  +----------------------------+   CRIMSON HERITAGE KANCHIPURAM SAREE
  |                            |   Ref: DRP-KNC-089
  |    [ PRIMARY IMAGE ]       |   Rs. 32,500  (Inclusive of all taxes)
  |                            |   
  |    * Hover to Zoom *       |   Select Blouse Stitching Option:
  |                            |   [x] Unstitched fabric (Included)  [ ] Semi-Stitched (+Rs.1,500)
  |                            |   
  +----------------------------+   [ ADD TO CART ]  [ BUY NOW ]  [♥ Add to Wishlist]
   [t1] [t2] [t3] [t4] (Thumbs)
                                   PRODUCT DETAILS
  --------------------------------- Fabric: Pure Silk Mark Certified Kanchipuram
  *Care Instructions*               Colour: Crimson Maroon with Gold Zari border
  Dry Clean Only. Store in soft    Occasion: Bridal, Wedding, Festive
  muslin cloth wrapper.            Length: 5.5 meters + 0.8 meter blouse piece
  ---------------------------------
  
  [ RELATED PRODUCTS ]
  +----------------------+   +----------------------+   +----------------------+
  | [ Image: Saree A ]   |   | [ Image: Saree B ]   |   | [ Image: Saree C ]   |
  | Magenta Zari Weave   |   | Gold Brocade Banarasi|   | Maroon Tussar Silk   |
  | Rs. 29,000           |   | Rs. 34,500           |   | Rs. 18,900           |
  +----------------------+   +----------------------+   +----------------------+
================================================================================
```

---

### 2.4. Checkout Flow (Step-by-Step Layout)

```
================================================================================
  C H E C K O U T
================================================================================
  STEP 1: Shipping Address  --->  STEP 2: Order Review  --->  STEP 3: Payment
  ------------------------------------------------------------------------------
  [ ] Use Saved Address (Select Default Address)
  
  Full Name:       [ Anirudh Gupta                       ]
  Email Address:   [ anirudh@gmail.com                   ] (Read-Only from Clerk)
  Phone Number:    [ 9876543210                          ]
  Alt Phone Num:   [ 9876501234                          ] (Optional)
  Address Line 1:  [ 42, Heritage Apartment, MG Road     ]
  Address Line 2:  [ Indiranagar                         ]
  Landmark:        [ Near Metro Station                  ] (Optional)
  City:            [ Bengaluru                           ]
  State:           [ Karnataka                           ]
  Pincode:         [ 560038                              ]

  [ SAVE & CONTINUE TO REVIEW ]
================================================================================
```

```
================================================================================
  C H E C K O U T
================================================================================
  STEP 1: Shipping Address  --->  STEP 2: Order Review  --->  STEP 3: Payment
  ------------------------------------------------------------------------------
  ORDER ITEMS:
  * 1x Crimson Heritage Kanchipuram Saree (Rs. 32,500)
  
  SHIPPING TO:
  Anirudh Gupta, 42, Heritage Apartment, MG Road, Bengaluru, 560038. Ph: 9876543210.
  
  ORDER SUMMARY:
  Subtotal:          Rs. 32,500.00
  Shipping:          FREE
  Total Amount:      Rs. 32,500.00

  [ PROCEED TO SECURE PAYMENT (RAZORPAY) ]
================================================================================
```

---

### 2.5. Order Tracking Visual Timeline

```
================================================================================
  Order #DRP-20260608-XYZ123
================================================================================
  Thank you for your order, Anirudh!
  Your payment has been successfully processed. Estimated delivery: June 12, 2026.

  TRACKING TIMELINE
  
  (●) ORDER PLACED       - June 08, 2026, 10:15 AM
   |
  (●) PAID               - June 08, 2026, 10:17 AM (Razorpay ID: pay_Hn83Yhn9U1)
   |
  (●) PROCESSING         - June 09, 2026, 09:00 AM (Your saree is being prepared)
   |
  (○) SHIPPED            - Pending (Tracking ID will appear here)
   |
  (○) OUT FOR DELIVERY   - Pending
   |
  (○) DELIVERED          - Pending

  [ Shipping Courier: Delhivery | Tracking Ref: - ]
  [ Return / Exchange Policy: Allowed within 7 days of delivery in pristine condition ]
================================================================================
```

---

### 2.6. Admin Dashboard Overview

```
================================================================================
  [ DRAPES DE DZIRE ADMIN ]     Overview | Products | Banners | Orders | Customers | Reviews
================================================================================
  DASHBOARD METRICS
  +----------------------+  +----------------------+  +----------------------+
  |     TOTAL ORDERS     |  |    TOTAL REVENUE     |  |    PENDING SHIPPED   |
  |         248          |  |    Rs. 58,45,200     |  |          14          |
  +----------------------+  +----------------------+  +----------------------+

  RECENT ORDERS
  Order ID             Customer       Amount       Status         Action
  ------------------------------------------------------------------------------
  DRP-20260608-XYZ123  Anirudh G.     Rs. 32,500   PAID           [Manage Order]
  DRP-20260607-ABC456  Priyanka S.    Rs. 18,200   SHIPPED        [Manage Order]
  DRP-20260607-KLP789  Meera K.       Rs. 45,000   DELIVERED      [View Order]

  MODERATION ALERTS
  * [Review Moderation] 3 new customer reviews pending verification approval.
  * [Inventory Alert] Golden Organza Saree is OUT OF STOCK.
================================================================================
```
*   **Mobile-First Implementation:** Sidebars collapse into responsive bottom tabs or drawer sliding menus. Tables collapse into clean card layouts containing order actions on mobile Viewports.

---

## 3. Custom Page Skeleton Loaders

To preserve the boutique feel during client routing, each page displays a custom-tailored skeleton matching its final layout structure.

### 3.1. Homepage Loading Skeleton
The home page loader shimmers in warm cream tones, matching the size of the Hero Banner and featured circle layouts.

```
================================================================================
  [ D R A P E S   D E   D Z I R E ]      Search Sarees...             Wishlist(2) | Cart(1) | Login
================================================================================
  [ HERO BANNER SHIMMER - Pulse animation ]
  +--------------------------------------------------------------------------+
  |                                                                          |
  |             ////////////////////////////////////////////                 |
  |             ///////////////// SHIMMER //////////////////                 |
  |                                                                          |
  |                            [==========]                                  |
  |                                                                          |
  +--------------------------------------------------------------------------+

  [ FEATURED COLLECTIONS ROW SHIMMER ]
  +------+  +------+  +------+  +------+  +------+  +------+  +------+  +------+
  | ( O )|  | ( O )|  | ( O )|  | ( O )|  | ( O )|  | ( O )|  | ( O )|  | ( O )|
  | ---- |  | ---- |  | ---- |  | ---- |  | ---- |  | ---- |  | ---- |  | ---- |
  +------+  +------+  +------+  +------+  +------+  +------+  +------+  +------+

  [ NEW ARRIVALS GRID SHIMMER ]
  +----------------------+   +----------------------+   +----------------------+
  | //////////////////// |   | //////////////////// |   | //////////////////// |
  | /////  IMAGE   ///// |   | /////  IMAGE   ///// |   | /////  IMAGE   ///// |
  | //////////////////// |   | //////////////////// |   | //////////////////// |
  | [==================] |   | [==================] |   | [==================] |
  | [======]             |   | [======]             |   | [======]             |
  +----------------------+   +----------------------+   +----------------------+
================================================================================
```

### 3.2. PLP (Product Listing) Loading Skeleton
Shows a static sidebar outline with text placeholding bars, side-by-side with card shimmers to avoid content flashing.

```
================================================================================
  Homepage / Collections / [====]
================================================================================
  FILTERS                      | SORT BY: [=======]
  -----------------------------+------------------------------------------------
  [v] FABRIC SHIMMER           | Showing ...
  [ ] [===============]        | 
  [ ] [==========]             | +------------------------+ +------------------------+
  [ ] [============]           | | ////////////////////   | | ////////////////////   |
                               | | /////  IMAGE   /////   | | /////  IMAGE   /////   |
  [v] COLOUR SHIMMER           | | ////////////////////   | | ////////////////////   |
  [ ] [========]               | | [==================]   | | [==================]   |
  [ ] [===========]            | | [=========]            | | [=========]            |
  [ ] [======]                 | +------------------------+ +------------------------+
                               | 
  [v] OCCASION SHIMMER         | +------------------------+ +------------------------+
  [ ] [==============]         | | ////////////////////   | | ////////////////////   |
  [ ] [=========]              | | /////  IMAGE   /////   | | /////  IMAGE   /////   |
  [ ] [===========]            | | ////////////////////   | | ////////////////////   |
                               | | [==================]   | | [==================]   |
  [v] PRICE RANGE              | | [=========]            | | [=========]            |
  [====================]       | +------------------------+ +------------------------+
================================================================================
```

### 3.3. PDP (Product Detail) Loading Skeleton
Splits columns cleanly, rendering image thumbnails and text details before data loads from database queries.

```
================================================================================
  Collections / [====] / [===============]
================================================================================
  +----------------------------+   [========== SAREE TITLE SHIMMER ==========]
  |                            |   [============= Ref Code =============]
  |    ////////////////////    |   [======= Price Box Shimmer =======]
  |    /////  IMAGE   /////    |   
  |    /// (Primary)  /////    |   Select Options:
  |    ////////////////////    |   [==========]  [==============]
  |                            |   
  +----------------------------+   [===============]  [===========]  [=========]
   [■] [■] [■] [■] (Thumbs)
                                   PRODUCT DETAILS SHIMMER
  --------------------------------- [====================================]
  *Care Instructions*              [=========================]
  [====================]           [===============================]
  [==============================]   [===============]
  ---------------------------------
================================================================================
```

