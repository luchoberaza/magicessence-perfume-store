"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import {
  Plus, Pencil, Trash2, Upload, X, Search, Package,
  Eye, EyeOff, Star, DollarSign, Check,
  CircleDot, Archive, ArrowLeft
} from "lucide-react"
import { toast } from "sonner"
import { formatUYU } from "@/lib/currency"
import { cn } from "@/lib/utils"

interface Variant { id: number; name: string; ml: number | null; price_int: number; in_stock: boolean; is_active: boolean; by_order: boolean }
interface ProductImage { id: number; url: string; sort_order: number }
interface Product {
  id: number; name: string; slug: string; brand: string | null; description: string | null
  category_id: number | null; category_ids?: number[]; color_hex: string | null
  category_name: string | null; featured: boolean; sale_by_order: boolean
  encargue_price_int: number | null; is_active: boolean
  images: ProductImage[] | null; variants: Variant[] | null
}
interface Category { id: number; name: string; slug: string }

const COLOR_PALETTE = [
  { hex: "#a855f7", name: "Violeta" }, { hex: "#ec4899", name: "Rosa" },
  { hex: "#ef4444", name: "Rojo" }, { hex: "#f97316", name: "Naranja" },
  { hex: "#eab308", name: "Dorado" }, { hex: "#22c55e", name: "Verde" },
  { hex: "#06b6d4", name: "Cyan" }, { hex: "#3b82f6", name: "Azul" },
  { hex: "#6366f1", name: "Indigo" }, { hex: "#f5f5f4", name: "Blanco" },
  { hex: "#a8a29e", name: "Gris" }, { hex: "#78716c", name: "Piedra" },
]

export function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [form, setForm] = useState({
    name: "", slug: "", brand: "", description: "", color_hex: "",
    category_ids: [] as number[], featured: false, sale_by_order: false,
    encargue_price_int: "", is_active: true,
  })
  const [variantDialogOpen, setVariantDialogOpen] = useState(false)
  const [variantProduct, setVariantProduct] = useState<Product | null>(null)
  const [variantForm, setVariantForm] = useState({ name: "", ml: "", price_int: "", in_stock: true, is_active: true, by_order: false })
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [pRes, cRes] = await Promise.all([fetch("/api/admin/products"), fetch("/api/admin/categories")])
    setProducts(await pRes.json())
    setCategories(await cRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  function autoSlug(name: string) { return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }

  function openCreate() {
    setEditing(null)
    setForm({ name: "", slug: "", brand: "", description: "", color_hex: "", category_ids: [], featured: false, sale_by_order: false, encargue_price_int: "", is_active: true })
    setDialogOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    const catIds = (p.category_ids?.length) ? p.category_ids : (p.category_id ? [p.category_id] : [])
    setForm({ name: p.name, slug: p.slug, brand: p.brand || "", description: p.description || "", color_hex: p.color_hex || "", category_ids: catIds, featured: p.featured, sale_by_order: p.sale_by_order, encargue_price_int: p.encargue_price_int ? String(p.encargue_price_int) : "", is_active: p.is_active })
    setDialogOpen(true)
  }

  async function handleSave() {
    const body = { ...form, color_hex: form.color_hex?.trim() || null, encargue_price_int: form.encargue_price_int ? parseInt(form.encargue_price_int) : null, category_ids: form.category_ids, ...(editing ? { id: editing.id } : {}) }
    const method = editing ? "PUT" : "POST"
    const res = await fetch("/api/admin/products", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) { toast.success(editing ? "Producto actualizado" : "Producto creado"); setDialogOpen(false); fetchAll() }
    else toast.error("Error al guardar")
  }

  async function handleDelete() {
    if (!deleteId) return
    const res = await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteId }) })
    if (res.ok) { toast.success("Producto eliminado"); fetchAll(); if (selectedProduct?.id === deleteId) { setSelectedProduct(null); setMobileDetailOpen(false) } }
    setDeleteId(null)
  }

  async function handleImageUpload(productId: number, file: File) {
    const fd = new FormData(); fd.append("file", file); fd.append("product_id", String(productId)); fd.append("sort_order", "0")
    const res = await fetch("/api/admin/images", { method: "POST", body: fd })
    if (res.ok) { toast.success("Imagen subida"); fetchAll() } else toast.error("Error al subir imagen")
  }

  async function handleImageDelete(imageId: number, url: string) {
    const res = await fetch("/api/admin/images", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: imageId, url }) })
    if (res.ok) { toast.success("Imagen eliminada"); fetchAll() }
  }

  function openVariantCreate(p: Product) { setVariantProduct(p); setEditingVariant(null); setVariantForm({ name: "", ml: "", price_int: "", in_stock: true, is_active: true, by_order: false }); setVariantDialogOpen(true) }
  function openVariantEdit(p: Product, v: Variant) { setVariantProduct(p); setEditingVariant(v); setVariantForm({ name: v.name, ml: v.ml ? String(v.ml) : "", price_int: String(v.price_int), in_stock: v.in_stock, is_active: v.is_active, by_order: v.by_order }); setVariantDialogOpen(true) }

  async function handleVariantSave() {
    const body = { product_id: variantProduct!.id, name: variantForm.name, ml: variantForm.ml ? parseInt(variantForm.ml) : null, price_int: parseInt(variantForm.price_int), in_stock: variantForm.in_stock, is_active: variantForm.is_active, by_order: variantForm.by_order, ...(editingVariant ? { id: editingVariant.id } : {}) }
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
    await fetch("/api/admin/variants", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...v, in_stock: !v.in_stock }) })
    fetchAll()
  }

  const filtered = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand?.toLowerCase().includes(searchQuery.toLowerCase()))

  useEffect(() => {
    if (selectedProduct) {
      const updated = products.find((p) => p.id === selectedProduct.id)
      if (updated) setSelectedProduct(updated)
    }
  }, [products])

  function handleSelectProduct(p: Product) {
    setSelectedProduct(p)
    setMobileDetailOpen(true)
  }

  // ── Shared detail content (used by both desktop panel and mobile sheet) ──
  const detailContent = selectedProduct && (
    <div className="h-full overflow-y-auto">
      {/* Hero */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 lg:h-48">
        {selectedProduct.images?.[0] && <img src={selectedProduct.images[0].url} alt="" className="h-full w-full object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(235,28%,7%)] via-transparent" />
        <div className="absolute bottom-4 left-4 right-4 lg:left-5 lg:right-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                {selectedProduct.featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                {selectedProduct.sale_by_order && <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-400">Encargue</span>}
                {!selectedProduct.is_active && <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-400">Inactivo</span>}
              </div>
              <h2 className="text-lg font-bold text-foreground lg:text-xl" style={selectedProduct.color_hex ? { color: selectedProduct.color_hex } : undefined}>
                {selectedProduct.name}
              </h2>
              <p className="text-xs text-muted-foreground/70 lg:text-sm">{selectedProduct.brand || "Sin marca"} · {selectedProduct.category_name || "Sin categoria"}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => openEdit(selectedProduct)} className="h-8 w-8 rounded-lg bg-white/[0.06] p-0 hover:bg-white/10"><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteId(selectedProduct.id)} className="h-8 w-8 rounded-lg bg-white/[0.06] p-0 hover:bg-red-500/20 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4 lg:space-y-6 lg:p-5">
        {selectedProduct.description && <p className="text-sm leading-relaxed text-muted-foreground/70">{selectedProduct.description}</p>}

        {/* Images */}
        <div>
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">Imagenes</h3>
          <div className="flex gap-2 flex-wrap">
            {selectedProduct.images?.map((img) => (
              <div key={img.id} className="group relative h-16 w-16 overflow-hidden rounded-xl ring-1 ring-white/[0.06] lg:h-20 lg:w-20">
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                <button onClick={() => handleImageDelete(img.id, img.url)} className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity active:opacity-100 lg:group-hover:opacity-100">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            ))}
            <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/10 transition-colors hover:border-violet-500/40 lg:h-20 lg:w-20">
              <Upload className="h-4 w-4 text-muted-foreground/30" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(selectedProduct.id, e.target.files[0]); e.target.value = "" }} />
            </label>
          </div>
        </div>

        {/* Variants */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">Variantes</h3>
            <Button size="sm" variant="ghost" onClick={() => openVariantCreate(selectedProduct)} className="h-7 gap-1 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10">
              <Plus className="h-3 w-3" /> Agregar
            </Button>
          </div>
          {!selectedProduct.variants?.length ? (
            <p className="py-4 text-center text-xs text-muted-foreground/30">Sin variantes</p>
          ) : (
            <div className="space-y-1">
              {selectedProduct.variants.map((v) => (
                <div key={v.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.02]">
                  {v.by_order ? (
                    <span className="shrink-0" title="Por encargue"><Package className="h-4 w-4 text-amber-400" /></span>
                  ) : (
                    <button onClick={() => toggleVariantStock(v)} className="shrink-0">
                      <CircleDot className={cn("h-4 w-4 transition-colors", v.in_stock ? "text-emerald-400" : "text-muted-foreground/30")} />
                    </button>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className={cn("text-sm font-medium", v.by_order || v.in_stock ? "text-foreground" : "text-muted-foreground/50 line-through")}>{v.name}</span>
                    {v.ml && <span className="ml-1.5 text-xs text-muted-foreground/40">{v.ml}ml</span>}
                    {v.by_order && <span className="ml-1.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-400">encargue</span>}
                  </div>
                  <span className="shrink-0 font-mono text-sm font-semibold text-foreground/80">{formatUYU(v.price_int)}</span>
                  <button onClick={() => openVariantEdit(selectedProduct, v)} className="rounded-md p-1.5 text-muted-foreground/40 active:bg-white/[0.06] lg:hover:bg-white/[0.06] lg:hover:text-foreground">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => handleVariantDelete(v.id)} className="rounded-md p-1.5 text-muted-foreground/40 active:bg-red-500/10 lg:hover:bg-red-500/10 lg:hover:text-red-400">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedProduct.sale_by_order && selectedProduct.encargue_price_int && (
          <div className="flex items-center gap-3 rounded-xl bg-amber-500/5 px-4 py-3 ring-1 ring-amber-500/10">
            <DollarSign className="h-4 w-4 text-amber-400" />
            <div>
              <p className="text-xs text-amber-400/70">Precio encargue</p>
              <p className="font-mono text-sm font-bold text-amber-300">{formatUYU(selectedProduct.encargue_price_int)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <div className="flex gap-6 lg:h-[calc(100vh-130px)]">
        {/* Product list */}
        <div className="flex w-full flex-col lg:w-[420px] lg:shrink-0">
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
              <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 border-border/20 bg-white/[0.03] pl-9 text-sm focus-visible:ring-violet-500/30" />
            </div>
            <Button size="sm" onClick={openCreate} className="h-9 gap-1.5 bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nuevo</span>
            </Button>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[0.02]" />)
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Package className="mb-3 h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground/60">Sin resultados</p>
              </div>
            ) : (
              filtered.map((p) => {
                const isSelected = selectedProduct?.id === p.id
                const stockVariants = p.variants?.filter((v) => !v.by_order) ?? []
                const orderCount = p.variants?.filter((v) => v.by_order).length ?? 0
                const stockCount = stockVariants.filter((v) => v.in_stock).length
                const totalVariants = stockVariants.length
                const minP = p.variants?.length ? Math.min(...p.variants.map((v) => v.price_int)) : null

                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all",
                      isSelected ? "bg-violet-500/10 ring-1 ring-violet-500/20 lg:bg-violet-500/10 lg:ring-1" : "hover:bg-white/[0.03] active:bg-white/[0.05]",
                      !p.is_active && "opacity-50"
                    )}
                  >
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
                      {p.images?.[0] ? <img src={p.images[0].url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Package className="h-4 w-4 text-muted-foreground/20" /></div>}
                      {p.featured && <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-background" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground">{p.name}</span>
                        {p.sale_by_order && <span className="shrink-0 rounded bg-amber-500/10 px-1 py-0.5 text-[9px] font-semibold uppercase text-amber-400">enc</span>}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                        <span>{p.brand || "—"}</span>
                        {totalVariants > 0 && <><span className="text-border/40">·</span><span className={stockCount > 0 ? "text-emerald-400/70" : ""}>{stockCount}/{totalVariants}</span></>}
                        {orderCount > 0 && <><span className="text-border/40">·</span><span className="text-amber-400/70">{orderCount} enc</span></>}
                      </div>
                    </div>
                    {minP != null && <span className="shrink-0 font-mono text-xs font-medium text-muted-foreground">{formatUYU(minP)}</span>}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Desktop detail panel */}
        <div className="hidden flex-1 lg:block">
          {selectedProduct ? (
            <div className="h-full overflow-hidden rounded-2xl border border-border/10 bg-[hsl(235,28%,7%)]">
              {detailContent}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/20">
              <Package className="mb-4 h-12 w-12 text-muted-foreground/10" />
              <p className="text-sm text-muted-foreground/40">Selecciona un producto</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile detail sheet ── */}
      {mobileDetailOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileDetailOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col bg-[hsl(235,28%,7%)] animate-in slide-in-from-right duration-200">
            {/* Mobile detail header */}
            <div className="flex items-center gap-3 border-b border-border/10 px-4 py-3">
              <button onClick={() => setMobileDetailOpen(false)} className="rounded-lg p-1.5 text-muted-foreground active:bg-white/[0.04]">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="flex-1 truncate text-sm font-semibold text-foreground">{selectedProduct.name}</span>
            </div>
            {/* Detail content */}
            <div className="flex-1 overflow-y-auto pb-20">
              {detailContent}
            </div>
          </div>
        </div>
      )}

      {/* ── Dialogs (shared) ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border/20 bg-[hsl(235,28%,8%)] max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle className="text-foreground">{editing ? "Editar" : "Nuevo"} Producto</DialogTitle></DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Nombre</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : autoSlug(e.target.value) })} className="h-9 border-border/20 bg-white/[0.03] text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="h-9 border-border/20 bg-white/[0.03] font-mono text-xs" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Marca</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="h-9 border-border/20 bg-white/[0.03] text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Color titulo</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input value={form.color_hex} onChange={(e) => setForm({ ...form, color_hex: e.target.value })} placeholder="#hex" className="h-9 border-border/20 bg-white/[0.03] font-mono text-xs pr-9" />
                    <label className="absolute right-1.5 top-1/2 -translate-y-1/2">
                      <input type="color" value={form.color_hex && /^#[0-9A-Fa-f]{6}$/i.test(form.color_hex) ? form.color_hex : "#a855f7"} onChange={(e) => setForm({ ...form, color_hex: e.target.value })} className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded" />
                    </label>
                  </div>
                  {form.color_hex && /^#[0-9A-Fa-f]{6}$/.test(form.color_hex) && <div className="h-7 w-7 shrink-0 rounded-md ring-1 ring-white/10" style={{ backgroundColor: form.color_hex }} />}
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {COLOR_PALETTE.map((c) => (
                    <button key={c.hex} type="button" title={c.name} onClick={() => setForm({ ...form, color_hex: c.hex })} className={cn("h-5 w-5 rounded-full ring-1 transition-all hover:scale-125 active:scale-110", form.color_hex === c.hex ? "ring-violet-400 scale-125" : "ring-white/10")} style={{ backgroundColor: c.hex }} />
                  ))}
                  {form.color_hex && <button type="button" onClick={() => setForm({ ...form, color_hex: "" })} className="flex h-5 w-5 items-center justify-center rounded-full ring-1 ring-white/10 hover:ring-red-400/50"><X className="h-2.5 w-2.5 text-muted-foreground/50" /></button>}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Categorias</Label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => {
                  const checked = form.category_ids.includes(c.id)
                  return (
                    <button key={c.id} type="button" onClick={() => { const next = checked ? form.category_ids.filter((id) => id !== c.id) : [...form.category_ids, c.id]; setForm({ ...form, category_ids: next }) }} className={cn("flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all", checked ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30" : "bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] ring-1 ring-white/[0.06]")}>
                      {checked && <Check className="h-3 w-3" />}{c.name}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Descripcion</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="border-border/20 bg-white/[0.03] resize-none text-sm" />
            </div>
            <div className="space-y-0 divide-y divide-border/10 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.06]">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5"><Star className="h-3.5 w-3.5 text-amber-400/70" /><span className="text-sm text-foreground">Destacado</span></div>
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} className="data-[state=checked]:bg-violet-500" />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5"><Archive className="h-3.5 w-3.5 text-amber-400/70" /><span className="text-sm text-foreground">Venta por encargue</span></div>
                <Switch checked={form.sale_by_order} onCheckedChange={(v) => setForm({ ...form, sale_by_order: v })} className="data-[state=checked]:bg-violet-500" />
              </div>
              {form.sale_by_order && (
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2"><DollarSign className="h-3.5 w-3.5 text-amber-400/70" /><Input type="number" value={form.encargue_price_int} onChange={(e) => setForm({ ...form, encargue_price_int: e.target.value })} placeholder="Precio encargue (UYU)" className="h-8 flex-1 border-border/20 bg-white/[0.03] text-sm" /></div>
                  <p className="mt-1.5 pl-6 text-[10px] text-muted-foreground/50">Vacio = precio del decant mas barato</p>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">{form.is_active ? <Eye className="h-3.5 w-3.5 text-emerald-400/70" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground/50" />}<span className="text-sm text-foreground">Visible</span></div>
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} className="data-[state=checked]:bg-emerald-500" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-500 text-white">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="border-border/20 bg-[hsl(235,28%,8%)] sm:max-w-md">
          <DialogHeader><DialogTitle className="text-foreground">{editingVariant ? "Editar" : "Nueva"} Variante <span className="ml-2 text-sm font-normal text-muted-foreground/60">— {variantProduct?.name}</span></DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Nombre</Label>
              <Input value={variantForm.name} onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })} placeholder="Decant, EDP 50ml..." className="h-9 border-border/20 bg-white/[0.03] text-sm" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">ml</Label><Input type="number" value={variantForm.ml} onChange={(e) => setVariantForm({ ...variantForm, ml: e.target.value })} className="h-9 border-border/20 bg-white/[0.03] text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Precio UYU</Label><Input type="number" value={variantForm.price_int} onChange={(e) => setVariantForm({ ...variantForm, price_int: e.target.value })} className="h-9 border-border/20 bg-white/[0.03] text-sm" /></div>
            </div>
            <div className="space-y-0 divide-y divide-border/10 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.06]">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5"><Package className="h-3.5 w-3.5 text-amber-400/70" /><span className="text-sm text-foreground">Por encargue</span></div>
                <Switch checked={variantForm.by_order} onCheckedChange={(v) => setVariantForm({ ...variantForm, by_order: v })} className="data-[state=checked]:bg-amber-500" />
              </div>
              <div className={cn("flex items-center justify-between px-4 py-3 transition-opacity", variantForm.by_order && "opacity-40")}>
                <div className="flex items-center gap-2.5"><CircleDot className="h-3.5 w-3.5 text-emerald-400/70" /><span className="text-sm text-foreground">Stock inmediato</span></div>
                <Switch checked={variantForm.in_stock} disabled={variantForm.by_order} onCheckedChange={(v) => setVariantForm({ ...variantForm, in_stock: v })} className="data-[state=checked]:bg-emerald-500" />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">{variantForm.is_active ? <Eye className="h-3.5 w-3.5 text-emerald-400/70" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground/50" />}<span className="text-sm text-foreground">Activa</span></div>
                <Switch checked={variantForm.is_active} onCheckedChange={(v) => setVariantForm({ ...variantForm, is_active: v })} className="data-[state=checked]:bg-violet-500" />
              </div>
            </div>
            {variantForm.by_order && <p className="pl-1 text-[10px] leading-relaxed text-amber-400/60">Esta presentacion se vende por encargue: no descuenta stock y muestra la advertencia de demora (24/72hs) en la tienda.</p>}
          </div>
          <DialogFooter className="gap-2 pt-2 sm:gap-0"><Button variant="ghost" onClick={() => setVariantDialogOpen(false)} className="text-muted-foreground">Cancelar</Button><Button onClick={handleVariantSave} className="bg-violet-600 hover:bg-violet-500 text-white">Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="border-border/20 bg-[hsl(235,28%,8%)]">
          <AlertDialogHeader><AlertDialogTitle className="text-foreground">Eliminar producto</AlertDialogTitle><AlertDialogDescription>Se eliminaran sus imagenes y variantes.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="border-border/20 bg-transparent text-muted-foreground">Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-500">Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
