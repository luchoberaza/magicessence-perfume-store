import { notFound } from "next/navigation"

export default function RifaPage() {
  notFound()
}

/*
import { Wifi } from "lucide-react"
import { getRaffleEntries } from "@/lib/queries"
import { RaffleGrid } from "./raffle-grid"

export const revalidate = 15

export const metadata = {
  title: "Rifa | Mistic Essence",
  description: "Consulta el estado de la rifa. Numeros disponibles y vendidos.",
}

export default async function RifaPage() {
  const occupiedNumbers = await getRaffleEntries()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
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
          Planilla de la rifa &mdash; {occupiedNumbers.length} de 300 numeros vendidos
        </p>
      </div>

      <RaffleGrid occupiedNumbers={occupiedNumbers} />

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Los estados se actualizan automaticamente. Para participar, consultanos por nuestras redes.
      </p>
    </div>
  )
}
*/
