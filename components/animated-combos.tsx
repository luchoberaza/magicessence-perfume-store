"use client"

import { motion } from "framer-motion"
import { ComboCard } from "./combo-card"
import type { ComboWithDetails } from "@/lib/types"

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

export function AnimatedComboGrid({ combos }: { combos: ComboWithDetails[] }) {
  return (
    <motion.div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {combos.map((combo) => (
        <motion.div key={combo.id} variants={cardVariants}>
          <ComboCard combo={combo} />
        </motion.div>
      ))}
    </motion.div>
  )
}
