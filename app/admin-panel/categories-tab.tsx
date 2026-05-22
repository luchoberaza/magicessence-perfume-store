"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, Upload, X, ImageIcon, FolderOpen } from "lucide-react"
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
    setCategories(await res.json())
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
    setUploading(true)
    try {
      const body = { ...form, sort_order: parseInt(form.sort_order) || 0, image_url: editing?.image_url || null, ...(editing ? { id: editing.id } : {}) }
      const method = editing ? "PUT" : "POST"
      const res = await fetch("/api/admin/categories", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error("Error al guardar"); setUploading(false); return }
      const savedCat = await res.json()

      if (imageFile) {
        const fd = new FormData()
        fd.append("file", imageFile)
        fd.append("category_id", String(savedCat.id))
        await fetch("/api/admin/categories/image", { method: "POST", body: fd })
      }

      if (editing?.image_url && !imagePreview && !imageFile) {
        await fetch("/api/admin/categories/image", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category_id: savedCat.id, url: editing.image_url }) })
      }

      toast.success(editing ? "Actualizada" : "Creada")
      setDialogOpen(false)
      fetchCategories()
    } catch { toast.error("Error inesperado") }
    finally { setUploading(false) }
  }

  async function handleDelete() {
    if (!deleteId) return
    const cat = categories.find((c) => c.id === deleteId)
    if (cat?.image_url) {
      await fetch("/api/admin/categories/image", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category_id: deleteId, url: cat.image_url }) }).catch(() => {})
    }
    const res = await fetch("/api/admin/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteId }) })
    if (res.ok) { toast.success("Eliminada"); fetchCategories() }
    setDeleteId(null)
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground/50">{categories.length} categorias</p>
        </div>
        <Button size="sm" onClick={openCreate} className="h-9 gap-1.5 bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20">
          <Plus className="h-3.5 w-3.5" /> Nueva
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-white/[0.02]" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderOpen className="mb-3 h-10 w-10 text-muted-foreground/15" />
          <p className="text-sm text-muted-foreground/40">No hay categorias</p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.02] transition-all hover:border-white/[0.08] hover:bg-white/[0.03]"
            >
              {/* Cover image */}
              <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
                {cat.image_url ? (
                  <img src={cat.image_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/10" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{cat.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground/40">/{cat.slug}</p>
                  </div>
                  <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-muted-foreground/50">
                    #{cat.sort_order}
                  </span>
                </div>
              </div>

              {/* Actions — always visible on mobile, hover on desktop */}
              <div className="absolute right-3 top-3 flex gap-1 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
                <button
                  onClick={() => openEdit(cat)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 active:bg-black/80"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setDeleteId(cat.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-red-600 active:bg-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border/20 bg-[hsl(235,28%,8%)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Editar" : "Nueva"} Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            {/* Image */}
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
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : autoSlug(e.target.value) })} className="h-9 border-border/20 bg-white/[0.03] text-sm" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="h-9 border-border/20 bg-white/[0.03] font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Orden</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="h-9 border-border/20 bg-white/[0.03] text-sm" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSave} disabled={uploading} className="bg-violet-600 hover:bg-violet-500 text-white">
              {uploading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="border-border/20 bg-[hsl(235,28%,8%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar categoria</AlertDialogTitle>
            <AlertDialogDescription>Los productos asociados perderan esta categoria.</AlertDialogDescription>
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
