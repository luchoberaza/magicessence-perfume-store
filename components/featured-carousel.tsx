"use client"

import Link from "next/link"
import { formatUYU } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"
import type { ProductWithDetails } from "@/lib/types"
import { ScaleOnHover, FadeIn, StaggerContainer, StaggerItem } from "./home-animations"

export function FeaturedCarousel({ products }: { products: ProductWithDetails[] }) {
  return (
    <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.15}>
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <ScaleOnHover>
            <Link
              href={`/producto/${product.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:bg-card/60 hover:shadow-[0_0_40px_hsl(265_55%_65%/0.1)]"
            >
              <div className="relative aspect-square overflow-hidden">
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                    Sin imagen
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {!product.has_stock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                    <span className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Sin stock
                    </span>
                  </div>
                )}
                {product.featured && product.has_stock && (
                  <Badge className="absolute left-3 top-3 border-0 bg-primary/90 text-primary-foreground backdrop-blur-sm">
                    Destacado
                  </Badge>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-1.5 p-5">
                {product.category_name && (
                  <span className="text-[11px] font-medium uppercase tracking-widest text-primary/70">
                    {product.category_name}
                  </span>
                )}
                <h3
                  className="text-base font-semibold leading-tight text-foreground"
                  style={product.color_hex ? { color: product.color_hex } : undefined}
                >
                  {product.name}
                </h3>
                {product.brand && (
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                )}
                <div className="mt-auto pt-3">
                  {product.has_stock && product.min_price != null ? (
                    <p className="text-base font-bold text-foreground">
                      <span className="text-xs font-normal text-muted-foreground">desde </span>
                      {formatUYU(product.min_price)}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-muted-foreground">Sin stock</p>
                  )}
                </div>
              </div>
            </Link>
          </ScaleOnHover>
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}

export function CategoryShowcase() {
  const categories = [
    { name: "Masculinos", href: "/categorias", icon: "M", gradient: "from-blue-500/20 to-primary/20" },
    { name: "Femeninos", href: "/categorias", icon: "F", gradient: "from-pink-500/20 to-accent/20" },
    { name: "Unisex", href: "/categorias", icon: "U", gradient: "from-emerald-500/20 to-primary/20" },
    { name: "Decants", href: "/categorias", icon: "D", gradient: "from-amber-500/20 to-accent/20" },
  ]

  return (
    <StaggerContainer className="grid grid-cols-2 gap-4 lg:grid-cols-4" staggerDelay={0.1}>
      {categories.map((cat) => (
        <StaggerItem key={cat.name}>
          <Link
            href={cat.href}
            className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-6 text-center backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:bg-card/50 hover:shadow-[0_0_30px_hsl(265_55%_65%/0.08)]"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
              {cat.icon}
            </div>
            <span className="relative text-sm font-semibold text-foreground">
              {cat.name}
            </span>
          </Link>
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}
