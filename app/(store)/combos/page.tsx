import { getCombos } from "@/lib/queries"
import { PageHero } from "@/components/page-hero"
import { AnimatedComboGrid } from "@/components/animated-combos"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Combos",
  description: "Arma tu combo de perfumes: elegi los que quieras y pagas un precio fijo.",
}

export default async function CombosPage() {
  const combos = await getCombos()

  return (
    <div>
      <PageHero
        title="Combos"
        highlight="Combos"
        subtitle="Elegi los perfumes que quieras y llevatelos a un precio fijo"
      />

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        {combos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm py-20 text-center">
            <p className="text-lg font-medium text-foreground">Aun no hay combos</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Pronto vamos a estar armando nuevas promociones.
            </p>
          </div>
        ) : (
          <AnimatedComboGrid combos={combos} />
        )}
      </div>
    </div>
  )
}
