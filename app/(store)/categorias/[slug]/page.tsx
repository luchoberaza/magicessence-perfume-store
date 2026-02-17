import { notFound } from "next/navigation"
import { getCategoryBySlug, getProducts } from "@/lib/queries"
import { ProductCard } from "@/components/product-card"
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
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Link
        href="/categorias"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a categorias
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
        <p className="mt-2 text-muted-foreground">
          {products.length} {products.length === 1 ? "producto" : "productos"}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl glass py-20 text-center">
          <p className="text-lg font-medium text-foreground">Sin productos por ahora</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pronto vamos a sumar productos en esta categoria.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
