// src/actions/admin-media.ts
"use server";

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

// Only assets older than this are eligible for cleanup, so an image you're
// currently uploading (but haven't saved yet) can never be deleted.
const SAFETY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

const FOLDER_PREFIX = "drapes-de-dzire/";

type CloudResource = { public_id: string; bytes: number; created_at: string };

// Gather every public_id currently referenced in the database.
async function getReferencedPublicIds(): Promise<Set<string>> {
  const [productImages, banners] = await Promise.all([
    prisma.productImage.findMany({ select: { publicId: true } }),
    prisma.banner.findMany({ select: { publicId: true } }),
  ]);
  const set = new Set<string>();
  for (const p of productImages) if (p.publicId) set.add(p.publicId);
  for (const b of banners) if (b.publicId) set.add(b.publicId);
  return set;
}

// List every Cloudinary asset under our app folder (paginated).
async function listAllCloudinaryAssets(): Promise<CloudResource[]> {
  const all: CloudResource[] = [];
  let nextCursor: string | undefined = undefined;
  do {
    const res: { resources: CloudResource[]; next_cursor?: string } = await cloudinary.api.resources({
      type: "upload",
      prefix: FOLDER_PREFIX,
      max_results: 500,
      next_cursor: nextCursor,
    });
    all.push(...res.resources);
    nextCursor = res.next_cursor;
  } while (nextCursor);
  return all;
}

export interface OrphanScanResult {
  success: boolean;
  error?: string;
  totalAssets?: number;
  referenced?: number;
  orphans?: { publicId: string; bytes: number; createdAt: string }[];
  orphanBytes?: number;
  skippedRecent?: number; // orphan-looking but within safety window
}

// Read-only: report which Cloudinary assets are not referenced in the DB.
export async function scanOrphanImagesAction(): Promise<OrphanScanResult> {
  try {
    await verifyAdmin();
    if (!isDbConfigured()) return { success: false, error: "Database not configured." };
    if (!isCloudinaryConfigured()) return { success: false, error: "Cloudinary is not configured." };

    const [referenced, assets] = await Promise.all([getReferencedPublicIds(), listAllCloudinaryAssets()]);

    const cutoff = Date.now() - SAFETY_WINDOW_MS;
    const orphans: { publicId: string; bytes: number; createdAt: string }[] = [];
    let skippedRecent = 0;

    for (const a of assets) {
      if (referenced.has(a.public_id)) continue;
      // Unreferenced — but protect very recent uploads (in-progress adds)
      if (new Date(a.created_at).getTime() > cutoff) {
        skippedRecent++;
        continue;
      }
      orphans.push({ publicId: a.public_id, bytes: a.bytes, createdAt: a.created_at });
    }

    return {
      success: true,
      totalAssets: assets.length,
      referenced: referenced.size,
      orphans,
      orphanBytes: orphans.reduce((sum, o) => sum + (o.bytes || 0), 0),
      skippedRecent,
    };
  } catch (err: unknown) {
    console.error("scanOrphanImagesAction error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Scan failed." };
  }
}

// Delete the given public_ids — but re-checks the DB first so we never remove
// anything that got referenced between the scan and the click.
export async function deleteOrphanImagesAction(
  publicIds: string[]
): Promise<{ success: boolean; deleted?: number; error?: string }> {
  try {
    await verifyAdmin();
    if (!isDbConfigured()) return { success: false, error: "Database not configured." };
    if (!isCloudinaryConfigured()) return { success: false, error: "Cloudinary is not configured." };
    if (!publicIds || publicIds.length === 0) return { success: true, deleted: 0 };

    // Re-check: drop any id that is now referenced (race safety)
    const referenced = await getReferencedPublicIds();
    const toDelete = publicIds.filter((id) => id && !referenced.has(id));
    if (toDelete.length === 0) return { success: true, deleted: 0 };

    // Cloudinary's batch delete accepts up to 100 ids per call.
    let deleted = 0;
    for (let i = 0; i < toDelete.length; i += 100) {
      const batch = toDelete.slice(i, i + 100);
      const res = await cloudinary.api.delete_resources(batch);
      // res.deleted is a map of publicId -> "deleted" | "not_found"
      deleted += Object.values(res.deleted || {}).filter((v) => v === "deleted").length;
    }

    return { success: true, deleted };
  } catch (err: unknown) {
    console.error("deleteOrphanImagesAction error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Delete failed." };
  }
}
