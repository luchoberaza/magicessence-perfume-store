"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Check, Gift, Sparkles, Wand2 } from "lucide-react"
import { formatUYU } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import type { ComboWithDetails } from "@/lib/types"
import { GlowBorder, ScrollReveal, SpotlightCard, TiltCard } from "./effects"
import { FadeIn, StaggerContainer, StaggerItem } from "./home-animations"

const PASOS = [
  { icon: Gift, title: "Elegí el combo", desc: "Por cantidad, tamaño y familia" },
  { icon: Wand2, title: "Armalo a tu gusto", desc: "Vos elegís qué perfumes lleva" },
  { icon: Check, title: "Precio fijo", desc: "Lo que ves es lo que pagás" },
]

/**
 * Apartado de novedad del inicio: presenta los combos como lo nuevo del
 * catalogo, con uno destacado y el resto en lista. Reemplaza a la vieja franja
 * del final de la home.
 */
export function ComboSpotlight({ combos }: { combos: ComboWithDetails[] }) {
  if (combos.length === 0) return null

  // Se destaca el primero que efectivamente se pueda armar hoy.
  const destacado = combos.find((combo) => combo.available_count >= combo.slots) ?? combos[0]
  const resto = combos.filter((combo) => combo.id !== destacado.id).slice(0, 3)

  return (
    <section className="relative border-t border-border/20">
      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8">
        {/* Encabezado */}
        <div className="mb-10 text-center">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3 w-3" />
              Nuevo
            </span>
          </FadeIn>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground lg:text-5xl">
            <ScrollReveal text="Armá tu propio combo" />
          </h2>
          <FadeIn delay={0.2}>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Elegís cuántos perfumes querés, cuáles y te los llevás a un precio fijo.
            </p>
          </FadeIn>
        </div>

        {/* min-w-0 en las columnas: sin eso, el ancho minimo del contenido
            desborda la grilla en pantallas angostas. */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Combo destacado */}
          <FadeIn className="min-w-0">
            <TiltCard max={5} className="h-full min-w-0">
              <GlowBorder className="h-full rounded-3xl" duration={9}>
                <SpotlightCard
                  className="h-full rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md"
                  radius={420}
                  intensity={0.16}
                >
                  <Link href={`/combos/${destacado.slug}`} className="flex h-full flex-col">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-t-3xl bg-muted/40">
                      {destacado.image_url ? (
                        <img
                          src={destacado.image_url}
                          alt={destacado.name}
                          className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-accent/10">
                          <Gift className="h-12 w-12 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/70 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-md">
                        <Gift className="h-3 w-3" />
                        {destacado.slots} perfumes a elección
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <h3 className="text-pretty text-xl font-bold leading-tight text-foreground lg:text-2xl">
                        {destacado.name}
                      </h3>
                      {destacado.description && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {destacado.description}
                        </p>
                      )}

                      {destacado.categories?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {destacado.categories.map((cat) => (
                            <span
                              key={cat.id}
                              className="rounded-full border border-border/60 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-4">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                            Precio fijo
                          </p>
                          <p className="text-3xl font-bold text-foreground">
                            {formatUYU(destacado.price_int)}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-300 group-hover:translate-x-1">
                          Armar este combo
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </SpotlightCard>
              </GlowBorder>
            </TiltCard>
          </FadeIn>

          {/* Como funciona + resto de combos */}
          <div className="flex min-w-0 flex-col gap-6">
            <FadeIn delay={0.1}>
              <div className="rounded-3xl border border-border/40 bg-card/30 p-6 backdrop-blur-md">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Cómo funciona
                </p>
                <div className="mt-5 flex flex-col gap-5">
                  {PASOS.map((paso, i) => (
                    <motion.div
                      key={paso.title}
                      className="flex items-start gap-4"
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <paso.icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{paso.title}</p>
                        <p className="text-xs text-muted-foreground">{paso.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {resto.length > 0 && (
              <StaggerContainer className="flex flex-col gap-3" staggerDelay={0.08}>
                {resto.map((combo) => (
                  <StaggerItem key={combo.id}>
                    <Link
                      href={`/combos/${combo.slug}`}
                      className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card/25 p-3 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-card/50"
                    >
                      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted/40">
                        {combo.image_url ? (
                          <img
                            src={combo.image_url}
                            alt={combo.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center">
                            <Gift className="h-5 w-5 text-primary/40" />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {combo.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {combo.slots} perfumes a elección
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-base font-bold text-foreground">
                          {formatUYU(combo.price_int)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                          Ver
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </span>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}

            <FadeIn delay={0.3}>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-primary/30 bg-background/20 backdrop-blur-sm hover:border-primary/60 hover:bg-primary/10"
                asChild
              >
                <Link href="/combos">
                  Ver los {combos.length} combos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
