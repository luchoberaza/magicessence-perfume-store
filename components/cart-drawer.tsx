"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, Sparkles } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { formatUYU } from "@/lib/currency"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const cart = useCart()
  const [discountInput, setDiscountInput] = useState("")
  const [discountMsg, setDiscountMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function applyDiscount() {
    if (!discountInput.trim()) return
    setLoading(true)
    setDiscountMsg(null)
    try {
      const res = await fetch(`/api/discount?code=${encodeURIComponent(discountInput.trim())}`)
      const data = await res.json()
      if (data.valid) {
        cart.setDiscount(discountInput.trim().toUpperCase(), data.type, data.value)
        setDiscountMsg({ type: "ok", text: `Descuento aplicado: ${data.type === "percent" ? `${data.value}%` : formatUYU(data.value)}` })
      } else {
        cart.setDiscount(null, null, 0)
        setDiscountMsg({ type: "error", text: data.message || "Codigo no valido" })
      }
    } catch {
      setDiscountMsg({ type: "error", text: "Error al verificar" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden border-l border-border/30 bg-background/95 backdrop-blur-xl sm:max-w-md">
        {/* Header */}
        <SheetHeader className="border-b border-border/20 pb-4">
          <SheetTitle className="flex items-center gap-3 text-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <ShoppingBag className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <span className="block text-base">Tu carrito</span>
              {cart.items.length > 0 && (
                <span className="block text-xs font-normal text-muted-foreground">
                  {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
                </span>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        {cart.items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <div className="rounded-2xl border border-border/50 bg-card/30 p-7">
                <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary/20 blur-xl" />
            </motion.div>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <p className="font-semibold text-foreground">Tu carrito esta vacio</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Explora nuestros productos y encontra tu fragancia ideal
              </p>
            </motion.div>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-primary/30 hover:border-primary/60 hover:bg-primary/5"
                asChild
              >
                <Link href="/productos">
                  Explorar fragancias
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 space-y-3 overflow-y-auto py-4 pr-1 scrollbar-thin">
              <AnimatePresence mode="popLayout">
                {cart.items.map((item) => (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="group flex gap-3 rounded-xl border border-border/30 bg-card/30 p-3 transition-all duration-300 hover:border-primary/20 hover:bg-card/50"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-16 w-16 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border/50 bg-muted/30 text-xs text-muted-foreground">
                        Sin img
                      </div>
                    )}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-sm font-medium leading-tight text-foreground">
                          {item.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.variantName}
                          {item.ml ? ` - ${item.ml}ml` : ""}
                        </p>
                        {item.combo && (
                          <ul className="mt-1.5 space-y-0.5">
                            {item.combo.picks.map((pick, i) => (
                              <li
                                key={`${pick.productId}-${i}`}
                                className="truncate text-[11px] leading-snug text-muted-foreground/70"
                              >
                                <span className="text-primary/60">-</span> {pick.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => cart.updateQuantity(item.key, item.quantity - 1)}
                            className="rounded-lg border border-border/50 bg-card/50 p-1.5 text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[1.75rem] text-center text-sm font-semibold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => cart.updateQuantity(item.key, item.quantity + 1)}
                            className="rounded-lg border border-border/50 bg-card/50 p-1.5 text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => cart.removeItem(item.key)}
                            className="ml-1.5 rounded-lg border border-transparent p-1.5 text-muted-foreground/60 transition-all hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Eliminar item"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          {formatUYU(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Discount */}
            <div className="space-y-2 border-t border-border/20 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Tag className="h-3 w-3" />
                Codigo de descuento
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ingresa tu codigo"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") applyDiscount() }}
                  className="bg-secondary/30 border-border/50 focus:border-primary/40"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyDiscount}
                  disabled={loading}
                  className="shrink-0 border-primary/30 hover:border-primary/60 hover:bg-primary/5"
                >
                  Aplicar
                </Button>
              </div>
              <AnimatePresence>
                {discountMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-xs ${
                      discountMsg.type === "ok" ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {discountMsg.type === "ok" && <Sparkles className="mr-1 inline h-3 w-3" />}
                    {discountMsg.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Totals */}
            <div className="space-y-2.5 border-t border-border/20 pt-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatUYU(cart.subtotal)}</span>
              </div>
              <AnimatePresence>
                {cart.discount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-between text-sm font-medium text-primary"
                  >
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Descuento{cart.discountCode ? ` (${cart.discountCode})` : ""}
                    </span>
                    <span>-{formatUYU(cart.discount)}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex justify-between border-t border-border/20 pt-2.5 text-lg font-bold text-foreground">
                <span>Total</span>
                <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  {formatUYU(cart.total)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-1">
              <Button
                className="group w-full text-base py-6"
                size="lg"
                asChild
                onClick={() => onOpenChange(false)}
              >
                <Link href="/checkout">
                  Comprar por WhatsApp
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
