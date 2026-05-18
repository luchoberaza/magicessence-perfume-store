"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlowOrb, HeroParticles, FloatingElement } from "./home-animations"

export function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* Animated background layers */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(265_55%_65%/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(270_50%_55%/0.1),transparent_50%)]" />
      </div>

      {/* Animated glow orbs */}
      <GlowOrb color="primary" size="xl" className="-top-20 -right-20" />
      <GlowOrb color="accent" size="lg" className="bottom-20 -left-20" />
      <GlowOrb color="blue" size="md" className="top-1/3 right-1/4" />

      {/* Particles */}
      <HeroParticles />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(265 55% 65% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(265 55% 65% / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Salto, Uruguay
            </span>
          </motion.div>

          {/* Monogram */}
          <FloatingElement duration={8} distance={10} className="mt-8">
            <motion.img
              src="/monogram.png"
              alt=""
              aria-hidden="true"
              className="mx-auto h-24 w-auto mix-blend-lighten drop-shadow-[0_0_30px_hsl(265_55%_65%/0.4)] lg:h-32"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            />
          </FloatingElement>

          {/* Headline */}
          <div className="mt-8 overflow-hidden">
            <motion.h1
              className="text-balance text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-8xl"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
            >
              Tu fragancia,{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  tu esencia
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 h-[3px] bg-gradient-to-r from-primary via-accent to-transparent"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
                />
              </span>
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            Encontra perfumes exclusivos que reflejan tu personalidad.
            Calidad premium, variedad unica y atencion cercana.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="group relative overflow-hidden px-8 py-6 text-base" asChild>
                <Link href="/categorias">
                  <span className="relative z-10 flex items-center">
                    Explorar fragancias
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-base border-primary/30 hover:border-primary/60 hover:bg-primary/5"
                asChild
              >
                <Link href="/productos">Ver catalogo</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
            Scroll
          </span>
          <div className="h-8 w-5 rounded-full border border-muted-foreground/30 p-1">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
