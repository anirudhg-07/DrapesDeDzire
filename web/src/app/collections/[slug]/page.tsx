// src/app/collections/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getProducts, getCategories } from "@/lib/db-catalog";
import PLPClient from "@/components/products/PLPClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    fabric?: string;
    colour?: string;
    occasion?: string;
    priceMin?: string;
    priceMax?: string;
    sort?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === resolvedParams.slug);

  if (!category) {
    notFound();
  }

  // Parse parameters
  const fabrics = resolvedSearchParams.fabric ? resolvedSearchParams.fabric.split(",") : [];
  const colours = resolvedSearchParams.colour ? resolvedSearchParams.colour.split(",") : [];
  const occasions = resolvedSearchParams.occasion ? resolvedSearchParams.occasion.split(",") : [];
  const priceMin = resolvedSearchParams.priceMin ? Number(resolvedSearchParams.priceMin) : undefined;
  const priceMax = resolvedSearchParams.priceMax ? Number(resolvedSearchParams.priceMax) : undefined;
  const sort = resolvedSearchParams.sort || "newest";

  const products = await getProducts({
    categorySlug: resolvedParams.slug,
    fabrics,
    colours,
    occasions,
    priceMin,
    priceMax,
    sort,
  });

  return (
    <PLPClient
      initialProducts={products}
      categories={categories}
      categoryTitle={`${category.name} Collection`}
      categoryDescription={category.description}
    />
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
