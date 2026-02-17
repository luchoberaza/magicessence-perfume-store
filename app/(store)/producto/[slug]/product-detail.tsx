"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { formatUYU } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { ProductWithDetails } from "@/lib/types"

export function ProductDetail({ product }: { product: ProductWithDetails }) {
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.find((v) => v.in_stock) || product.variants[0] || null
  )
  const [selectedImage, setSelectedImage] = useState(0)

  const hasAnyStock = product.has_stock

  function handleAdd() {
    if (!selectedVariant || !selectedVariant.in_stock) return
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

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Images */}
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl glass">
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
          {!hasAnyStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
              <span className="rounded-xl bg-secondary px-6 py-3 text-lg font-bold uppercase tracking-wider text-muted-foreground">
                Sin stock
              </span>
            </div>
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

        <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
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
        {selectedVariant && (
          <p className="text-3xl font-bold text-foreground">
            {selectedVariant.in_stock ? formatUYU(selectedVariant.price_int) : "Sin stock"}
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
                  onClick={() => variant.in_stock && setSelectedVariant(variant)}
                  disabled={!variant.in_stock}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                    selectedVariant?.id === variant.id
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
            </div>
          </div>
        )}

        {/* Add to cart */}
        <Button
          size="lg"
          className="mt-4 w-full lg:w-auto"
          onClick={handleAdd}
          disabled={!selectedVariant || !selectedVariant.in_stock || !hasAnyStock}
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          {hasAnyStock ? "Agregar al carrito" : "Sin stock"}
        </Button>
      </div>
    </div>
  )
}
