"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ShoppingBag, MessageCircle, Star, Truck, Shield, Droplets, Sparkles, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Category, ComboWithDetails } from "@/lib/types"
import { ComboCard } from "./combo-card"
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  TextReveal,
  GlowOrb,
  CountUp,
  MagneticButton,
} from "./home-animations"

function SectionHeader({
  label,
  title,
  description,
}: {
  label: string
  title: string
  description: string
}) {
  return (
    <div className="mb-12 text-center">
      <FadeIn>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-primary">
          <Sparkles className="h-3 w-3" />
          {label}
        </span>
      </FadeIn>
      <TextReveal delay={0.1} className="mt-4">
        <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
          {title}
        </h2>
      </TextReveal>
      <FadeIn delay={0.2}>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {description}
        </p>
      </FadeIn>
    </div>
  )
}

function StatsBanner() {
  const stats = [
    { value: 200, suffix: "+", label: "Fragancias" },
    { value: 50, suffix: "+", label: "Marcas" },
    { value: 1000, suffix: "+", label: "Clientes" },
    { value: 5, suffix: "", label: "Estrellas" },
  ]

  return (
    <section className="relative border-y border-border/20 bg-card/30 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground lg:text-4xl">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoriesGrid({ categories }: { categories: Category[] }) {
  const categoryMeta: Record<string, { icon: string; gradient: string }> = {
    masculinos: { icon: "M", gradient: "from-blue-500/20 to-cyan-500/10" },
    femeninos: { icon: "F", gradient: "from-pink-500/20 to-rose-500/10" },
    unisex: { icon: "U", gradient: "from-emerald-500/20 to-teal-500/10" },
    decants: { icon: "D", gradient: "from-amber-500/20 to-orange-500/10" },
  }

  const fallbackGradients = [
    "from-violet-500/20 to-purple-500/10",
    "from-sky-500/20 to-blue-500/10",
    "from-lime-500/20 to-green-500/10",
    "from-red-500/20 to-rose-500/10",
  ]

  return (
    <StaggerContainer
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      staggerDelay={0.1}
    >
      {categories.slice(0, 8).map((cat, i) => {
        const slug = cat.slug?.toLowerCase() || ""
        const meta = categoryMeta[slug] || {
          icon: cat.name.charAt(0).toUpperCase(),
          gradient: fallbackGradients[i % fallbackGradients.length],
        }

        return (
          <StaggerItem key={cat.id}>
            <Link
              href={`/categorias/${cat.slug}`}
              className="group relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-8 text-center backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:bg-card/50 hover:shadow-[0_0_40px_hsl(265_55%_65%/0.08)]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
              <motion.div
                className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary transition-colors duration-300 group-hover:bg-primary/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  meta.icon
                )}
              </motion.div>
              <div className="relative">
                <span className="text-sm font-semibold text-foreground">
                  {cat.name}
                </span>
              </div>
            </Link>
          </StaggerItem>
        )
      })}
    </StaggerContainer>
  )
}

function HowToBuySteps() {
  const steps = [
    {
      step: "01",
      title: "Elegi",
      desc: "Explora nuestro catalogo y encontra la fragancia que va con vos.",
      icon: ShoppingBag,
      gradient: "from-blue-500/10 to-primary/10",
    },
    {
      step: "02",
      title: "Agrega al carrito",
      desc: "Selecciona la variante que prefieras y sumala al carrito.",
      icon: ArrowRight,
      gradient: "from-primary/10 to-accent/10",
    },
    {
      step: "03",
      title: "Confirma por WhatsApp",
      desc: "Envia tu pedido directo a nuestro WhatsApp y coordinamos la entrega.",
      icon: MessageCircle,
      gradient: "from-emerald-500/10 to-primary/10",
    },
  ]

  return (
    <StaggerContainer className="grid gap-6 sm:grid-cols-3" staggerDelay={0.15}>
      {steps.map((item, i) => (
        <StaggerItem key={item.step}>
          <div className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-8 text-center backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:bg-card/50 hover:shadow-[0_0_30px_hsl(265_55%_65%/0.08)]">
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

            {/* Step number */}
            <span className="relative mb-4 text-5xl font-black text-primary/10 transition-colors duration-300 group-hover:text-primary/20">
              {item.step}
            </span>

            {/* Icon */}
            <motion.div
              className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <item.icon className="h-6 w-6" />
            </motion.div>

            <h3 className="relative text-lg font-bold text-foreground">{item.title}</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.desc}
            </p>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-gradient-to-r from-primary/30 to-transparent sm:block" />
            )}
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}

function TrustBadges() {
  const badges = [
    {
      icon: Droplets,
      title: "100% Premium",
      desc: "Fragancias de la mas alta calidad",
    },
    {
      icon: Truck,
      title: "Envios a todo Uruguay",
      desc: "Recibilo donde estes",
    },
    {
      icon: Shield,
      title: "Compra segura",
      desc: "Atencion personalizada",
    },
    {
      icon: Heart,
      title: "Satisfaccion garantizada",
      desc: "Tu esencia es lo primero",
    },
  ]

  return (
    <>
      <div className="mb-12 text-center">
        <FadeIn>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-primary">
            <Star className="h-3 w-3" />
            Por que elegirnos
          </span>
        </FadeIn>
      </div>
      <StaggerContainer className="grid grid-cols-2 gap-6 lg:grid-cols-4" staggerDelay={0.1}>
        {badges.map((badge) => (
          <StaggerItem key={badge.title}>
            <div className="group flex flex-col items-center gap-3 rounded-2xl border border-border/30 bg-card/20 p-6 text-center transition-all duration-300 hover:border-primary/20 hover:bg-card/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <badge.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{badge.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{badge.desc}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </>
  )
}

function CatalogCTA() {
  return (
    <FadeIn delay={0.3} className="mt-10 text-center">
      <MagneticButton>
        <Button variant="outline" size="lg" className="border-primary/30 hover:border-primary/60 hover:bg-primary/5" asChild>
          <Link href="/productos">
            Ver todo el catalogo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </MagneticButton>
    </FadeIn>
  )
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-border/20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-background to-accent/[0.05]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(265_55%_65%/0.08),transparent_60%)]" />
      <GlowOrb color="primary" size="lg" className="top-0 left-1/4" />
      <GlowOrb color="accent" size="md" className="bottom-0 right-1/4" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <FadeIn>
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
          </FadeIn>
          <TextReveal delay={0.1} className="mt-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-5xl">
              Encontra tu{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                fragancia ideal
              </span>
            </h2>
          </TextReveal>
          <FadeIn delay={0.3}>
            <p className="mt-4 text-muted-foreground lg:text-lg">
              Explora nuestra coleccion y descubri la esencia que te representa.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton>
                <Button size="lg" className="px-8 py-6 text-base" asChild>
                  <Link href="/productos">
                    Explorar ahora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-base border-primary/30"
                  asChild
                >
                  <Link href="/contacto">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contactanos
                  </Link>
                </Button>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

/**
 * Franja de combos del home. Solo se renderiza si hay combos activos; muestra
 * los primeros y manda a /combos.
 */
function CombosStrip({ combos }: { combos: ComboWithDetails[] }) {
  if (combos.length === 0) return null

  return (
    <section className="relative overflow-hidden border-t border-border/20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-background to-accent/[0.04]" />
      <GlowOrb color="accent" size="md" className="-top-10 right-1/4" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <SectionHeader
          label="Combos"
          title="Arma tu combo"
          description="Elegi los perfumes que quieras y llevatelos a un precio fijo"
        />

        <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {combos.slice(0, 3).map((combo) => (
            <StaggerItem key={combo.id}>
              <ComboCard combo={combo} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.3} className="mt-10 text-center">
          <MagneticButton>
            <Button
              variant="outline"
              size="lg"
              className="border-primary/30 hover:border-primary/60 hover:bg-primary/5"
              asChild
            >
              <Link href="/combos">
                Ver todos los combos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </MagneticButton>
        </FadeIn>
      </div>
    </section>
  )
}

export {
  SectionHeader,
  StatsBanner,
  CategoriesGrid,
  CombosStrip,
  HowToBuySteps,
  TrustBadges,
  CatalogCTA,
  FinalCTA,
}
