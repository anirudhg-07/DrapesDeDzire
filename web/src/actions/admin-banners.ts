"use server";

import { revalidatePath } from "next/cache";
import { prisma, isDbConfigured } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { BannerType } from "@prisma/client";

// Ensure Cloudinary is configured (if not already done globally)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function isCloudinaryConfigured() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) return false;
  if (cn.includes("your-cloud-name") || ak.includes("xxxx") || as.includes("xxxx")) return false;
  return true;
}

// ─── Get Banners ──────────────────────────────────────────────────────────────
export async function getBannersByTypeAction(type: BannerType) {
  if (!isDbConfigured()) return { success: true, banners: [] };
  
  try {
    const banners = await prisma.banner.findMany({
      where: { type, isActive: true },
      orderBy: { orderNum: "asc" },
    });
    return { success: true, banners };
  } catch (err: unknown) {
    console.error(`getBannersByTypeAction error [${type}]:`, err);
    return { success: false, error: "Failed to fetch banners.", banners: [] };
  }
}

// ─── Create Banner ────────────────────────────────────────────────────────────
export async function createBannerAction(data: {
  imageUrl: string;
  publicId: string;
  type: BannerType;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  redirectUrl?: string;
  accentColor?: string;
  orderNum?: number;
}) {
  if (!isDbConfigured()) return { success: false, error: "Database not configured." };

  try {
    await verifyAdmin();

    const banner = await prisma.banner.create({
      data: {
        imageUrl: data.imageUrl,
        publicId: data.publicId,
        type: data.type,
        title: data.title || null,
        subtitle: data.subtitle || null,
        description: data.description || null,
        ctaText: data.ctaText || null,
        redirectUrl: data.redirectUrl || null,
        accentColor: data.accentColor || null,
        orderNum: data.orderNum || 0,
        isActive: true,
      },
    });

    revalidatePath("/");
    return { success: true, banner };
  } catch (err: unknown) {
    console.error("createBannerAction error:", err);
    const message = err instanceof Error ? err.message : "Failed to create banner.";
    return { success: false, error: message };
  }
}

// ─── Update Banner ────────────────────────────────────────────────────────────
export async function updateBannerAction(id: string, data: {
  imageUrl?: string;
  publicId?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  redirectUrl?: string;
  accentColor?: string;
  orderNum?: number;
  isActive?: boolean;
}) {
  if (!isDbConfigured()) return { success: false, error: "Database not configured." };

  try {
    await verifyAdmin();

    // If replacing image, we should probably delete the old Cloudinary asset, but
    // for simplicity we won't aggressively delete old assets on update unless specifically requested,
    // to avoid accidental deletions of active images if multiple banners share them.

    await prisma.banner.update({
      where: { id },
      data,
    });

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("updateBannerAction error:", err);
    const message = err instanceof Error ? err.message : "Failed to update banner.";
    return { success: false, error: message };
  }
}

// ─── Delete Banner ────────────────────────────────────────────────────────────
export async function deleteBannerAction(id: string) {
  if (!isDbConfigured()) return { success: false, error: "Database not configured." };

  try {
    await verifyAdmin();

    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) return { success: false, error: "Banner not found." };

    await prisma.banner.delete({ where: { id } });

    // Attempt to delete from Cloudinary
    if (isCloudinaryConfigured() && banner.publicId && !banner.publicId.startsWith('mock_')) {
      try {
        await cloudinary.uploader.destroy(banner.publicId);
      } catch (cloudErr) {
        console.warn("Cloudinary cleanup warning:", cloudErr);
      }
    }

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("deleteBannerAction error:", err);
    const message = err instanceof Error ? err.message : "Failed to delete banner.";
    return { success: false, error: message };
  }
}
