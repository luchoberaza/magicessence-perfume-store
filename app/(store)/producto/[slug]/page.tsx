import { notFound } from "next/navigation"
import { getProductBySlug } from "@/lib/queries"
import { ProductDetail } from "./product-detail"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Producto no encontrado" }
  return {
    title: product.name,
    description: product.description || `${product.name} por ${product.brand || "Mistic Essence"}`,
    openGraph: {
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Link
        href="/productos"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a productos
      </Link>
      <ProductDetail product={product} />
    </div>
  )
}
