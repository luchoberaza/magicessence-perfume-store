import Link from "next/link"
import { Gift, ArrowRight } from "lucide-react"
import { formatUYU } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"
import type { ComboWithDetails } from "@/lib/types"

export function ComboCard({ combo }: { combo: ComboWithDetails }) {
  // Un combo con menos perfumes disponibles que slots no se puede armar hoy.
  const armable = combo.available_count >= combo.slots

  return (
    <Link
      href={`/combos/${combo.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:bg-card/50 hover:shadow-[0_0_40px_hsl(265_55%_65%/0.08)]"
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {combo.image_url ? (
          <img
            src={combo.image_url}
            alt={combo.name}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <Gift className="h-10 w-10 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />

        <Badge className="absolute left-3 top-3 border-0 bg-primary/90 text-primary-foreground backdrop-blur-sm">
          <Gift className="mr-1 h-3 w-3" />
          {combo.slots} perfumes
        </Badge>

        {!armable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <span className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              No disponible
            </span>
          </div>
        )}

        <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-primary/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-base font-semibold leading-tight text-foreground text-pretty">
          {combo.name}
        </h3>
        {combo.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {combo.description}
          </p>
        )}
        {combo.categories?.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {combo.categories.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full border border-border/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-end justify-between pt-3">
          <p className="text-lg font-bold text-foreground">{formatUYU(combo.price_int)}</p>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all group-hover:gap-2.5">
            {armable ? "Armar combo" : "Ver combo"}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}
