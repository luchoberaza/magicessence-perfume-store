"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, Upload, X, ImageIcon, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Category {
  id: number
  name: string
  slug: string
  image_url: string | null
  sort_order: number
}

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: "", slug: "", sort_order: "0" })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchCategories() {
    setLoading(true)
    const res = await fetch("/api/admin/categories")
    const data = await res.json()
    setCategories(data)
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  function openCreate() {
    setEditing(null)
    setForm({ name: "", slug: "", sort_order: "0" })
    setImagePreview(null)
    setImageFile(null)
    setDialogOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, sort_order: String(cat.sort_order) })
    setImagePreview(cat.image_url)
    setImageFile(null)
    setDialogOpen(true)
  }

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Solo se permiten imagenes"); return }
    if (file.size > 5 * 1024 * 1024) { toast.error("La imagen no puede superar 5 MB"); return }
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
    setUploading(true)
    try {
      const body = {
        ...form,
        sort_order: parseInt(form.sort_order) || 0,
        image_url: editing?.image_url || null,
        ...(editing ? { id: editing.id } : {}),
      }
      const method = editing ? "PUT" : "POST"
      const res = await fetch("/api/admin/categories", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error("Error al guardar la categoria"); setUploading(false); return }
      const savedCat = await res.json()

      if (imageFile) {
        const fd = new FormData()
        fd.append("file", imageFile)
        fd.append("category_id", String(savedCat.id))
        const uploadRes = await fetch("/api/admin/categories/image", { method: "POST", body: fd })
        if (!uploadRes.ok) toast.error("Categoria guardada pero fallo la imagen")
      }

      if (editing?.image_url && !imagePreview && !imageFile) {
        await fetch("/api/admin/categories/image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category_id: savedCat.id, url: editing.image_url }),
        })
      }

      toast.success(editing ? "Categoria actualizada" : "Categoria creada")
      setDialogOpen(false)
      fetchCategories()
    } catch {
      toast.error("Error inesperado")
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    const cat = categories.find((c) => c.id === deleteId)
    if (cat?.image_url) {
      await fetch("/api/admin/categories/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: deleteId, url: cat.image_url }),
      }).catch(() => {})
    }
    const res = await fetch("/api/admin/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteId }) })
    if (res.ok) { toast.success("Categoria eliminada"); fetchCategories() }
    setDeleteId(null)
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Categorias</h2>
          <p className="text-xs text-muted-foreground">{categories.length} categorias</p>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva</span>
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-secondary/30" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 py-16">
          <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No hay categorias creadas</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group relative overflow-hidden rounded-2xl border border-border/30 bg-background/40 transition-all hover:border-border/50"
            >
              <div className="flex items-center gap-3 p-3">
                {/* Image */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{cat.name}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">/{cat.slug}</span>
                    <span className="text-border">|</span>
                    <span>Orden: {cat.sort_order}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => openEdit(cat)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(cat.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border/40 bg-background sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Editar" : "Nueva"} Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Image upload */}
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Foto</Label>
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-xl border border-border/30">
                  <img src={imagePreview} alt="Preview" className="aspect-video w-full rounded-xl object-cover" />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="absolute right-2 top-2 h-8 w-8 rounded-full p-0 bg-black/50 hover:bg-black/70 text-white"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-all",
                    dragging
                      ? "border-primary bg-primary/5"
                      : "border-border/30 hover:border-primary/40 hover:bg-primary/[0.02]"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click() }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/40">
                    <Upload className="h-5 w-5 text-muted-foreground/60" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Arrastra o <span className="font-medium text-primary">hace click</span>
                    </p>
                    <p className="text-xs text-muted-foreground/50">JPG, PNG o WebP. Max 5 MB.</p>
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect(file) }} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : autoSlug(e.target.value) })}
                className="border-border/40 bg-secondary/30 focus-visible:ring-primary/30"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="border-border/40 bg-secondary/30 font-mono text-xs focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Orden</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="border-border/40 bg-secondary/30 focus-visible:ring-primary/30"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border/40">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={uploading} className="bg-primary hover:bg-primary/90">
              {uploading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="border-border/40 bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Los productos asociados perderan la categoria.
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
