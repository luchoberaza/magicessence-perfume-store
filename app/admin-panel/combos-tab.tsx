"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, Upload, X, ImageIcon, Gift, Check, PackageX } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatUYU } from "@/lib/currency"

interface AdminCombo {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
  slots: number
  price_int: number
  is_active: boolean
  sort_order: number
  category_ids: number[]
  excluded_product_ids: number[]
  available_count: number
}

interface AdminCategory {
  id: number
  name: string
}

interface PoolProduct {
  id: number
  name: string
  brand: string | null
  image_url: string | null
  category_name: string | null
  has_stock: boolean
  excluded: boolean
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  slots: "3",
  price_int: "",
  sort_order: "0",
  is_active: true,
}

export function CombosTab() {
  const [combos, setCombos] = useState<AdminCombo[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCombo | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Panel de perfumes del combo
  const [poolCombo, setPoolCombo] = useState<AdminCombo | null>(null)
  const [pool, setPool] = useState<PoolProduct[]>([])
  const [poolLoading, setPoolLoading] = useState(false)
  const [excluded, setExcluded] = useState<number[]>([])
  const [poolSaving, setPoolSaving] = useState(false)

  async function fetchCombos() {
    setLoading(true)
    try {
      const [combosRes, catsRes] = await Promise.all([
        fetch("/api/admin/combos"),
        fetch("/api/admin/categories"),
      ])
      setCombos(await combosRes.json())
      setCategories(await catsRes.json())
    } catch {
      toast.error("Error al cargar combos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCombos() }, [])

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setSelectedCategories([])
    setImagePreview(null)
    setImageFile(null)
    setDialogOpen(true)
  }

  function openEdit(combo: AdminCombo) {
    setEditing(combo)
    setForm({
      name: combo.name,
      slug: combo.slug,
      description: combo.description || "",
      slots: String(combo.slots),
      price_int: String(combo.price_int),
      sort_order: String(combo.sort_order),
      is_active: combo.is_active,
    })
    setSelectedCategories(combo.category_ids || [])
    setImagePreview(combo.image_url)
    setImageFile(null)
    setDialogOpen(true)
  }

  function toggleCategory(id: number) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Solo se permiten imagenes"); return }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5 MB"); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("El nombre es obligatorio"); return }
    if (!form.price_int.trim()) { toast.error("El precio es obligatorio"); return }
    if (selectedCategories.length === 0) { toast.error("Elegi al menos una categoria"); return }

    setSaving(true)
    try {
      const body = {
        ...(editing ? { id: editing.id } : {}),
        name: form.name.trim(),
        slug: form.slug.trim() || autoSlug(form.name),
        description: form.description.trim(),
        slots: parseInt(form.slots) || 3,
        price_int: parseInt(form.price_int) || 0,
        sort_order: parseInt(form.sort_order) || 0,
        is_active: form.is_active,
        category_ids: selectedCategories,
        // Las exclusiones se administran en el panel de perfumes; al editar hay
        // que reenviarlas para no perderlas.
        excluded_product_ids: editing?.excluded_product_ids ?? [],
      }
      const res = await fetch("/api/admin/combos", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || "Error al guardar")
        return
      }
      const saved = await res.json()

      if (imageFile) {
        const fd = new FormData()
        fd.append("file", imageFile)
        fd.append("combo_id", String(saved.id))
        await fetch("/api/admin/combos/image", { method: "POST", body: fd })
      }

      if (editing?.image_url && !imagePreview && !imageFile) {
        await fetch("/api/admin/combos/image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ combo_id: saved.id, url: editing.image_url }),
        }).catch(() => { })
      }

      toast.success(editing ? "Combo actualizado" : "Combo creado")
      setDialogOpen(false)
      fetchCombos()
    } catch {
      toast.error("Error inesperado")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    const combo = combos.find((c) => c.id === deleteId)
    if (combo?.image_url) {
      await fetch("/api/admin/combos/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ combo_id: deleteId, url: combo.image_url }),
      }).catch(() => { })
    }
    const res = await fetch("/api/admin/combos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    })
    if (res.ok) { toast.success("Combo eliminado"); fetchCombos() }
    setDeleteId(null)
  }

  async function openPool(combo: AdminCombo) {
    setPoolCombo(combo)
    setExcluded(combo.excluded_product_ids || [])
    setPoolLoading(true)
    try {
      const res = await fetch(`/api/admin/combos?pool=${combo.id}`)
      setPool(await res.json())
    } catch {
      toast.error("Error al cargar los perfumes")
    } finally {
      setPoolLoading(false)
    }
  }

  function toggleExcluded(productId: number) {
    setExcluded((prev) =>
      prev.includes(productId) ? prev.filter((p) => p !== productId) : [...prev, productId]
    )
  }

  async function savePool() {
    if (!poolCombo) return
    setPoolSaving(true)
    try {
      const res = await fetch("/api/admin/combos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: poolCombo.id,
          name: poolCombo.name,
          slug: poolCombo.slug,
          description: poolCombo.description,
          slots: poolCombo.slots,
          price_int: poolCombo.price_int,
          is_active: poolCombo.is_active,
          sort_order: poolCombo.sort_order,
          category_ids: poolCombo.category_ids,
          excluded_product_ids: excluded,
        }),
      })
      if (!res.ok) { toast.error("Error al guardar"); return }
      toast.success("Perfumes actualizados")
      setPoolCombo(null)
      fetchCombos()
    } catch {
      toast.error("Error inesperado")
    } finally {
      setPoolSaving(false)
    }
  }

  const includedCount = pool.filter((p) => p.has_stock && !excluded.includes(p.id)).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground/50">{combos.length} combos</p>
        <Button size="sm" onClick={openCreate} className="h-9 gap-1.5 bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20">
          <Plus className="h-3.5 w-3.5" /> Nuevo
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-white/[0.02]" />)}
        </div>
      ) : combos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Gift className="mb-3 h-10 w-10 text-muted-foreground/15" />
          <p className="text-sm text-muted-foreground/40">No hay combos</p>
          <p className="mt-1 text-xs text-muted-foreground/30">Crea uno para que aparezca en /combos</p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {combos.map((combo) => (
            <div
              key={combo.id}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.02] transition-all hover:border-white/[0.08] hover:bg-white/[0.03]"
            >
              <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
                {combo.image_url ? (
                  <img src={combo.image_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Gift className="h-8 w-8 text-muted-foreground/10" />
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{combo.name}</p>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground/40">/{combo.slug}</p>
                  </div>
                  {!combo.is_active && (
                    <span className="shrink-0 rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-muted-foreground/50">
                      Inactivo
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-300">
                    {formatUYU(combo.price_int)}
                  </span>
                  <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[11px] text-muted-foreground/60">
                    {combo.slots} perfumes
                  </span>
                </div>

                <button
                  onClick={() => openPool(combo)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                    combo.available_count >= combo.slots
                      ? "border-white/[0.06] bg-white/[0.02] text-muted-foreground/70 hover:border-violet-500/30 hover:text-foreground"
                      : "border-amber-500/20 bg-amber-500/[0.04] text-amber-300/80 hover:border-amber-500/40"
                  )}
                >
                  <span>
                    {combo.available_count} perfume{combo.available_count === 1 ? "" : "s"} disponible{combo.available_count === 1 ? "" : "s"}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider opacity-60">Editar</span>
                </button>
                {combo.available_count < combo.slots && (
                  <p className="text-[10px] leading-tight text-amber-400/70">
                    Hay menos perfumes que slots: el combo no se puede completar en la tienda.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="absolute right-3 top-3 flex gap-1 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
                <button
                  onClick={() => openEdit(combo)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 active:bg-black/80"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setDeleteId(combo.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-red-600 active:bg-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog alta/edicion */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto border-border/20 bg-[hsl(235,28%,8%)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Editar" : "Nuevo"} Combo</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            {/* Imagen */}
            <div>
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-xl ring-1 ring-white/[0.06]">
                  <img src={imagePreview} alt="" className="aspect-video w-full object-cover" />
                  <button onClick={removeImage} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 transition-all",
                    dragging ? "border-violet-500/50 bg-violet-500/5" : "border-white/[0.06] hover:border-violet-500/30"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <Upload className="h-5 w-5 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground/50">Arrastra o <span className="text-violet-400">click</span></p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]) }} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Nombre</Label>
              <Input
                value={form.name}
                placeholder="Combo 3 decants de 5ml"
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : autoSlug(e.target.value) })}
                className="h-9 border-border/20 bg-white/[0.03] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="h-9 border-border/20 bg-white/[0.03] font-mono text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Descripcion</Label>
              <Textarea
                value={form.description}
                rows={3}
                placeholder="Elegi 3 decants de 5ml de nuestras fragancias arabes y de nicho."
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="resize-none border-border/20 bg-white/[0.03] text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Precio</Label>
                <Input type="number" value={form.price_int} onChange={(e) => setForm({ ...form, price_int: e.target.value })} className="h-9 border-border/20 bg-white/[0.03] text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Perfumes</Label>
                <Input type="number" min={2} max={10} value={form.slots} onChange={(e) => setForm({ ...form, slots: e.target.value })} className="h-9 border-border/20 bg-white/[0.03] text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Orden</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="h-9 border-border/20 bg-white/[0.03] text-sm" />
              </div>
            </div>

            {/* Categorias */}
            <div className="space-y-2">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Categorias del combo
              </Label>
              {categories.length === 0 ? (
                <p className="text-xs text-muted-foreground/40">No hay categorias creadas</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => {
                    const active = selectedCategories.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all",
                          active
                            ? "border-violet-500/40 bg-violet-500/10 text-violet-200"
                            : "border-white/[0.06] bg-white/[0.02] text-muted-foreground/60 hover:border-white/[0.12]"
                        )}
                      >
                        {active && <Check className="h-3 w-3" />}
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground/40">
                El comprador elige entre los perfumes con stock de estas categorias.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5">
              <span className="text-xs text-muted-foreground/70">Activo en la tienda</span>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} className="data-[state=checked]:bg-emerald-500" />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-500 text-white">
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Panel de perfumes del combo */}
      <Dialog open={!!poolCombo} onOpenChange={(open) => { if (!open) setPoolCombo(null) }}>
        <DialogContent className="max-h-[90dvh] overflow-hidden border-border/20 bg-[hsl(235,28%,8%)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Perfumes de {poolCombo?.name}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 text-xs">
            <span className="text-muted-foreground/60">
              {includedCount} disponible{includedCount === 1 ? "" : "s"} en la tienda
            </span>
            <span className="text-muted-foreground/40">Toca un perfume para excluirlo</span>
          </div>

          <div className="-mx-1 max-h-[50dvh] space-y-1.5 overflow-y-auto px-1 py-2">
            {poolLoading ? (
              [1, 2, 3, 4].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.02]" />)
            ) : pool.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground/40">No hay perfumes en estas categorias</p>
                <p className="mt-1 text-xs text-muted-foreground/30">Agrega categorias al combo o carga perfumes en ellas</p>
              </div>
            ) : (
              pool.map((p) => {
                const isExcluded = excluded.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleExcluded(p.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all",
                      !p.has_stock
                        ? "border-white/[0.03] bg-white/[0.01] opacity-50"
                        : isExcluded
                          ? "border-white/[0.04] bg-white/[0.01] opacity-60"
                          : "border-violet-500/20 bg-violet-500/[0.04]"
                    )}
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.03]">
                        <ImageIcon className="h-4 w-4 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground/50">
                        {p.brand ? `${p.brand} - ` : ""}{p.category_name || "Sin categoria"}
                      </p>
                    </div>
                    {!p.has_stock ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1 text-[10px] text-muted-foreground/50">
                        <PackageX className="h-3 w-3" /> Sin stock
                      </span>
                    ) : isExcluded ? (
                      <span className="shrink-0 rounded-md bg-white/[0.04] px-2 py-1 text-[10px] text-muted-foreground/50">
                        Excluido
                      </span>
                    ) : (
                      <span className="flex shrink-0 items-center gap-1 rounded-md bg-violet-500/10 px-2 py-1 text-[10px] text-violet-300">
                        <Check className="h-3 w-3" /> Incluido
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>

          <DialogFooter className="gap-2 border-t border-white/[0.05] pt-3 sm:gap-0">
            <Button variant="ghost" onClick={() => setPoolCombo(null)} className="text-muted-foreground">Cancelar</Button>
            <Button onClick={savePool} disabled={poolSaving} className="bg-violet-600 hover:bg-violet-500 text-white">
              {poolSaving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="border-border/20 bg-[hsl(235,28%,8%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar combo</AlertDialogTitle>
            <AlertDialogDescription>
              El combo deja de estar disponible en la tienda. Los perfumes no se tocan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/20 bg-transparent text-muted-foreground">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-500">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
