import type { Metadata } from "next"
import { getProducts, getCategories } from "@/lib/queries"
import { PageHero } from "@/components/page-hero"
import { ProductsGrid } from "./products-grid"

export const metadata: Metadata = {
  title: "Productos",
  description: "Explora todos nuestros perfumes y fragancias premium.",
}

export default async function ProductosPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <div>
      <PageHero
        title="Todos los productos"
        highlight="productos"
        subtitle={`${products.length} ${products.length === 1 ? "fragancia" : "fragancias"} disponibles`}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <ProductsGrid initialProducts={products} categories={categories} />
      </div>
    </div>
  )
}
