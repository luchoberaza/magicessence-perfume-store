"use client"

import { useState } from "react"
import { useCart } from "@/lib/cart-store"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RaffleGridProps {
  occupiedNumbers: number[]
}

export function RaffleGrid({ occupiedNumbers }: RaffleGridProps) {
  const occupiedSet = new Set(occupiedNumbers)
  const { addItem, items } = useCart()
  const [confirmNumber, setConfirmNumber] = useState<number | null>(null)

  const cartRaffleNumbers = new Set(
    items
      .filter((i) => i.variantId <= -1 && i.variantId >= -300)
      .map((i) => -i.variantId)
  )

  function handleNumberClick(n: number) {
    if (occupiedSet.has(n)) return
    if (cartRaffleNumbers.has(n)) {
      toast.info(`El numero ${n} ya esta en tu carrito`)
      return
    }
    setConfirmNumber(n)
  }

  function handleConfirm() {
    if (confirmNumber === null) return
    addItem({
      variantId: -confirmNumber,
      productId: 0,
      productName: `Numero ${confirmNumber} - Rifa`,
      productSlug: "rifa",
      variantName: `N° ${confirmNumber}`,
      ml: null,
      price: 250,
      imageUrl: null,
    })
    toast.success(`Numero ${confirmNumber} agregado al carrito`)
    setConfirmNumber(null)
  }

  return (
    <>
      {/* Legend */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-4 text-sm sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded border border-border bg-secondary/30" />
          <span className="text-muted-foreground">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded border border-red-500/50 bg-red-500/20" />
          <span className="text-muted-foreground">Vendido</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded border border-primary/50 bg-primary/20" />
          <span className="text-muted-foreground">En tu carrito</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15">
        {Array.from({ length: 300 }, (_, i) => i + 1).map((n) => {
          const sold = occupiedSet.has(n)
          const inCart = cartRaffleNumbers.has(n)

          if (sold) {
            return (
              <div
                key={n}
                className="flex items-center justify-center rounded-md border text-sm font-medium h-10 sm:h-9 select-none cursor-not-allowed border-red-500/50 bg-red-500/20 text-red-400"
              >
                {n}
              </div>
            )
          }

          if (inCart) {
            return (
              <div
                key={n}
                className="flex items-center justify-center rounded-md border text-sm font-medium h-10 sm:h-9 select-none border-primary/50 bg-primary/20 text-primary"
              >
                {n}
              </div>
            )
          }

          return (
            <button
              key={n}
              onClick={() => handleNumberClick(n)}
              className="flex items-center justify-center rounded-md border text-sm font-medium h-10 sm:h-9 border-border bg-secondary/30 text-foreground transition-colors hover:bg-secondary/60 hover:border-primary/30 cursor-pointer"
            >
              {n}
            </button>
          )
        })}
      </div>

      {/* Confirm dialog */}
      <AlertDialog
        open={confirmNumber !== null}
        onOpenChange={(open) => { if (!open) setConfirmNumber(null) }}
      >
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Agregar numero {confirmNumber} al carrito
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se agregara &quot;Numero {confirmNumber} - Rifa&quot; a tu carrito de compras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
