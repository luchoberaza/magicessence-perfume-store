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
import { Plus, Pencil, Trash2, Upload, X, Search } from "lucide-react"
import { toast } from "sonner"
import { formatUYU } from "@/lib/currency"

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
  const [form, setForm] = useState({
    name: "",
    slug: "",
    brand: "",
    description: "",
    color_hex: "",
    category_ids: [] as number[],
    featured: false,
    is_active: true,
  })

  // Variant management
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
    setForm({ name: "", slug: "", brand: "", description: "", color_hex: "", category_ids: [], featured: false, is_active: true })
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
      is_active: p.is_active,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    const body = {
      ...form,
      color_hex: form.color_hex?.trim() ? form.color_hex.trim() : null,
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

  // Variant CRUD
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Productos</h2>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-secondary/50 pl-9" />
          </div>
          <Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nuevo</Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary/50" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl glass py-12 text-center"><p className="text-muted-foreground">No hay productos</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl bg-secondary/30 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {p.images && p.images[0] && <img src={p.images[0].url} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{p.name}</p>
                      {p.featured && <Badge variant="outline" className="text-primary border-primary/30 text-[10px]">Destacado</Badge>}
                      {!p.is_active && <Badge variant="outline" className="text-destructive border-destructive/30 text-[10px]">Inactivo</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{p.brand || "Sin marca"} - {p.category_name || "Sin categoria"}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(p.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>

              {/* Images */}
              <div className="flex items-center gap-2 flex-wrap">
                {p.images?.map((img) => (
                  <div key={img.id} className="group relative h-12 w-12">
                    <img src={img.url} alt="" className="h-full w-full rounded-md object-cover" />
                    <button onClick={() => handleImageDelete(img.id, img.url)} className="absolute -right-1 -top-1 hidden rounded-full bg-destructive p-0.5 text-destructive-foreground group-hover:block">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <Upload className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(p.id, e.target.files[0]); e.target.value = "" }} />
                </label>
              </div>

              {/* Variants */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Variantes</p>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openVariantCreate(p)}>
                    <Plus className="mr-1 h-3 w-3" />Agregar
                  </Button>
                </div>
                {(!p.variants || p.variants.length === 0) ? (
                  <p className="text-xs text-muted-foreground/60">Sin variantes</p>
                ) : (
                  <div className="space-y-1">
                    {p.variants.map((v) => (
                      <div key={v.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Switch checked={v.in_stock} onCheckedChange={() => toggleVariantStock(v)} className="scale-75" />
                          <span className={`font-medium ${v.in_stock ? "text-foreground" : "text-muted-foreground line-through"}`}>
                            {v.name}{v.ml ? ` (${v.ml}ml)` : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{formatUYU(v.price_int)}</span>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openVariantEdit(p, v)}><Pencil className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleVariantDelete(v.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-background max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-foreground">{editing ? "Editar" : "Nuevo"} Producto</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">Nombre</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : autoSlug(e.target.value) })} className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-secondary/50" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">Marca</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Color (Hex)</Label>
                <Input
                  value={form.color_hex}
                  onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
                  placeholder="#RRGGBB (opcional)"
                  className="bg-secondary/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Categorias (puede ser más de una)</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map((c) => {
                  const checked = form.category_ids.includes(c.id)
                  return (
                    <label key={c.id} className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? Array.from(new Set([...form.category_ids, c.id]))
                            : form.category_ids.filter((id) => id !== c.id)
                          setForm({ ...form, category_ids: next })
                        }}
                      />
                      <span className="truncate">{c.name}</span>
                    </label>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">Tip: el primer checkbox marcado se usa como categoría principal (para compatibilidad).</p>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Descripcion</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="bg-secondary/50 resize-none" />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} id="featured" />
                <Label htmlFor="featured" className="text-foreground">Destacado</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} id="active" />
                <Label htmlFor="active" className="text-foreground">Activo</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variant dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="bg-background">
          <DialogHeader><DialogTitle className="text-foreground">{editingVariant ? "Editar" : "Nueva"} Variante - {variantProduct?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Nombre (ej: Decant, EDP 50ml, etc.)</Label>
              <Input value={variantForm.name} onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })} className="bg-secondary/50" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">ml (opcional)</Label>
                <Input type="number" value={variantForm.ml} onChange={(e) => setVariantForm({ ...variantForm, ml: e.target.value })} className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Precio (UYU)</Label>
                <Input type="number" value={variantForm.price_int} onChange={(e) => setVariantForm({ ...variantForm, price_int: e.target.value })} className="bg-secondary/50" />
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={variantForm.in_stock} onCheckedChange={(v) => setVariantForm({ ...variantForm, in_stock: v })} id="v-stock" />
                <Label htmlFor="v-stock" className="text-foreground">En stock</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={variantForm.is_active} onCheckedChange={(v) => setVariantForm({ ...variantForm, is_active: v })} id="v-active" />
                <Label htmlFor="v-active" className="text-foreground">Activa</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVariantDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleVariantSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>Se eliminaran tambien sus imagenes y variantes. Esta accion no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
