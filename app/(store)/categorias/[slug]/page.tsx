import { notFound } from "next/navigation"
import { getCategoryBySlug, getProducts } from "@/lib/queries"
import { ProductCard } from "@/components/product-card"
import { PageHero } from "@/components/page-hero"
import { AnimatedProductGrid } from "@/components/animated-cards"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: "Categoria no encontrada" }
  return {
    title: category.name,
    description: `Descubri perfumes de tipo ${category.name} en Mistic Essence.`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const products = await getProducts({ categoryId: category.id })

  return (
    <div>
      <PageHero
        title={category.name}
        highlight={category.name}
        subtitle={`${products.length} ${products.length === 1 ? "fragancia" : "fragancias"} disponibles`}
        backLink={{ href: "/categorias", label: "Volver a categorias" }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm py-20 text-center">
            <p className="text-lg font-medium text-foreground">Sin productos por ahora</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Pronto vamos a sumar productos en esta categoria.
            </p>
          </div>
        ) : (
          <AnimatedProductGrid products={products} />
        )}
      </div>
    </div>
  )
}
