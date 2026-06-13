// src/app/products/[id]/page.tsx
import { notFound } from "next/navigation";
import { getProductById, getRelatedProducts, getProductVariants } from "@/lib/db-catalog";
import PDPClient from "@/components/products/PDPClient";
import { isAdmin } from "@/lib/auth";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);
  
  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | Drapes De Dzire`,
    description: `${product.description.substring(0, 150)}... Saree blend: ${product.fabric}, Color: ${product.colour}.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0]?.imageUrl || "/og-image.jpg" }],
    },
  };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;

  const [product, adminMode] = await Promise.all([
    getProductById(resolvedParams.id),
    isAdmin(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(resolvedParams.id);
  const variants = product.variantGroupId 
    ? await getProductVariants(product.variantGroupId) 
    : [];

  return <PDPClient product={product} relatedProducts={relatedProducts} variants={variants} isAdmin={adminMode} />;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

