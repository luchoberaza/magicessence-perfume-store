"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Gift, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FloatingElement } from "./home-animations"
import { ShinyText } from "./effects"

const ease = [0.25, 0.4, 0.25, 1] as const

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      {/* El fondo animado vive en <SiteBackground/>; aca solo se refuerza el
          halo alrededor del logo y se funde el borde inferior. */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(265_55%_65%/0.12),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Ubicacion */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-primary backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5" />
              Salto, Uruguay
            </span>
          </motion.div>

          {/* Logo */}
          <FloatingElement duration={9} distance={8} className="mt-10">
            <motion.div
              className="relative mx-auto h-32 w-32 lg:h-40 lg:w-40"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.15, ease }}
            >
              <motion.span
                className="absolute inset-0 rounded-full bg-primary/25 blur-3xl"
                animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.12, 1] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              />
              <Image
                src="/logo-mistic.png"
                alt="Mistic Essence"
                width={300}
                height={300}
                priority
                className="relative h-full w-full rounded-full object-contain ring-1 ring-white/10 drop-shadow-[0_10px_40px_hsl(265_55%_65%/0.35)]"
              />
            </motion.div>
          </FloatingElement>

          {/* Titular: el tagline de la marca */}
          <div className="mt-10 overflow-hidden">
            <motion.h1
              className="text-balance text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease }}
            >
              Despertá tu{" "}
              <span className="relative whitespace-nowrap">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  esencia
                </span>
                <motion.span
                  className="absolute -bottom-1.5 left-0 h-[2px] bg-gradient-to-r from-primary via-accent to-transparent"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 1.1, ease }}
                />
              </span>
            </motion.h1>
          </div>

          {/* Bajada */}
          <motion.p
            className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            Perfumes premium, decants y combos armados por vos. Calidad, variedad
            y atencion cercana en Salto.
          </motion.p>

          {/* Acciones */}
          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button size="lg" className="group px-8 py-6 text-base" asChild>
                <Link href="/productos">
                  Explorar fragancias
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 bg-background/30 px-8 py-6 text-base backdrop-blur-sm hover:border-primary/60 hover:bg-primary/10"
                asChild
              >
                <Link href="/combos">
                  <Gift className="mr-2 h-4 w-4 text-primary" />
                  Armar mi combo
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Firma */}
          <motion.p
            className="mt-12 text-[11px] font-medium uppercase tracking-[0.35em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <ShinyText from="hsl(240 8% 45%)" to="hsl(265 55% 75%)" duration={6}>
              Mistic Essence
            </ShinyText>
          </motion.p>
        </div>
      </div>

      {/* Indicador de scroll */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground/60">
            Scroll
          </span>
          <div className="h-8 w-5 rounded-full border border-muted-foreground/30 p-1">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
