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
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Codigos de descuento</h2>
        <Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nuevo</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-secondary/50" />)}</div>
      ) : discounts.length === 0 ? (
        <div className="rounded-2xl glass py-12 text-center"><p className="text-muted-foreground">No hay codigos de descuento</p></div>
      ) : (
        <div className="space-y-2">
          {discounts.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-medium text-foreground">{d.code}</p>
                    <Badge variant={d.active ? "default" : "outline"} className={d.active ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground"}>
                      {d.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {d.type === "percent" ? `${d.value}%` : `$${d.value} UYU`} - Usado {d.uses_count} {d.uses_count === 1 ? "vez" : "veces"}
                    {d.expires_at && ` - Expira: ${new Date(d.expires_at).toLocaleDateString("es-UY")}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(d.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-background">
          <DialogHeader><DialogTitle className="text-foreground">{editing ? "Editar" : "Nuevo"} Descuento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Codigo</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="bg-secondary/50 font-mono" placeholder="Ej: BIENVENIDO10" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "percent" | "fixed" })}>
                  <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed">Monto fijo (UYU)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Valor ({form.type === "percent" ? "%" : "UYU"})</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="bg-secondary/50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Expiracion (opcional)</Label>
              <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="bg-secondary/50" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} id="d-active" />
              <Label htmlFor="d-active" className="text-foreground">Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar descuento</AlertDialogTitle>
            <AlertDialogDescription>Esta accion no se puede deshacer.</AlertDialogDescription>
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
