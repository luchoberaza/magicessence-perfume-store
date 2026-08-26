"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gift, Search, X, Plus, Check, ShoppingBag, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-store"
import { formatUYU } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { ComboWithDetails, ComboPoolProduct } from "@/lib/types"

export function ComboBuilder({
  combo,
  pool,
}: {
  combo: ComboWithDetails
  pool: ComboPoolProduct[]
}) {
  const { addItem } = useCart()

  // Los slots guardan el perfume elegido; null = vacio. Se puede repetir.
  const [picks, setPicks] = useState<(ComboPoolProduct | null)[]>(
    Array.from({ length: combo.slots }, () => null)
  )
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null)

  const filled = picks.filter(Boolean).length
  const complete = filled === combo.slots
  const armable = pool.length >= combo.slots

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return pool.filter((p) => {
      if (categoryFilter !== null && !p.category_ids?.includes(categoryFilter)) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q)
      )
    })
  }, [pool, query, categoryFilter])

  /** Cuantas veces esta elegido cada perfume, para el contador de la card. */
  const counts = useMemo(() => {
    const map = new Map<number, number>()
    for (const pick of picks) {
      if (!pick) continue
      map.set(pick.id, (map.get(pick.id) ?? 0) + 1)
    }
    return map
  }, [picks])

  function addPick(product: ComboPoolProduct) {
    setPicks((prev) => {
      const index = prev.findIndex((p) => p === null)
      if (index === -1) {
        toast.info("El combo ya esta completo", {
          description: "Sacate un perfume si queres cambiarlo.",
        })
        return prev
      }
      const next = [...prev]
      next[index] = product
      return next
    })
  }

  function clearSlot(index: number) {
    setPicks((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
  }

  function resetPicks() {
    setPicks(Array.from({ length: combo.slots }, () => null))
  }

  function handleAdd() {
    const chosen = picks.filter(Boolean) as ComboPoolProduct[]
    if (chosen.length !== combo.slots) return

    addItem({
      variantId: 0,
      productId: 0,
      productName: combo.name,
      productSlug: combo.slug,
      variantName: `${combo.slots} perfumes a eleccion`,
      ml: null,
      price: combo.price_int,
      imageUrl: combo.image_url,
      combo: {
        comboId: combo.id,
        comboName: combo.name,
        picks: chosen.map((p) => ({
          productId: p.id,
          name: p.name,
          imageUrl: p.image_url,
        })),
      },
    })

    toast.success("Combo agregado al carrito", {
      description: chosen.map((p) => p.name).join(", "),
    })
    resetPicks()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
      {/* Resumen + slots */}
      <div className="lg:col-span-2">
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="relative aspect-[4/3] bg-muted">
              {combo.image_url ? (
                <img
                  src={combo.image_url}
                  alt={combo.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                  <Gift className="h-12 w-12 text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <Badge className="absolute left-3 top-3 border-0 bg-primary/90 text-primary-foreground backdrop-blur-sm">
                <Gift className="mr-1 h-3 w-3" />
                {combo.slots} perfumes
              </Badge>
            </div>

            <div className="space-y-3 p-5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{combo.name}</h1>
              {combo.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">{combo.description}</p>
              )}
              <p className="text-3xl font-bold text-foreground">{formatUYU(combo.price_int)}</p>

              {/* Slots */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-widest text-primary/70">
                    Tu combo ({filled}/{combo.slots})
                  </p>
                  {filled > 0 && (
                    <button
                      onClick={resetPicks}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Vaciar
                    </button>
                  )}
                </div>

                <ul className="space-y-1.5">
                  {picks.map((pick, i) => (
                    <li key={i}>
                      {pick ? (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-2"
                        >
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {pick.image_url ? (
                              <img src={pick.image_url} alt={pick.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                —
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{pick.name}</p>
                            {pick.brand && (
                              <p className="truncate text-[11px] text-muted-foreground">{pick.brand}</p>
                            )}
                          </div>
                          <button
                            onClick={() => clearSlot(i)}
                            className="rounded-lg p-1.5 text-muted-foreground/60 transition-all hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Quitar ${pick.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </motion.div>
                      ) : (
                        <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-border/60 p-2">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/50 text-xs font-semibold text-muted-foreground">
                            {i + 1}
                          </div>
                          <p className="text-sm text-muted-foreground">Elegi un perfume</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA desktop */}
              <Button
                size="lg"
                className="hidden w-full lg:flex"
                disabled={!complete || !armable}
                onClick={handleAdd}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {complete ? "Agregar al carrito" : `Faltan ${combo.slots - filled} perfumes`}
              </Button>

              {!armable && (
                <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                  Ahora mismo no hay suficientes perfumes en stock para armar este combo.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pool */}
      <div className="lg:col-span-3">
        <div className="space-y-4 pb-24 lg:pb-0">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar perfume o marca..."
                className="bg-secondary/50 pl-9"
                aria-label="Buscar perfume"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Limpiar busqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {combo.categories?.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter(null)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    categoryFilter === null
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-card/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  Todos
                </button>
                {combo.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      categoryFilter === cat.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-card/30 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/30 py-16 text-center backdrop-blur-sm">
              <p className="text-sm font-medium text-foreground">No encontramos perfumes</p>
              <p className="mt-1 text-xs text-muted-foreground">Proba con otra busqueda o categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((product) => {
                  const count = counts.get(product.id) ?? 0
                  return (
                    <motion.button
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => addPick(product)}
                      className={cn(
                        "group relative flex flex-col overflow-hidden rounded-xl border bg-card/30 text-left backdrop-blur-sm transition-all duration-300",
                        count > 0
                          ? "border-primary/50 shadow-[0_0_20px_hsl(265_55%_65%/0.12)]"
                          : "border-border/50 hover:border-primary/30"
                      )}
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            Sin imagen
                          </div>
                        )}
                        <div
                          className={cn(
                            "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
                            count > 0
                              ? "bg-primary text-primary-foreground"
                              : "bg-background/70 text-foreground opacity-0 backdrop-blur-sm group-hover:opacity-100"
                          )}
                        >
                          {count > 0 ? (count > 1 ? `x${count}` : <Check className="h-3.5 w-3.5" />) : <Plus className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5 p-2.5">
                        {product.category_name && (
                          <span className="text-[10px] font-medium uppercase tracking-widest text-primary/70">
                            {product.category_name}
                          </span>
                        )}
                        <p className="text-xs font-semibold leading-tight text-foreground text-pretty">
                          {product.name}
                        </p>
                        {product.brand && (
                          <p className="text-[11px] text-muted-foreground">{product.brand}</p>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* CTA sticky mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/30 bg-background/90 p-3 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-lg font-bold leading-tight text-foreground">
              {formatUYU(combo.price_int)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {filled}/{combo.slots} elegidos
            </p>
          </div>
          <Button
            className="flex-1"
            size="lg"
            disabled={!complete || !armable}
            onClick={handleAdd}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            {complete ? "Agregar" : `Faltan ${combo.slots - filled}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
