import { notFound } from "next/navigation"
import { getComboBySlug } from "@/lib/queries"
import { ComboBuilder } from "@/components/combo-builder"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const combo = await getComboBySlug(slug)
  if (!combo) return { title: "Combo no encontrado" }
  return {
    title: combo.name,
    description: combo.description || `Arma tu combo de ${combo.slots} perfumes en Mistic Essence.`,
    openGraph: {
      images: combo.image_url ? [combo.image_url] : [],
    },
  }
}

export default async function ComboPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const combo = await getComboBySlug(slug)
  if (!combo) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Link
        href="/combos"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a combos
      </Link>
      <ComboBuilder combo={combo} pool={combo.pool ?? []} />
    </div>
  )
}
