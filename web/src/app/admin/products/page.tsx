// src/app/admin/products/page.tsx
import { getProducts } from "@/lib/db-catalog";
import AdminProductsTable from "./AdminProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts({});
  return <AdminProductsTable products={products} />;
}
