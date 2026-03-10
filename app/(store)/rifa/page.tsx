import { Wifi } from "lucide-react"
import { getRaffleEntries } from "@/lib/queries"

export const revalidate = 60

export const metadata = {
  title: "Rifa | Mistic Essence",
  description: "Consulta el estado de la rifa. Numeros disponibles y vendidos.",
}

export default async function RifaPage() {
  const occupiedNumbers = await getRaffleEntries()
  const occupiedSet = new Set(occupiedNumbers)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="flex flex-wrap items-center justify-center gap-x-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          <span style={{ color: "#f5e6ca" }}>Zona Cell</span>
          <Wifi className="h-8 w-8 text-blue-400 sm:h-9 sm:w-9 lg:h-10 lg:w-10" />
          <span className="text-foreground">
            x Mistic{" "}
            <span className="text-primary">Essence</span>
          </span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Planilla de la rifa &mdash; {occupiedSet.size} de 300 numeros vendidos
        </p>
      </div>

      {/* Legend */}
      <div className="mb-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded border border-border bg-secondary/30" />
          <span className="text-muted-foreground">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded border border-primary/50 bg-primary/20" />
          <span className="text-muted-foreground">Vendido</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15">
        {Array.from({ length: 300 }, (_, i) => i + 1).map((n) => {
          const sold = occupiedSet.has(n)
          return (
            <div
              key={n}
              className={`flex items-center justify-center rounded-md border text-sm font-medium h-10 sm:h-9 select-none ${
                sold
                  ? "border-primary/50 bg-primary/20 text-primary"
                  : "border-border bg-secondary/30 text-foreground"
              }`}
            >
              {n}
            </div>
          )
        })}
      </div>

      {/* Bottom note */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Los estados se actualizan automaticamente. Para participar, consultanos por nuestras redes.
      </p>
    </div>
  )
}
