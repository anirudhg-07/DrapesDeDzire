// src/lib/db-catalog.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
// Dual-mode catalog service that queries Prisma/PostgreSQL or falls back to in-memory static catalog.

import { prisma, isDbConfigured } from "./prisma";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, Product, Category } from "./catalog";
import { slugsForCollection } from "./category-groups";

// Map Prisma product format to catalog format
const mapPrismaProduct = (p: any): Product => {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    basePrice: Number(p.basePrice),
    fabric: p.fabric,
    colour: p.colour,
    occasion: p.occasion,
    stock: p.stock,
    careInstructions: p.careInstructions,
    deliveryInfo: p.deliveryInfo,
    returnPolicy: p.returnPolicy,
    isActive: p.isActive,
    categoryId: p.categoryId,
    categorySlug: p.category?.slug,
    variantGroupId: p.variantGroupId,
    images: (p.images || []).map((img: any) => ({
      id: img.id,
      productId: img.productId,
      imageUrl: img.imageUrl,
      publicId: img.publicId,
      isPrimary: img.isPrimary,
      orderNum: img.orderNum,
    })),
    productSizes: (p.productSizes || []).map((s: any) => ({ size: s.size, stock: s.stock })),
  };
};

let isSeeding = false;
let isSeeded = false;

async function autoSeedDatabase() {
  try {
    console.log("Database is empty. Starting auto-seed...");

    // 1. Insert categories
    await prisma.category.createMany({
      data: MOCK_CATEGORIES.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || "",
      })),
      skipDuplicates: true,
    });

    console.log("Categories seeded successfully.");

    // 2. Insert products
    const productsData = MOCK_PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      basePrice: p.basePrice,
      fabric: p.fabric,
      colour: p.colour,
      occasion: p.occasion,
      stock: p.stock,
      careInstructions: p.careInstructions,
      deliveryInfo: p.deliveryInfo || null,
      returnPolicy: p.returnPolicy || null,
      isActive: p.isActive,
      categoryId: p.categoryId,
    }));

    await prisma.product.createMany({
      data: productsData,
      skipDuplicates: true,
    });

    console.log("Products seeded successfully.");

    // 3. Insert images
    const imagesData = MOCK_PRODUCTS.flatMap((p) =>
      p.images.map((img) => ({
        id: img.id,
        productId: img.productId,
        imageUrl: img.imageUrl,
        publicId: img.publicId,
        isPrimary: img.isPrimary,
        orderNum: img.orderNum,
      }))
    );

    await prisma.productImage.createMany({
      data: imagesData,
      skipDuplicates: true,
    });

    console.log("Product images seeded successfully. Auto-seed complete.");
  } catch (err) {
    console.error("Auto-seed failed:", err);
  }
}

async function ensureSeeded() {
  if (isSeeded || isSeeding) return;
  isSeeding = true;
  try {
    const count = await prisma.category.count();
    if (count === 0) {
      await autoSeedDatabase();
    }
    isSeeded = true;
  } catch (err) {
    console.error("ensureSeeded failed:", err);
  } finally {
    isSeeding = false;
  }
}

export async function getCategories(): Promise<Category[]> {
  if (isDbConfigured()) {
    try {
      await ensureSeeded();
      const dbCategories = await prisma.category.findMany();
      if (dbCategories.length > 0) {
        return dbCategories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || "",
        }));
      }
    } catch (err) {
      console.warn("Prisma Category query failed. Falling back to mock catalog:", err);
    }
  }
  return MOCK_CATEGORIES;
}

export interface GetProductsParams {
  fabrics?: string[];
  colours?: string[];
  occasions?: string[];
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sort?: string;
  categorySlug?: string;
}

export async function getProducts(params: GetProductsParams = {}): Promise<Product[]> {
  const { fabrics, colours, occasions, priceMin, priceMax, search, sort, categorySlug } = params;

  if (isDbConfigured()) {
    try {
      await ensureSeeded();
      // Build Prisma query filters
      const where: any = { isActive: true };

      if (categorySlug) {
        // A parent collection (e.g. "kurta-set") aggregates all of its child
        // sub-category slugs; a normal slug matches just itself.
        where.category = { slug: { in: slugsForCollection(categorySlug) } };
      }
      if (fabrics && fabrics.length > 0) {
        where.fabric = { in: fabrics };
      }
      if (colours && colours.length > 0) {
        // Colour is stored as "#hex:Name" (e.g. "#1B4F8A:Royal Blue"), so match the
        // name portion rather than an exact value.
        where.AND = [
          ...(Array.isArray(where.AND) ? where.AND : []),
          { OR: colours.map((c) => ({ colour: { contains: c, mode: "insensitive" } })) },
        ];
      }
      if (occasions && occasions.length > 0) {
        where.occasion = { in: occasions };
      }
      if (priceMin !== undefined || priceMax !== undefined) {
        where.basePrice = {};
        if (priceMin !== undefined) where.basePrice.gte = priceMin;
        if (priceMax !== undefined) where.basePrice.lte = priceMax;
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { fabric: { contains: search, mode: "insensitive" } },
          { colour: { contains: search, mode: "insensitive" } },
        ];
      }

      // Build sorting options
      let orderBy: any = { createdAt: "desc" };
      if (sort === "price-asc") {
        orderBy = { basePrice: "asc" };
      } else if (sort === "price-desc") {
        orderBy = { basePrice: "desc" };
      } else if (sort === "popular") {
        // Fall back to reviews count/rating once implemented, currently sorting by ID
        orderBy = { id: "asc" };
      }

      const dbProducts = await prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { orderNum: "asc" },
          },
          category: true,
        },
        orderBy,
      });

      if (dbProducts.length > 0) {
        return dbProducts.map(mapPrismaProduct);
      }
    } catch (err) {
      console.warn("Prisma Product query failed. Falling back to mock catalog:", err);
    }
  }

  // FALLBACK TO STATIC CATALOG
  let results = [...MOCK_PRODUCTS];

  // Apply filters
  if (categorySlug) {
    const allowed = slugsForCollection(categorySlug);
    results = results.filter((p) => p.categorySlug && allowed.includes(p.categorySlug));
  }
  if (fabrics && fabrics.length > 0) {
    results = results.filter((p) => fabrics.includes(p.fabric));
  }
  if (colours && colours.length > 0) {
    results = results.filter((p) => colours.some((c) => p.colour.toLowerCase().includes(c.toLowerCase())));
  }
  if (occasions && occasions.length > 0) {
    results = results.filter((p) => occasions.includes(p.occasion));
  }
  if (priceMin !== undefined) {
    results = results.filter((p) => p.basePrice >= priceMin);
  }
  if (priceMax !== undefined) {
    results = results.filter((p) => p.basePrice <= priceMax);
  }
  if (search) {
    const query = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.fabric.toLowerCase().includes(query) ||
        p.colour.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  if (sort === "price-asc") {
    results.sort((a, b) => a.basePrice - b.basePrice);
  } else if (sort === "price-desc") {
    results.sort((a, b) => b.basePrice - a.basePrice);
  } else if (sort === "popular") {
    results.sort((a, b) => a.id.localeCompare(b.id));
  } else {
    // default/newest: item index or ID reverse
    results.sort((a, b) => b.id.localeCompare(a.id));
  }

  return results;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isDbConfigured()) {
    try {
      await ensureSeeded();
      const dbProduct = await prisma.product.findUnique({
        where: { slug },
        include: {
          images: {
            orderBy: { orderNum: "asc" },
          },
          category: true,
          productSizes: { orderBy: { size: "asc" } },
        },
      });
      if (dbProduct) return mapPrismaProduct(dbProduct);
    } catch (err) {
      console.warn("Prisma Product slug query failed:", err);
    }
  }
  return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isDbConfigured()) {
    try {
      await ensureSeeded();
      const dbProduct = await prisma.product.findUnique({
        where: { id },
        include: {
          images: {
            orderBy: { orderNum: "asc" },
          },
          category: true,
          productSizes: { orderBy: { size: "asc" } },
        },
      });
      if (dbProduct) return mapPrismaProduct(dbProduct);
    } catch (err) {
      console.warn("Prisma Product ID query failed:", err);
    }
  }
  return MOCK_PRODUCTS.find((p) => p.id === id) || null;
}

export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  const currentProduct = await getProductById(productId);
  if (!currentProduct) return [];

  if (isDbConfigured()) {
    try {
      await ensureSeeded();
      const dbProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          id: { not: productId },
          OR: [
            { categoryId: currentProduct.categoryId },
            { fabric: currentProduct.fabric },
          ],
        },
        include: {
          images: {
            orderBy: { orderNum: "asc" },
          },
          category: true,
        },
        take: limit,
      });
      if (dbProducts.length > 0) return dbProducts.map(mapPrismaProduct);
    } catch (err) {
      console.warn("Prisma Related products query failed:", err);
    }
  }

  return MOCK_PRODUCTS.filter(
    (p) =>
      p.id !== productId &&
      (p.categoryId === currentProduct.categoryId || p.fabric === currentProduct.fabric)
  ).slice(0, limit);
}

export async function getProductVariants(groupId: string): Promise<Product[]> {
  if (!groupId) return [];

  if (isDbConfigured()) {
    try {
      await ensureSeeded();
      const dbProducts = await prisma.product.findMany({
        where: { variantGroupId: groupId, isActive: true },
        include: {
          images: { orderBy: { orderNum: "asc" } },
          category: true,
        },
        orderBy: { createdAt: "asc" },
      });
      if (dbProducts.length > 0) return dbProducts.map(mapPrismaProduct);
    } catch (err) {
      console.warn("Prisma Product Variants query failed:", err);
    }
  }
  return [];
}

