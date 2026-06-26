// src/types/cart.ts
// Cart and CartItem type definitions

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  fabric: string;
  colour: string;
  stock: number;
  categorySlug?: string;
  images: {
    id: string;
    imageUrl: string;
    isPrimary: boolean;
    orderNum: number;
  }[];
}

export interface CartItemWithProduct {
  id: string;
  userId: string;
  productId: string;
  size: string; // "" for products without sizes
  quantity: number;
  createdAt: Date;
  product: CartProduct;
}

export interface CartSummary {
  items: CartItemWithProduct[];
  itemCount: number;
  subtotal: number;
}
