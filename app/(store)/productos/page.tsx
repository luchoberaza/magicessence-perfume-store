import type { Metadata } from "next"
import { getProducts, getCategories } from "@/lib/queries"
import { ProductsGrid } from "./products-grid"

export const metadata: Metadata = {
  title: "Productos",
  description: "Explora todos nuestros perfumes y fragancias premium.",
}

export default async function ProductosPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Todos los productos</h1>
        <p className="mt-2 text-muted-foreground">
          {products.length} {products.length === 1 ? "fragancia" : "fragancias"} disponibles
        </p>
      </div>
      <ProductsGrid initialProducts={products} categories={categories} />
    </div>
  )
}
