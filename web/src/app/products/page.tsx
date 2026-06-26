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

  const title = search ? `Search Results for "${search}"` : "All Products";
  const desc = search
    ? `Browse everything matching your query. Found ${products.length} matching piece(s).`
    : "Explore our complete collection — handwoven sarees, kurta sets and fine jewellery, crafted for every occasion.";

  return (
    <PLPClient
      initialProducts={products}
      categories={categories}
      categoryTitle={title}
      categoryDescription={desc}
      isAdmin={adminMode}
      itemNoun="pieces"
    />
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

