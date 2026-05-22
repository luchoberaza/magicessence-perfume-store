"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Upload, X, Search, Package, Eye, EyeOff, Star, ChevronDown, ChevronUp, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { formatUYU } from "@/lib/currency"
import { cn } from "@/lib/utils"

interface Variant {
  id: number
  name: string
  ml: number | null
  price_int: number
  in_stock: boolean
  is_active: boolean
}

interface ProductImage {
  id: number
  url: string
  sort_order: number
}

interface Product {
  id: number
  name: string
  slug: string
  brand: string | null
  description: string | null
  category_id: number | null
  category_ids?: number[]
  color_hex: string | null
  category_name: string | null
  featured: boolean
  sale_by_order: boolean
  encargue_price_int: number | null
  is_active: boolean
  images: ProductImage[] | null
  variants: Variant[] | null
}

interface Category {
  id: number
  name: string
  slug: string
}

export function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: "",
    slug: "",
    brand: "",
    description: "",
    color_hex: "",
    category_ids: [] as number[],
    featured: false,
    sale_by_order: false,
    encargue_price_int: "",
    is_active: true,
  })

  const [variantDialogOpen, setVariantDialogOpen] = useState(false)
  const [variantProduct, setVariantProduct] = useState<Product | null>(null)
  const [variantForm, setVariantForm] = useState({ name: "", ml: "", price_int: "", in_stock: true, is_active: true })
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [pRes, cRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/categories"),
    ])
    setProducts(await pRes.json())
    setCategories(await cRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: "", slug: "", brand: "", description: "", color_hex: "", category_ids: [], featured: false, sale_by_order: false, encargue_price_int: "", is_active: true })
    setDialogOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    const catIds = (p.category_ids && p.category_ids.length > 0)
      ? p.category_ids
      : (p.category_id ? [p.category_id] : [])
    setForm({
      name: p.name,
      slug: p.slug,
      brand: p.brand || "",
      description: p.description || "",
      color_hex: p.color_hex || "",
      category_ids: catIds,
      featured: p.featured,
      sale_by_order: p.sale_by_order,
      encargue_price_int: p.encargue_price_int ? String(p.encargue_price_int) : "",
      is_active: p.is_active,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    const body = {
      ...form,
      color_hex: form.color_hex?.trim() ? form.color_hex.trim() : null,
      encargue_price_int: form.encargue_price_int ? parseInt(form.encargue_price_int) : null,
      category_ids: form.category_ids,
      ...(editing ? { id: editing.id } : {}),
    }
    const method = editing ? "PUT" : "POST"
    const res = await fetch("/api/admin/products", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success(editing ? "Producto actualizado" : "Producto creado")
      setDialogOpen(false)
      fetchAll()
    } else {
      toast.error("Error al guardar")
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    const res = await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteId }) })
    if (res.ok) { toast.success("Producto eliminado"); fetchAll() }
    setDeleteId(null)
  }

  async function handleImageUpload(productId: number, file: File) {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("product_id", String(productId))
    fd.append("sort_order", "0")
    const res = await fetch("/api/admin/images", { method: "POST", body: fd })
    if (res.ok) { toast.success("Imagen subida"); fetchAll() } else { const msg = await res.text(); toast.error(msg || "Error al subir imagen"); }
  }

  async function handleImageDelete(imageId: number, url: string) {
    const res = await fetch("/api/admin/images", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: imageId, url }) })
    if (res.ok) { toast.success("Imagen eliminada"); fetchAll() }
  }

  function openVariantCreate(p: Product) {
    setVariantProduct(p)
    setEditingVariant(null)
    setVariantForm({ name: "", ml: "", price_int: "", in_stock: true, is_active: true })
    setVariantDialogOpen(true)
  }

  function openVariantEdit(p: Product, v: Variant) {
    setVariantProduct(p)
    setEditingVariant(v)
    setVariantForm({ name: v.name, ml: v.ml ? String(v.ml) : "", price_int: String(v.price_int), in_stock: v.in_stock, is_active: v.is_active })
    setVariantDialogOpen(true)
  }

  async function handleVariantSave() {
    const body = {
      product_id: variantProduct!.id,
      name: variantForm.name,
      ml: variantForm.ml ? parseInt(variantForm.ml) : null,
      price_int: parseInt(variantForm.price_int),
      in_stock: variantForm.in_stock,
      is_active: variantForm.is_active,
      ...(editingVariant ? { id: editingVariant.id } : {}),
    }
    const method = editingVariant ? "PUT" : "POST"
    const res = await fetch("/api/admin/variants", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) { toast.success(editingVariant ? "Variante actualizada" : "Variante creada"); setVariantDialogOpen(false); fetchAll() }
    else toast.error("Error al guardar variante")
  }

  async function handleVariantDelete(id: number) {
    const res = await fetch("/api/admin/variants", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    if (res.ok) { toast.success("Variante eliminada"); fetchAll() }
  }

  async function toggleVariantStock(v: Variant) {
    await fetch("/api/admin/variants", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...v, in_stock: !v.in_stock }),
    })
    fetchAll()
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const minPrice = (p: Product) => {
    if (!p.variants || p.variants.length === 0) return null
    return Math.min(...p.variants.map((v) => v.price_int))
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Productos</h2>
          <p className="text-xs text-muted-foreground">{products.length} productos en total</p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Buscar por nombre o marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border/40 bg-background/50 pl-9 focus-visible:ring-primary/30"
            />
          </div>
          <Button size="sm" onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo</span>
          </Button>
        </div>
      </div>

      {/* Products list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-secondary/30" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 py-16">
          <Package className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No se encontraron productos</p>
          {searchQuery && (
            <Button variant="link" size="sm" onClick={() => setSearchQuery("")} className="mt-1 text-primary">
              Limpiar busqueda
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const isExpanded = expandedId === p.id
            const price = minPrice(p)
            const stockCount = p.variants?.filter((v) => v.in_stock).length ?? 0
            const totalVariants = p.variants?.length ?? 0

            return (
              <div
                key={p.id}
                className={cn(
                  "group overflow-hidden rounded-2xl border transition-all",
                  p.is_active
                    ? "border-border/30 bg-background/40 hover:border-border/50"
                    : "border-border/20 bg-background/20 opacity-60"
                )}
              >
                {/* Main row */}
                <div className="flex items-center gap-4 p-4">
                  {/* Image */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
                    {p.images && p.images[0] ? (
                      <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                    )}
                    {p.featured && (
                      <div className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-bl-lg rounded-tr-xl bg-amber-400">
                        <Star className="h-3 w-3 text-amber-950" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-foreground">{p.name}</p>
                      {p.sale_by_order && (
                        <Badge className="shrink-0 border-0 bg-amber-400/10 text-amber-400 text-[10px] px-1.5 py-0">
                          Encargue
                        </Badge>
                      )}
                      {!p.is_active && (
                        <Badge className="shrink-0 border-0 bg-destructive/10 text-destructive text-[10px] px-1.5 py-0">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{p.brand || "Sin marca"}</span>
                      <span className="text-border">|</span>
                      <span>{p.category_name || "Sin categoria"}</span>
                      {totalVariants > 0 && (
                        <>
                          <span className="text-border">|</span>
                          <span className={stockCount > 0 ? "text-emerald-400" : "text-muted-foreground"}>
                            {stockCount}/{totalVariants} en stock
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price & actions */}
                  <div className="flex shrink-0 items-center gap-3">
                    {price != null && (
                      <p className="text-sm font-semibold text-foreground">
                        {formatUYU(price)}
                      </p>
                    )}
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(p.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border/20 bg-background/20 px-4 pb-4 pt-3">
                    {/* Images section */}
                    <div className="mb-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Imagenes</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {p.images?.map((img) => (
                          <div key={img.id} className="group/img relative h-16 w-16 overflow-hidden rounded-xl border border-border/30">
                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                            <button
                              onClick={() => handleImageDelete(img.id, img.url)}
                              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover/img:opacity-100"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        ))}
                        <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border/30 text-muted-foreground/40 transition-all hover:border-primary/40 hover:text-primary/60">
                          <Upload className="h-5 w-5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(p.id, e.target.files[0]); e.target.value = "" }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Variants section */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Variantes</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs text-primary hover:text-primary"
                          onClick={() => openVariantCreate(p)}
                        >
                          <Plus className="h-3 w-3" />
                          Agregar
                        </Button>
                      </div>
                      {(!p.variants || p.variants.length === 0) ? (
                        <p className="py-3 text-center text-xs text-muted-foreground/50">Sin variantes configuradas</p>
                      ) : (
                        <div className="space-y-1.5">
                          {p.variants.map((v) => (
                            <div
                              key={v.id}
                              className={cn(
                                "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors",
                                v.in_stock
                                  ? "bg-secondary/20"
                                  : "bg-secondary/10"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={v.in_stock}
                                  onCheckedChange={() => toggleVariantStock(v)}
                                  className="scale-75 data-[state=checked]:bg-emerald-500"
                                />
                                <div>
                                  <span className={cn(
                                    "font-medium",
                                    v.in_stock ? "text-foreground" : "text-muted-foreground line-through"
                                  )}>
                                    {v.name}
                                  </span>
                                  {v.ml && <span className="ml-1.5 text-xs text-muted-foreground">({v.ml}ml)</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-semibold text-foreground">
                                  {formatUYU(v.price_int)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={() => openVariantEdit(p, v)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleVariantDelete(v.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Encargue price info */}
                    {p.sale_by_order && p.encargue_price_int && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-400/5 px-3 py-2 ring-1 ring-amber-400/10">
                        <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-xs text-amber-400">
                          Precio encargue: <span className="font-semibold">{formatUYU(p.encargue_price_int)}</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Product dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border/40 bg-background max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Editar" : "Nuevo"} Producto</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nombre</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : autoSlug(e.target.value) })}
                  className="border-border/40 bg-secondary/30 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="border-border/40 bg-secondary/30 font-mono text-xs focus-visible:ring-primary/30"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Marca</Label>
                <Input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="border-border/40 bg-secondary/30 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Color (Hex)</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.color_hex}
                    onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
                    placeholder="#RRGGBB"
                    className="border-border/40 bg-secondary/30 font-mono text-xs focus-visible:ring-primary/30"
                  />
                  {form.color_hex && /^#[0-9A-Fa-f]{6}$/.test(form.color_hex) && (
                    <div className="h-9 w-9 shrink-0 rounded-lg border border-border/40" style={{ backgroundColor: form.color_hex }} />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Categorias</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map((c) => {
                  const checked = form.category_ids.includes(c.id)
                  return (
                    <label
                      key={c.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-all",
                        checked
                          ? "border-primary/30 bg-primary/5 text-foreground"
                          : "border-border/30 bg-secondary/20 text-muted-foreground hover:border-border/50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? Array.from(new Set([...form.category_ids, c.id]))
                            : form.category_ids.filter((id) => id !== c.id)
                          setForm({ ...form, category_ids: next })
                        }}
                        className="sr-only"
                      />
                      <div className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border transition-all",
                        checked ? "border-primary bg-primary text-primary-foreground" : "border-border/60"
                      )}>
                        {checked && <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="truncate">{c.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Descripcion</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="border-border/40 bg-secondary/30 resize-none focus-visible:ring-primary/30"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3 rounded-xl border border-border/30 bg-secondary/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-400" />
                  <Label htmlFor="featured" className="text-sm text-foreground">Destacado</Label>
                </div>
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} id="featured" />
              </div>
              <div className="h-px bg-border/20" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-amber-400" />
                  <Label htmlFor="sale_by_order" className="text-sm text-foreground">Venta por encargue</Label>
                </div>
                <Switch checked={form.sale_by_order} onCheckedChange={(v) => setForm({ ...form, sale_by_order: v })} id="sale_by_order" />
              </div>
              {form.sale_by_order && (
                <div className="ml-6 space-y-2">
                  <Label className="text-xs text-muted-foreground">Precio encargue (UYU)</Label>
                  <Input
                    type="number"
                    value={form.encargue_price_int}
                    onChange={(e) => setForm({ ...form, encargue_price_int: e.target.value })}
                    placeholder="Ej: 850"
                    className="border-border/40 bg-secondary/30 focus-visible:ring-primary/30"
                  />
                  <p className="text-[11px] text-muted-foreground/60">Si se deja vacio, se usara el precio del decant mas barato.</p>
                </div>
              )}
              <div className="h-px bg-border/20" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {form.is_active ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  <Label htmlFor="active" className="text-sm text-foreground">Activo</Label>
                </div>
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} id="active" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border/40">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variant dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="border-border/40 bg-background sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingVariant ? "Editar" : "Nueva"} Variante
              <span className="ml-2 text-sm font-normal text-muted-foreground">- {variantProduct?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nombre</Label>
              <Input
                value={variantForm.name}
                onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                placeholder="Ej: Decant, EDP 50ml"
                className="border-border/40 bg-secondary/30 focus-visible:ring-primary/30"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">ml (opcional)</Label>
                <Input
                  type="number"
                  value={variantForm.ml}
                  onChange={(e) => setVariantForm({ ...variantForm, ml: e.target.value })}
                  className="border-border/40 bg-secondary/30 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Precio (UYU)</Label>
                <Input
                  type="number"
                  value={variantForm.price_int}
                  onChange={(e) => setVariantForm({ ...variantForm, price_int: e.target.value })}
                  className="border-border/40 bg-secondary/30 focus-visible:ring-primary/30"
                />
              </div>
            </div>
            <div className="flex gap-6 rounded-xl border border-border/30 bg-secondary/10 p-3">
              <div className="flex items-center gap-2">
                <Switch checked={variantForm.in_stock} onCheckedChange={(v) => setVariantForm({ ...variantForm, in_stock: v })} id="v-stock" className="data-[state=checked]:bg-emerald-500" />
                <Label htmlFor="v-stock" className="text-sm text-foreground">En stock</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={variantForm.is_active} onCheckedChange={(v) => setVariantForm({ ...variantForm, is_active: v })} id="v-active" />
                <Label htmlFor="v-active" className="text-sm text-foreground">Activa</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setVariantDialogOpen(false)} className="border-border/40">
              Cancelar
            </Button>
            <Button onClick={handleVariantSave} className="bg-primary hover:bg-primary/90">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="border-border/40 bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminaran tambien sus imagenes y variantes. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/40">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
