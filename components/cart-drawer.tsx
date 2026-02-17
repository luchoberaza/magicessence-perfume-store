"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { formatUYU } from "@/lib/currency"
import { useState } from "react"
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
      <SheetContent className="flex w-full flex-col bg-background sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Tu carrito
          </SheetTitle>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-secondary p-6">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Tu carrito esta vacio</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Explora nuestros productos y encontra tu fragancia ideal
              </p>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)} asChild>
              <Link href="/productos">Ver productos</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {cart.items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-3 rounded-xl bg-secondary/50 p-3"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
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
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => cart.updateQuantity(item.variantId, item.quantity - 1)}
                          className="rounded-md bg-muted p-1 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Reducir cantidad"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => cart.updateQuantity(item.variantId, item.quantity + 1)}
                          className="rounded-md bg-muted p-1 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => cart.removeItem(item.variantId)}
                          className="ml-2 rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
                          aria-label="Eliminar item"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {formatUYU(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount */}
            <div className="space-y-2 border-t border-border/30 pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Codigo de descuento"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  className="bg-secondary/50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyDiscount}
                  disabled={loading}
                  className="shrink-0"
                >
                  Aplicar
                </Button>
              </div>
              {discountMsg && (
                <p
                  className={`text-xs ${
                    discountMsg.type === "ok" ? "text-primary" : "text-destructive"
                  }`}
                >
                  {discountMsg.text}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-border/30 pt-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatUYU(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-sm text-primary">
                  <span>Descuento{cart.discountCode ? ` (${cart.discountCode})` : ""}</span>
                  <span>-{formatUYU(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-foreground">
                <span>Total</span>
                <span>{formatUYU(cart.total)}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" asChild onClick={() => onOpenChange(false)}>
              <Link href="/checkout">Comprar por WhatsApp</Link>
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
