// src/app/products/page.tsx
import { getProducts, getCategories } from "@/lib/db-catalog";
import PLPClient from "@/components/products/PLPClient";
import { isAdmin } from "@/lib/auth";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    fabric?: string;
    colour?: string;
    occasion?: string;
    priceMin?: string;
    priceMax?: string;
    sort?: string;
  }>;
}

export default async function ProductsSearchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  
  const search = resolvedSearchParams.search || "";
  const fabrics = resolvedSearchParams.fabric ? resolvedSearchParams.fabric.split(",") : [];
  const colours = resolvedSearchParams.colour ? resolvedSearchParams.colour.split(",") : [];
  const occasions = resolvedSearchParams.occasion ? resolvedSearchParams.occasion.split(",") : [];
  const priceMin = resolvedSearchParams.priceMin ? Number(resolvedSearchParams.priceMin) : undefined;
  const priceMax = resolvedSearchParams.priceMax ? Number(resolvedSearchParams.priceMax) : undefined;
  const sort = resolvedSearchParams.sort || "newest";

  const [products, categories, adminMode] = await Promise.all([
    getProducts({ search, fabrics, colours, occasions, priceMin, priceMax, sort }),
    getCategories(),
    isAdmin(),
  ]);

  const title = search ? `Search Results for "${search}"` : "All Sarees";
  const desc = search
    ? `Browse all handloom sarees matching your query. Found ${products.length} matching piece(s).`
    : "Indulge in our exquisite showcase of traditional masterloom silk sarees, hand-finished by master weavers from Kanchipuram, Varanasi, Chanderi, and across India.";

  return (
    <PLPClient
      initialProducts={products}
      categories={categories}
      categoryTitle={title}
      categoryDescription={desc}
      isAdmin={adminMode}
    />
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

