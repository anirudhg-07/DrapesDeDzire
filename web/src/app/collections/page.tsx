// src/app/collections/page.tsx
import { getProducts, getCategories } from "@/lib/db-catalog";
import PLPClient from "@/components/products/PLPClient";

interface PageProps {
  searchParams: Promise<{
    fabric?: string;
    colour?: string;
    occasion?: string;
    priceMin?: string;
    priceMax?: string;
    sort?: string;
  }>;
}

export default async function CollectionsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  
  // Parse parameter arrays
  const fabrics = resolvedSearchParams.fabric ? resolvedSearchParams.fabric.split(",") : [];
  const colours = resolvedSearchParams.colour ? resolvedSearchParams.colour.split(",") : [];
  const occasions = resolvedSearchParams.occasion ? resolvedSearchParams.occasion.split(",") : [];
  const priceMin = resolvedSearchParams.priceMin ? Number(resolvedSearchParams.priceMin) : undefined;
  const priceMax = resolvedSearchParams.priceMax ? Number(resolvedSearchParams.priceMax) : undefined;
  const sort = resolvedSearchParams.sort || "newest";

  const [products, categories] = await Promise.all([
    getProducts({ fabrics, colours, occasions, priceMin, priceMax, sort }),
    getCategories(),
  ]);

  return (
    <PLPClient
      initialProducts={products}
      categories={categories}
      categoryTitle="All Collections"
      categoryDescription="Indulge in our exquisite showcase of traditional masterloom silk sarees, hand-finished by master weavers from Kanchipuram, Varanasi, Chanderi, and across India."
    />
  );
}
export const dynamic = "force-dynamic";
export const revalidate = 0;
