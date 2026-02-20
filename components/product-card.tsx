import Link from "next/link"
import { formatUYU } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"
import type { ProductWithDetails } from "@/lib/types"

export function ProductCard({ product }: { product: ProductWithDetails }) {
  const mainImage = product.images?.[0]?.url
  const hasStock = product.has_stock

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl glass glass-hover"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Sin imagen
          </div>
        )}
        {!hasStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <span className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Sin stock
            </span>
          </div>
        )}
        {product.featured && hasStock && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
            Destacado
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category_name && (
          <span className="text-[11px] font-medium uppercase tracking-wider text-primary/80">
            {product.category_name}
          </span>
        )}
        <h3
          className="text-sm font-semibold leading-tight text-foreground text-pretty"
          style={product.color_hex ? { color: product.color_hex } : undefined}
        >
          {product.name}
        </h3>
        {product.brand && (
          <p className="text-xs text-muted-foreground">{product.brand}</p>
        )}
        <div className="mt-auto pt-2">
          {hasStock && product.min_price != null ? (
            <p className="text-sm font-semibold text-foreground">
              <span className="text-xs font-normal text-muted-foreground">desde </span>
              {formatUYU(product.min_price)}
            </p>
          ) : (
            <p className="text-sm font-medium text-muted-foreground">Sin stock</p>
          )}
        </div>
      </div>
    </Link>
  )
}
