"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search, SlidersHorizontal, Package } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import type { ProductWithDetails, Category } from "@/lib/types"

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

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
  }, [initialProducts, search, categoryFilter, stockOnly, sort, categories])

  return (
    <div>
      {/* Filters */}
      <motion.div
        className="mb-8 rounded-2xl border border-border/50 bg-card/30 p-4 backdrop-blur-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtros
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-secondary/30 pl-9 border-border/50 focus:border-primary/40"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full bg-secondary/30 border-border/50 sm:w-44">
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
            <SelectTrigger className="w-full bg-secondary/30 border-border/50 sm:w-44">
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

        {/* Result count */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Package className="h-3 w-3" />
          {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
        </div>
      </motion.div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm py-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="text-lg font-medium text-foreground">Sin resultados</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Intenta con otros filtros o busqueda.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
