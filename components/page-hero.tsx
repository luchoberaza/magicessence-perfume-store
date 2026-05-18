"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Sparkles } from "lucide-react"
import { GlowOrb } from "./home-animations"

interface PageHeroProps {
  title: string
  highlight: string
  subtitle: string
  backLink?: { href: string; label: string }
}

export function PageHero({ title, highlight, subtitle, backLink }: PageHeroProps) {
  const parts = title.split(new RegExp(`(${highlight})`, "i"))

  return (
    <section className="relative overflow-hidden border-b border-border/20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(265_55%_65%/0.1),transparent_60%)]" />
      <GlowOrb color="primary" size="md" className="-top-16 right-1/4" />
      <GlowOrb color="accent" size="sm" className="bottom-0 left-1/4" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(265 55% 65% / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(265 55% 65% / 0.4) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-16 lg:px-8 lg:pb-16 lg:pt-20">
        {/* Back link */}
        {backLink && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href={backLink.href}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/30 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLink.label}
            </Link>
          </motion.div>
        )}

        <div className="text-center">
          {/* Title */}
          <div className="overflow-hidden">
            <motion.h1
              className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            >
              {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                  <span
                    key={i}
                    className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                  >
                    {part}
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            className="mx-auto mt-4 max-w-lg text-muted-foreground lg:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {subtitle}
          </motion.p>

          {/* Decorative line */}
          <motion.div
            className="mx-auto mt-6 h-px max-w-xs bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </div>
      </div>
    </section>
  )
}
