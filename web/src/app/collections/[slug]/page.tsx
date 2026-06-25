// src/app/collections/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getProducts, getCategories } from "@/lib/db-catalog";
import PLPClient from "@/components/products/PLPClient";
import { groupForSlug, PARENT_LABELS } from "@/lib/category-groups";

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
  const slug = resolvedParams.slug;

  const categories = await getCategories();
  const group = groupForSlug(slug);
  let category = categories.find((c) => c.slug === slug);

  // A parent collection (e.g. "kurta-set") or a known sub-category (e.g. "bangles")
  // may have no DB category record yet. Synthesize a header so it renders (possibly
  // empty) instead of 404-ing.
  if (!category && group) {
    const childLabel = group.children.find((c) => c.slug === slug)?.label;
    const name = childLabel || PARENT_LABELS[slug] || slug.replace(/-/g, " ");
    category = {
      id: slug,
      name,
      slug,
      description: `Explore our ${name} collection.`,
    } as (typeof categories)[number];
  }

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
    categorySlug: slug,
    fabrics,
    colours,
    occasions,
    priceMin,
    priceMax,
    sort,
  });

  // Sub-category chips for kurta/jewellery groups (parent + child pages)
  const subNav = group
    ? { parentSlug: group.parentSlug, parentLabel: PARENT_LABELS[group.parentSlug] || group.parentSlug, children: group.children, activeSlug: slug }
    : undefined;

  // Build filter facets from the FULL (unfiltered) category set so the filter
  // options always reflect the real data — colours, fabrics and occasions that
  // actually exist for this category.
  const allInCategory = await getProducts({ categorySlug: slug });
  const fabricSet = new Set<string>();
  const colourSet = new Set<string>();
  const occasionSet = new Set<string>();
  for (const p of allInCategory) {
    const colourName = p.colour.includes(":") ? p.colour.split(":")[1] : p.colour;
    if (colourName && colourName.trim() && colourName.toUpperCase() !== "N/A") colourSet.add(colourName.trim());
    if (p.fabric && p.fabric.toUpperCase() !== "N/A") fabricSet.add(p.fabric);
    if (p.occasion && p.occasion.trim()) occasionSet.add(p.occasion.trim());
  }

  return (
    <PLPClient
      initialProducts={products}
      categories={categories}
      categoryTitle={`${category.name} Collection`}
      categoryDescription={category.description}
      subNav={subNav}
      availableFabrics={[...fabricSet].sort()}
      availableColours={[...colourSet].sort()}
      availableOccasions={[...occasionSet].sort()}
    />
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
