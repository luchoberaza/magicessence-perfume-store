"use client"

import { motion } from "framer-motion"
import { MapPin, Clock, MessageCircle, Instagram } from "lucide-react"

const items = [
  {
    icon: MapPin,
    title: "Ubicacion",
    desc: "Salto, Uruguay",
    gradient: "from-blue-500/10 to-primary/10",
  },
  {
    icon: Clock,
    title: "Horario",
    desc: "Lunes a Sabado, 9:00 - 20:00",
    gradient: "from-emerald-500/10 to-primary/10",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    desc: "+598 98 158 434",
    gradient: "from-green-500/10 to-primary/10",
  },
  {
    icon: Instagram,
    title: "Instagram",
    desc: "@mistic.essence",
    gradient: "from-pink-500/10 to-accent/10",
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
}

export function ContactInfo() {
  return (
    <motion.div
      className="flex flex-col gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.div
          key={item.title}
          variants={itemVariants}
          className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-5 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:bg-card/50"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <item.icon className="h-5 w-5" />
          </div>
          <div className="relative">
            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
