"use client"

import { useRef, useState, type CSSProperties, type ReactNode } from "react"
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Efectos de interfaz inspirados en React Bits (SpotlightCard, ShinyText,
 * ScrollReveal, TiltedCard), reescritos sobre framer-motion —que el proyecto ya
 * usa— para no sumar GSAP ni una dependencia mas.
 */

/** Card con un halo violeta que sigue al cursor. */
export function SpotlightCard({
  children,
  className = "",
  radius = 320,
  intensity = 0.14,
}: {
  children: ReactNode
  className?: string
  radius?: number
  intensity?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  return (
    <div
      ref={ref}
      onMouseMove={(event) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        setPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top })
      }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={cn("group relative overflow-hidden", className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, hsl(265 55% 65% / ${intensity}), transparent 70%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}

/** Texto con un brillo que lo barre en loop. Para wordmarks y etiquetas. */
export function ShinyText({
  children,
  className = "",
  duration = 5,
  from,
  to,
}: {
  children: ReactNode
  className?: string
  duration?: number
  /** Color base del texto (CSS). Por defecto, gris claro del sistema. */
  from?: string
  /** Color del destello que lo recorre. */
  to?: string
}) {
  return (
    <span
      className={cn("shiny-text", className)}
      style={
        {
          "--shiny-duration": `${duration}s`,
          ...(from ? { "--shiny-from": from } : {}),
          ...(to ? { "--shiny-to": to } : {}),
        } as CSSProperties
      }
    >
      {children}
    </span>
  )
}

/** Revela un texto palabra por palabra al entrar en pantalla. */
export function ScrollReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.045,
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const words = text.split(" ")

  return (
    <span ref={ref} className={cn("inline", className)}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block"
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{
            duration: 0.6,
            delay: delay + index * stagger,
            ease: [0.25, 0.4, 0.25, 1],
          }}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  )
}

/** Borde con un gradiente conico que gira. Marca lo que es novedad. */
export function GlowBorder({
  children,
  className = "",
  innerClassName = "",
  duration = 6,
}: {
  children: ReactNode
  className?: string
  innerClassName?: string
  duration?: number
}) {
  return (
    <div
      className={cn("glow-border relative isolate", className)}
      style={{ "--glow-duration": `${duration}s` } as CSSProperties}
    >
      <div className={cn("relative h-full w-full", innerClassName)}>{children}</div>
    </div>
  )
}

/** Inclinacion 3D suave siguiendo el cursor. Para la pieza destacada. */
export function TiltCard({
  children,
  className = "",
  max = 7,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 180, damping: 20 })
  const springY = useSpring(y, { stiffness: 180, damping: 20 })
  const rotateX = useTransform(springY, [-0.5, 0.5], [max, -max])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-max, max])

  return (
    <motion.div
      ref={ref}
      onMouseMove={(event) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        x.set((event.clientX - rect.left) / rect.width - 0.5)
        y.set((event.clientY - rect.top) / rect.height - 0.5)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  )
}
