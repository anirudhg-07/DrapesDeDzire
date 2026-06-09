// src/types/checkout.ts
// Zod schemas and types for checkout flow

import { z } from "zod";

export const AddressSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  alternatePhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .optional()
    .or(z.literal("")),
  line1: z.string().min(5, "Address line 1 must be at least 5 characters"),
  line2: z.string().optional().or(z.literal("")),
  landmark: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
});

export type AddressInput = z.infer<typeof AddressSchema>;

export const CheckoutPayloadSchema = z.object({
  address: AddressSchema,
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Cart cannot be empty"),
});

export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;

export const PaymentVerificationSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
  internalOrderId: z.string(),
});

export type PaymentVerificationPayload = z.infer<typeof PaymentVerificationSchema>;

// Indian states list for the address form dropdown
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];
