import Link from "next/link"
import { getCategories } from "@/lib/queries"
import { PageHero } from "@/components/page-hero"
import { AnimatedCategoryCard } from "@/components/animated-cards"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Categorias",
  description: "Explora nuestras categorias de perfumes y fragancias.",
}

export default async function CategoriasPage() {
  const categories = await getCategories()

  return (
    <div>
      <PageHero
        title="Categorias"
        highlight="Categorias"
        subtitle="Explora nuestros tipos de fragancias y encontra tu estilo"
      />

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm py-20 text-center">
            <p className="text-lg font-medium text-foreground">Aun no hay categorias</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Pronto vamos a estar sumando nuevas categorias.
            </p>
          </div>
        ) : (
          <AnimatedCategoryCard categories={categories} />
        )}
      </div>
    </div>
  )
}
