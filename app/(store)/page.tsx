import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { getFeaturedProducts, getCategories } from "@/lib/queries"
import { HeroSection } from "@/components/hero-section"
import { FeaturedCarousel } from "@/components/featured-carousel"
import {
  SectionHeader,
  StatsBanner,
  CategoriesGrid,
  HowToBuySteps,
  TrustBadges,
  CatalogCTA,
  FinalCTA,
} from "@/components/home-sections"

export const metadata = {
  title: "Mistic Essence | Perfumes Premium en Salto, Uruguay",
  description: "Descubri fragancias exclusivas en Mistic Essence. Perfumes premium, decants y mas en Salto, Uruguay.",
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(6),
    getCategories(),
  ])

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <HeroSection />

      {/* Stats Ticker */}
      <StatsBanner />

      {/* Categories */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <SectionHeader
          label="Categorias"
          title="Explora por estilo"
          description="Encontra la fragancia perfecta segun tu gusto"
        />
        <CategoriesGrid categories={categories} />
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="relative border-t border-border/20">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8">
            <SectionHeader
              label="Seleccion especial"
              title="Descubri hoy"
              description="Nuestra seleccion curada de fragancias exclusivas"
            />
            <FeaturedCarousel products={featured.slice(0, 3)} />
            <CatalogCTA />
          </div>
        </section>
      )}

      {/* How to buy */}
      <section className="relative border-t border-border/20 bg-card/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(265_55%_65%/0.05),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <SectionHeader
            label="Simple y rapido"
            title="Como comprar"
            description="En tres pasos tenes tu fragancia favorita"
          />
          <HowToBuySteps />
        </div>
      </section>

      {/* Trust indicators */}
      <section className="relative border-t border-border/20">
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <TrustBadges />
        </div>
      </section>

      {/* Final CTA */}
      <FinalCTA />
    </div>
  )
}
