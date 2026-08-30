import { getFeaturedProducts, getCategories, getCombos } from "@/lib/queries"
import { HeroSection } from "@/components/hero-section"
import { FeaturedCarousel } from "@/components/featured-carousel"
import { ComboSpotlight } from "@/components/combo-spotlight"
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
  // `absolute` evita que el template del layout raiz agregue un segundo
  // "| Mistic Essence" al final del titulo de la pestaña.
  title: { absolute: "Mistic Essence | Perfumes Premium en Salto, Uruguay" },
  description: "Descubri fragancias exclusivas en Mistic Essence. Perfumes premium, decants y mas en Salto, Uruguay.",
}

export default async function HomePage() {
  const [featured, categories, combos] = await Promise.all([
    getFeaturedProducts(6),
    getCategories(),
    getCombos(),
  ])

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <HeroSection />

      {/* Novedad: combos armables */}
      <ComboSpotlight combos={combos} />

      {/* Numeros */}
      <StatsBanner />

      {/* Categorias */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <SectionHeader
          label="Categorias"
          title="Explora por estilo"
          description="Encontra la fragancia perfecta segun tu gusto"
        />
        <CategoriesGrid categories={categories} />
      </section>

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="relative border-t border-border/20">
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

      {/* Como comprar */}
      <section className="relative border-t border-border/20 bg-card/20 backdrop-blur-md">
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

      {/* Confianza */}
      <section className="relative border-t border-border/20">
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <TrustBadges />
        </div>
      </section>

      {/* Cierre */}
      <FinalCTA />
    </div>
  )
}
