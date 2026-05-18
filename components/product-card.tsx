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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:bg-card/50 hover:shadow-[0_0_40px_hsl(265_55%_65%/0.08)]"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Sin imagen
          </div>
        )}
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {!hasStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <span className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Sin stock
            </span>
          </div>
        )}
        {product.featured && hasStock && (
          <Badge className="absolute left-3 top-3 border-0 bg-primary/90 text-primary-foreground backdrop-blur-sm">
            Destacado
          </Badge>
        )}
        {/* Corner glow */}
        <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-primary/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category_name && (
          <span className="text-[11px] font-medium uppercase tracking-widest text-primary/70">
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
            <p className="text-sm font-bold text-foreground">
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
