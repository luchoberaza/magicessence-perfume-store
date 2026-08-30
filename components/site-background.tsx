"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const GhostFibers = dynamic(
  () => import("./backgrounds/ghost-fibers").then((mod) => mod.GhostFibers),
  { ssr: false }
)

/**
 * Fondo animado fijo detras de todo el sitio publico.
 *
 * Un unico canvas WebGL para todas las secciones: mas barato que animar cada
 * una. Si el navegador no soporta WebGL2, si el visitante pidio reducir
 * movimiento o si el equipo es de gama baja, no se monta nada y queda el
 * gradiente estatico de abajo, que replica los mismos tonos.
 */

// Paleta del sitio: --background 235 25% 5% / --primary 265 55% 65% / --accent 270 50% 55%.
// Las fibras son violeta profundo y el halo el primary, para que el morado
// acompanie al logo en vez de dominar la pantalla.
const BACKDROP = "#0a0a10"
const LINE_COLOR = "#1d1440"
const GLOW_COLOR = "#7a55c4"

type Quality = "loading" | "off" | "mobile" | "desktop"

function detectQuality(): Exclude<Quality, "loading"> {
  if (typeof window === "undefined") return "off"

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "off"

  // WebGL2 es requisito del shader (#version 300 es).
  try {
    const probe = document.createElement("canvas")
    if (!probe.getContext("webgl2")) return "off"
  } catch {
    return "off"
  }

  const coarse = window.matchMedia("(pointer: coarse)").matches
  const narrow = window.matchMedia("(max-width: 900px)").matches
  const fewCores = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4

  return coarse || narrow || fewCores ? "mobile" : "desktop"
}

export function SiteBackground() {
  const [quality, setQuality] = useState<Quality>("loading")

  useEffect(() => {
    setQuality(detectQuality())
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base estatica: es lo que se ve si el canvas no se monta y lo que hay
          debajo mientras carga. */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(265_55%_65%/0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(270_50%_55%/0.07),transparent_55%)]" />

      {quality !== "loading" && quality !== "off" && (
        <div className="absolute inset-0">
          <GhostFibers
            backdropColor={BACKDROP}
            lineColor={LINE_COLOR}
            glowColor={GLOW_COLOR}
            speed={0.14}
            scale={quality === "mobile" ? 3 : 2.4}
            rotationSpeed={0.06}
            layers={quality === "mobile" ? 2 : 4}
            waveAmplitude={0.02}
            twist={0.12}
            lineSharpness={18}
            glowIntensity={1.15}
            brightness={1.45}
            blueBoost={1.05}
            vignette={0.85}
            grain={0.035}
            dpr={quality === "mobile" ? 1 : 1.25}
            fps={quality === "mobile" ? 30 : 60}
          />
        </div>
      )}

      {/* Velo superior: baja el contraste del shader para que el texto siempre
          se lea, y oscurece los bordes. */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-background/25 to-background/70" />
    </div>
  )
}
