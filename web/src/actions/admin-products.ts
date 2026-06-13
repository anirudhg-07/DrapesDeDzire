// src/actions/admin-products.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma, isDbConfigured } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isCloudinaryConfigured() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) return false;
  if (cn.includes("your-cloud-name") || ak.includes("xxxx") || as.includes("xxxx")) return false;
  return true;
}

// ─── Upload Image to Cloudinary ─────────────────────────────────────────────
export async function uploadImageToCloudinaryAction(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}> {
  try {
    await verifyAdmin();

    if (!isCloudinaryConfigured()) {
      return { success: false, error: "Cloudinary credentials are not configured in .env." };
    }

    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "No file provided." };

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      // Setup a timeout to prevent hanging forever
      const timeoutId = setTimeout(() => {
        reject(new Error("Cloudinary upload timed out after 15 seconds. Please check your API keys and internet connection."));
      }, 15000);

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "drapes-de-dzire/products",
          resource_type: "image",
          transformation: [{ width: 1200, height: 1600, crop: "limit", quality: "auto:good" }],
        },
        (error, result) => {
          clearTimeout(timeoutId);
          if (error || !result) reject(error || new Error("Upload failed"));
          else resolve(result as { secure_url: string; public_id: string });
        }
      );
      
      stream.on("error", (err) => {
        clearTimeout(timeoutId);
        reject(err);
      });

      stream.end(buffer);
    });

    return { success: true, url: result.secure_url, publicId: result.public_id };
  } catch (err: unknown) {
    console.error("uploadImageToCloudinaryAction error:", err);
    const message = err instanceof Error ? err.message : "Upload failed.";
    return { success: false, error: message };
  }
}

// ─── Create Product ───────────────────────────────────────────────────────────
export async function createProductAction(data: {
  name: string;
  description: string;
  basePrice: number;
  fabric: string;
  colour: string;
  occasion: string;
  stock: number;
  careInstructions: string;
  deliveryInfo?: string;
  returnPolicy?: string;
  variantGroupId?: string;
  images: Array<{ url: string; publicId: string; isPrimary: boolean }>;
}): Promise<{ success: boolean; productId?: string; error?: string }> {
  if (!isDbConfigured()) return { success: false, error: "Database not configured." };

  try {
    await verifyAdmin();

    // Auto-derive slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + Date.now() + Math.floor(Math.random() * 1000);

    // Auto-seed category based on fabric/occasion
    const categoryName = data.occasion === "Bridal"
      ? "Bridal Special"
      : data.occasion === "Designer"
      ? "Designer Wear"
      : data.fabric;

    const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: {
        name: categoryName,
        slug: categorySlug,
        description: `${categoryName} sarees — handpicked for the discerning woman.`,
      },
    });

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        basePrice: data.basePrice,
        fabric: data.fabric,
        colour: data.colour,
        occasion: data.occasion,
        stock: data.stock,
        careInstructions: data.careInstructions,
        deliveryInfo: data.deliveryInfo || null,
        returnPolicy: data.returnPolicy || null,
        isActive: true,
        categoryId: category.id,
        variantGroupId: data.variantGroupId || null,
        images: {
          create: data.images.map((img, idx) => ({
            imageUrl: img.url,
            publicId: img.publicId,
            isPrimary: idx === 0,
            orderNum: idx,
          })),
        },
      },
    });

    revalidatePath("/products");
    revalidatePath("/collections");

    return { success: true, productId: product.id };
  } catch (err: unknown) {
    console.error("createProductAction error:", err);
    const message = err instanceof Error ? err.message : "Failed to create product.";
    return { success: false, error: message };
  }
}

// ─── Update Product ───────────────────────────────────────────────────────────
export async function updateProductAction(
  id: string,
  data: {
    name?: string;
    description?: string;
    basePrice?: number;
    fabric?: string;
    colour?: string;
    occasion?: string;
    stock?: number;
    careInstructions?: string;
    deliveryInfo?: string;
    returnPolicy?: string;
    isActive?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!isDbConfigured()) return { success: false, error: "Database not configured." };

  try {
    await verifyAdmin();

    await prisma.product.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    revalidatePath("/collections");

    return { success: true };
  } catch (err: unknown) {
    console.error("updateProductAction error:", err);
    const message = err instanceof Error ? err.message : "Failed to update product.";
    return { success: false, error: message };
  }
}

// ─── Delete Product ───────────────────────────────────────────────────────────
export async function deleteProductAction(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isDbConfigured()) return { success: false, error: "Database not configured." };

  try {
    await verifyAdmin();

    // Get Cloudinary publicIds before deleting to clean up assets
    const images = await prisma.productImage.findMany({ where: { productId: id } });

    await prisma.product.delete({ where: { id } });

    // Attempt to delete from Cloudinary (non-fatal if it fails)
    if (isCloudinaryConfigured() && images.length > 0) {
      try {
        await Promise.all(
          images.map((img) => cloudinary.uploader.destroy(img.publicId))
        );
      } catch (cloudErr) {
        console.warn("Cloudinary cleanup warning:", cloudErr);
      }
    }

    revalidatePath("/products");
    revalidatePath("/collections");

    return { success: true };
  } catch (err: unknown) {
    console.error("deleteProductAction error:", err);
    const message = err instanceof Error ? err.message : "Failed to delete product.";
    return { success: false, error: message };
  }
}
