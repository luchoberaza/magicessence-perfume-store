"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Clock, Package, AlertTriangle, X, Sparkles } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { formatUYU } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { ProductWithDetails } from "@/lib/types"

const ORDER_VARIANT_ID_OFFSET = -10000

export function ProductDetail({ product }: { product: ProductWithDetails }) {
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.find((v) => v.in_stock) || product.variants[0] || null
  )
  const [selectedImage, setSelectedImage] = useState(0)
  const [isOrderMode, setIsOrderMode] = useState(false)
  const [showOrderWarning, setShowOrderWarning] = useState(false)

  const hasAnyStock = product.has_stock

  function handleSelectOrder() {
    setShowOrderWarning(true)
  }

  function handleConfirmOrder() {
    setShowOrderWarning(false)
    setIsOrderMode(true)
    setSelectedVariant(null)
  }

  function handleSelectVariant(variant: typeof product.variants[0]) {
    if (!variant.in_stock) return
    setIsOrderMode(false)
    setSelectedVariant(variant)
  }

  function handleAdd() {
    if (isOrderMode && selectedVariant === null) {
      if (!product.variants[0]) return
      const baseVariant = product.variants.find((v) => v.in_stock) || product.variants[0]
      addItem({
        variantId: ORDER_VARIANT_ID_OFFSET - product.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantName: "Sellado por encargue",
        ml: baseVariant.ml,
        price: baseVariant.price_int,
        imageUrl: product.images[0]?.url || null,
      })
      toast.success("Agregado al carrito", {
        description: `${product.name} - Sellado por encargue`,
      })
      return
    }

    if (!selectedVariant || !selectedVariant.in_stock) return
    if (isOrderMode) {
      addItem({
        variantId: ORDER_VARIANT_ID_OFFSET - selectedVariant.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantName: `${selectedVariant.name} (Encargue)`,
        ml: selectedVariant.ml,
        price: selectedVariant.price_int,
        imageUrl: product.images[0]?.url || null,
      })
      toast.success("Agregado al carrito", {
        description: `${product.name} - ${selectedVariant.name} (Encargue)`,
      })
    } else {
      addItem({
        variantId: selectedVariant.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantName: selectedVariant.name,
        ml: selectedVariant.ml,
        price: selectedVariant.price_int,
        imageUrl: product.images[0]?.url || null,
      })
      toast.success("Agregado al carrito", {
        description: `${product.name} - ${selectedVariant.name}`,
      })
    }
  }

  const displayPrice = isOrderMode
    ? (product.variants.find((v) => v.in_stock)?.price_int ?? product.variants[0]?.price_int)
    : selectedVariant?.price_int

  const canAdd = isOrderMode || (selectedVariant && selectedVariant.in_stock)

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Images */}
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
          {product.images.length > 0 ? (
            <img
              src={product.images[selectedImage]?.url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              Sin imagen
            </div>
          )}
          {!hasAnyStock && !product.sale_by_order && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
              <span className="rounded-xl bg-secondary px-6 py-3 text-lg font-bold uppercase tracking-wider text-muted-foreground">
                Sin stock
              </span>
            </div>
          )}
          {product.sale_by_order && (
            <Badge className="absolute right-3 top-3 border-0 bg-amber-500/90 text-amber-950 backdrop-blur-sm">
              <Package className="mr-1 h-3 w-3" />
              Venta por encargue
            </Badge>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {product.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  i === selectedImage
                    ? "border-primary"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img
                  src={img.url}
                  alt={`${product.name} imagen ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4">
        {product.category_name && (
          <Badge variant="outline" className="w-fit text-primary border-primary/30">
            {product.category_name}
          </Badge>
        )}

        <h1
          className="text-3xl font-bold text-foreground lg:text-4xl"
          style={product.color_hex ? { color: product.color_hex } : undefined}
        >
          {product.name}
        </h1>

        {product.brand && (
          <p className="text-lg text-muted-foreground">{product.brand}</p>
        )}

        {product.description && (
          <p className="leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}

        {/* Price */}
        {displayPrice != null && (
          <p className="text-3xl font-bold text-foreground">
            {formatUYU(displayPrice)}
            {isOrderMode && (
              <span className="ml-2 text-sm font-normal text-amber-400">(encargue)</span>
            )}
          </p>
        )}

        {/* Variants */}
        {product.variants.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Variante</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => handleSelectVariant(variant)}
                  disabled={!variant.in_stock}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                    !isOrderMode && selectedVariant?.id === variant.id
                      ? "border-primary bg-primary/10 text-primary"
                      : variant.in_stock
                        ? "border-border bg-secondary/50 text-foreground hover:border-primary/50"
                        : "border-border/50 bg-muted/30 text-muted-foreground line-through opacity-60 cursor-not-allowed"
                  )}
                >
                  {variant.name}
                  {variant.ml ? ` - ${variant.ml}ml` : ""}
                  {!variant.in_stock && " (Sin stock)"}
                </button>
              ))}

              {/* Sale by order option */}
              {product.sale_by_order && (
                <button
                  onClick={handleSelectOrder}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-1.5",
                    isOrderMode
                      ? "border-amber-400/60 bg-amber-400/10 text-amber-400"
                      : "border-amber-400/30 bg-amber-400/5 text-amber-400/80 hover:border-amber-400/50 hover:bg-amber-400/10"
                  )}
                >
                  <Package className="h-3.5 w-3.5" />
                  Sellado por encargue
                </button>
              )}
            </div>
          </div>
        )}

        {/* Add to cart */}
        <motion.div whileHover={{ scale: canAdd ? 1.02 : 1 }} whileTap={{ scale: canAdd ? 0.98 : 1 }}>
          <Button
            size="lg"
            className={cn(
              "mt-4 w-full lg:w-auto",
              isOrderMode && "bg-amber-500 text-amber-950 hover:bg-amber-400"
            )}
            onClick={handleAdd}
            disabled={!canAdd && !isOrderMode}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            {isOrderMode ? "Encargar ahora" : hasAnyStock ? "Agregar al carrito" : "Sin stock"}
          </Button>
        </motion.div>
      </div>

      {/* Order warning modal */}
      <AnimatePresence>
        {showOrderWarning && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowOrderWarning(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Card */}
            <motion.div
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-400/30 bg-card shadow-[0_0_60px_hsl(45_90%_50%/0.08)]"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
            >
              {/* Top gradient */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

              {/* Close button */}
              <button
                onClick={() => setShowOrderWarning(false)}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-6 pt-8">
                {/* Icon */}
                <motion.div
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10"
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Package className="h-7 w-7 text-amber-400" />
                </motion.div>

                {/* Title */}
                <motion.h3
                  className="text-center text-lg font-bold text-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Sellado por encargue
                </motion.h3>

                {/* Content */}
                <motion.div
                  className="mt-4 space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-secondary/30 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Disponible en stock</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        La entrega demora <span className="font-medium text-foreground">24 horas</span> aproximadamente.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-secondary/30 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10">
                      <Clock className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Sin stock inmediato</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        El pedido puede demorar hasta <span className="font-medium text-foreground">72 horas</span> aproximadamente.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  className="mt-6 flex gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="outline"
                    className="flex-1 border-border/50"
                    onClick={() => setShowOrderWarning(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-amber-500 text-amber-950 hover:bg-amber-400"
                    onClick={handleConfirmOrder}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Entendido
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
