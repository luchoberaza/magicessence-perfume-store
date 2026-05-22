"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Percent, Tag, Clock, Hash } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface DiscountCode {
  id: number
  code: string
  type: "percent" | "fixed"
  value: number
  active: boolean
  expires_at: string | null
  uses_count: number
}

export function DiscountsTab() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DiscountCode | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({
    code: "", type: "percent" as "percent" | "fixed", value: "", active: true, expires_at: "",
  })

  async function fetchDiscounts() {
    setLoading(true)
    const res = await fetch("/api/admin/discounts")
    setDiscounts(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchDiscounts() }, [])

  function openCreate() {
    setEditing(null)
    setForm({ code: "", type: "percent", value: "", active: true, expires_at: "" })
    setDialogOpen(true)
  }

  function openEdit(d: DiscountCode) {
    setEditing(d)
    setForm({
      code: d.code, type: d.type, value: String(d.value), active: d.active,
      expires_at: d.expires_at ? d.expires_at.slice(0, 16) : "",
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    const body = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: parseInt(form.value) || 0,
      active: form.active,
      expires_at: form.expires_at || null,
      ...(editing ? { id: editing.id } : {}),
    }
    const method = editing ? "PUT" : "POST"
    const res = await fetch("/api/admin/discounts", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) { toast.success(editing ? "Descuento actualizado" : "Descuento creado"); setDialogOpen(false); fetchDiscounts() }
    else toast.error("Error al guardar")
  }

  async function handleDelete() {
    if (!deleteId) return
    const res = await fetch("/api/admin/discounts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteId }) })
    if (res.ok) { toast.success("Descuento eliminado"); fetchDiscounts() }
    setDeleteId(null)
  }

  function isExpired(d: DiscountCode) {
    if (!d.expires_at) return false
    return new Date(d.expires_at) < new Date()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Codigos de descuento</h2>
          <p className="text-xs text-muted-foreground">{discounts.length} codigos configurados</p>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo</span>
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-secondary/30" />
          ))}
        </div>
      ) : discounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 py-16">
          <Tag className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No hay codigos de descuento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {discounts.map((d) => {
            const expired = isExpired(d)
            return (
              <div
                key={d.id}
                className={cn(
                  "group overflow-hidden rounded-2xl border transition-all",
                  d.active && !expired
                    ? "border-border/30 bg-background/40 hover:border-border/50"
                    : "border-border/20 bg-background/20 opacity-60"
                )}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Icon */}
                  <div className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                    d.type === "percent" ? "bg-primary/10" : "bg-emerald-500/10"
                  )}>
                    {d.type === "percent" ? (
                      <Percent className="h-5 w-5 text-primary" />
                    ) : (
                      <Tag className="h-5 w-5 text-emerald-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-base font-bold tracking-wider text-foreground">{d.code}</p>
                      {d.active && !expired ? (
                        <Badge className="border-0 bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0">
                          Activo
                        </Badge>
                      ) : expired ? (
                        <Badge className="border-0 bg-amber-400/10 text-amber-400 text-[10px] px-1.5 py-0">
                          Expirado
                        </Badge>
                      ) : (
                        <Badge className="border-0 bg-muted text-muted-foreground text-[10px] px-1.5 py-0">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {d.type === "percent" ? `${d.value}% off` : `$${d.value} UYU`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {d.uses_count} {d.uses_count === 1 ? "uso" : "usos"}
                      </span>
                      {d.expires_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(d.expires_at).toLocaleDateString("es-UY")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(d)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(d.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border/40 bg-background sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Editar" : "Nuevo"} Descuento</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Codigo</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="border-border/40 bg-secondary/30 font-mono text-lg font-bold tracking-wider uppercase focus-visible:ring-primary/30"
                placeholder="BIENVENIDO10"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "percent" | "fixed" })}>
                  <SelectTrigger className="border-border/40 bg-secondary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed">Monto fijo (UYU)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Valor ({form.type === "percent" ? "%" : "UYU"})
                </Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="border-border/40 bg-secondary/30 focus-visible:ring-primary/30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Expiracion (opcional)</Label>
              <Input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="border-border/40 bg-secondary/30 focus-visible:ring-primary/30"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/30 bg-secondary/10 p-3">
              <Label htmlFor="d-active" className="text-sm text-foreground">Activo</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} id="d-active" className="data-[state=checked]:bg-emerald-500" />
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

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="border-border/40 bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar descuento</AlertDialogTitle>
            <AlertDialogDescription>Esta accion no se puede deshacer.</AlertDialogDescription>
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
