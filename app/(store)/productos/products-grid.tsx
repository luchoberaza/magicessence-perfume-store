"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import type { ProductWithDetails, Category } from "@/lib/types"

export function ProductsGrid({
  initialProducts,
  categories,
}: {
  initialProducts: ProductWithDetails[]
  categories: Category[]
}) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockOnly, setStockOnly] = useState(false)
  const [sort, setSort] = useState("newest")

  const filtered = useMemo(() => {
    let result = [...initialProducts]

    if (search) {
      const lower = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.brand?.toLowerCase().includes(lower)
      )
    }

    if (categoryFilter !== "all") {
      const cat = categories.find((c) => c.slug === categoryFilter)
      result = result.filter((p) => {
        if (p.category_slug === categoryFilter) return true
        if (!cat) return false
        return (p.category_ids || []).includes(cat.id)
      })
    }

    if (stockOnly) {
      result = result.filter((p) => p.has_stock)
    }

    switch (sort) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "price-asc":
        result.sort((a, b) => (a.min_price ?? Infinity) - (b.min_price ?? Infinity))
        break
      case "price-desc":
        result.sort((a, b) => (b.min_price ?? 0) - (a.min_price ?? 0))
        break
    }

    return result
  }, [initialProducts, search, categoryFilter, stockOnly, sort])

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-secondary/50 pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full bg-secondary/50 sm:w-44">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full bg-secondary/50 sm:w-44">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mas recientes</SelectItem>
            <SelectItem value="name-asc">A - Z</SelectItem>
            <SelectItem value="name-desc">Z - A</SelectItem>
            <SelectItem value="price-asc">Precio menor</SelectItem>
            <SelectItem value="price-desc">Precio mayor</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Switch
            id="stock-filter"
            checked={stockOnly}
            onCheckedChange={setStockOnly}
          />
          <Label htmlFor="stock-filter" className="text-sm text-muted-foreground">
            Solo en stock
          </Label>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl glass py-20 text-center">
          <p className="text-lg font-medium text-foreground">Sin resultados</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Intenta con otros filtros o busqueda.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
