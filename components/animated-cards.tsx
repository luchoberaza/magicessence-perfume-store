"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "./product-card"
import type { Category, ProductWithDetails } from "@/lib/types"

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export function AnimatedCategoryCard({ categories }: { categories: Category[] }) {
  return (
    <motion.div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {categories.map((cat) => (
        <motion.div key={cat.id} variants={cardVariants}>
          <Link
            href={`/categorias/${cat.slug}`}
            className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_40px_hsl(265_55%_65%/0.1)]"
          >
            {/* Background image */}
            {cat.image_url && (
              <img
                src={cat.image_url}
                alt={cat.name}
                className="absolute inset-0 h-full w-full object-cover opacity-25 transition-all duration-700 group-hover:opacity-40 group-hover:scale-110"
              />
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Content */}
            <div className="relative z-10">
              <motion.h2
                className="text-xl font-bold text-foreground lg:text-2xl"
                layoutId={`cat-title-${cat.slug}`}
              >
                {cat.name}
              </motion.h2>
              <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all group-hover:gap-2.5">
                Ver productos
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>

            {/* Corner glow on hover */}
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}

export function AnimatedProductGrid({ products }: { products: ProductWithDetails[] }) {
  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={cardVariants}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  )
}
