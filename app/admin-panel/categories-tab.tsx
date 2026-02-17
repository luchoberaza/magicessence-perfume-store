"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, Upload, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"

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

  useEffect(() => {
    fetchCategories()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm({ name: "", slug: "", sort_order: "0" })
    setImagePreview(null)
    setImageFile(null)
    setDialogOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({
      name: cat.name,
      slug: cat.slug,
      sort_order: String(cat.sort_order),
    })
    setImagePreview(cat.image_url)
    setImageFile(null)
    setDialogOpen(true)
  }

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imagenes")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar 5 MB")
      return
    }
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
      // 1. Save or update the category first
      const body = {
        ...form,
        sort_order: parseInt(form.sort_order) || 0,
        image_url: editing?.image_url || null,
        ...(editing ? { id: editing.id } : {}),
      }
      const method = editing ? "PUT" : "POST"
      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        toast.error("Error al guardar la categoria")
        setUploading(false)
        return
      }

      const savedCat = await res.json()

      // 2. If there's a new image file, upload it
      if (imageFile) {
        const fd = new FormData()
        fd.append("file", imageFile)
        fd.append("category_id", String(savedCat.id))
        const uploadRes = await fetch("/api/admin/categories/image", {
          method: "POST",
          body: fd,
        })
        if (!uploadRes.ok) {
          toast.error("Categoria guardada pero fallo la imagen")
        }
      }

      // 3. If the image was removed (editing had image, but preview is null and no new file)
      if (editing?.image_url && !imagePreview && !imageFile) {
        await fetch("/api/admin/categories/image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category_id: savedCat.id,
            url: editing.image_url,
          }),
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
    // If category has an image, delete it from blob
    if (cat?.image_url) {
      await fetch("/api/admin/categories/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: deleteId, url: cat.image_url }),
      }).catch(() => {})
    }
    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    })
    if (res.ok) {
      toast.success("Categoria eliminada")
      fetchCategories()
    }
    setDeleteId(null)
  }

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Categorias</h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-secondary/50"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl glass py-12 text-center">
          <p className="text-muted-foreground">No hay categorias</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/60">
                    <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /{cat.slug} - orden: {cat.sort_order}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(cat)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(cat.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-background sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editing ? "Editar" : "Nueva"} Categoria
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image upload zone */}
            <div className="space-y-2">
              <Label className="text-foreground">Foto de categoria</Label>
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="aspect-video w-full rounded-xl object-cover"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="absolute right-2 top-2 h-8 w-8 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Quitar imagen</span>
                  </Button>
                </div>
              ) : (
                <div
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors ${
                    dragging
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/40"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      fileInputRef.current?.click()
                  }}
                >
                  <Upload className="h-6 w-6 text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">
                    Arrastra una imagen o{" "}
                    <span className="font-medium text-primary">
                      hace click
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    JPG, PNG o WebP. Max 5 MB.
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: editing ? form.slug : autoSlug(e.target.value),
                  })
                }}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Orden</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm({ ...form, sort_order: e.target.value })
                }
                className="bg-secondary/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={uploading}>
              {uploading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Eliminar categoria
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Los productos asociados perderan
              la categoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
