"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, Percent, Tag, Clock, Hash, Zap, Copy } from "lucide-react"
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
    setForm({ code: d.code, type: d.type, value: String(d.value), active: d.active, expires_at: d.expires_at ? d.expires_at.slice(0, 16) : "" })
    setDialogOpen(true)
  }

  async function handleSave() {
    const body = {
      code: form.code.toUpperCase(), type: form.type, value: parseInt(form.value) || 0,
      active: form.active, expires_at: form.expires_at || null, ...(editing ? { id: editing.id } : {}),
    }
    const method = editing ? "PUT" : "POST"
    const res = await fetch("/api/admin/discounts", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) { toast.success(editing ? "Actualizado" : "Creado"); setDialogOpen(false); fetchDiscounts() }
    else toast.error("Error al guardar")
  }

  async function handleDelete() {
    if (!deleteId) return
    const res = await fetch("/api/admin/discounts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteId }) })
    if (res.ok) { toast.success("Eliminado"); fetchDiscounts() }
    setDeleteId(null)
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    toast.success("Codigo copiado")
  }

  function isExpired(d: DiscountCode) {
    if (!d.expires_at) return false
    return new Date(d.expires_at) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground/50">{discounts.length} codigos</p>
        <Button size="sm" onClick={openCreate} className="h-9 gap-1.5 bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20">
          <Plus className="h-3.5 w-3.5" /> Nuevo
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/[0.02]" />)}
        </div>
      ) : discounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Zap className="mb-3 h-10 w-10 text-muted-foreground/15" />
          <p className="text-sm text-muted-foreground/40">No hay codigos de descuento</p>
          <p className="mt-1 text-xs text-muted-foreground/25">Crea uno para ofrecer descuentos a tus clientes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {discounts.map((d) => {
            const expired = isExpired(d)
            const isActive = d.active && !expired

            return (
              <div
                key={d.id}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all lg:gap-4 lg:px-5 lg:py-4",
                  isActive
                    ? "border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08]"
                    : "border-white/[0.02] bg-white/[0.01] opacity-50"
                )}
              >
                {/* Type indicator */}
                <div className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  d.type === "percent" ? "bg-violet-500/10 ring-1 ring-violet-500/20" : "bg-emerald-500/10 ring-1 ring-emerald-500/20"
                )}>
                  {d.type === "percent" ? (
                    <span className="text-base font-bold text-violet-400">{d.value}%</span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400">${d.value}</span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyCode(d.code)}
                      className="group/code flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1 font-mono text-sm font-bold tracking-widest text-foreground transition-colors hover:bg-white/[0.08]"
                    >
                      {d.code}
                      <Copy className="h-3 w-3 text-muted-foreground/30 group-hover/code:text-muted-foreground" />
                    </button>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Activo
                      </span>
                    )}
                    {expired && (
                      <span className="text-[10px] font-medium text-amber-400">Expirado</span>
                    )}
                    {!d.active && !expired && (
                      <span className="text-[10px] font-medium text-muted-foreground/40">Pausado</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground/40">
                    <span className="flex items-center gap-1">
                      <Hash className="h-2.5 w-2.5" />
                      {d.uses_count} {d.uses_count === 1 ? "uso" : "usos"}
                    </span>
                    {d.expires_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(d.expires_at).toLocaleDateString("es-UY", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions — always visible on mobile */}
                <div className="flex gap-1 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
                  <button onClick={() => openEdit(d)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/40 transition-colors hover:bg-white/[0.06] hover:text-foreground active:bg-white/[0.06]">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(d.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-400 active:bg-red-500/10 active:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border/20 bg-[hsl(235,28%,8%)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Editar" : "Nuevo"} Descuento</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Codigo</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="BIENVENIDO10"
                className="h-10 border-border/20 bg-white/[0.03] font-mono text-lg font-bold tracking-[0.2em] uppercase"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "percent" | "fixed" })}>
                  <SelectTrigger className="h-9 border-border/20 bg-white/[0.03]"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-border/20 bg-[hsl(235,28%,10%)]">
                    <SelectItem value="percent">Porcentaje %</SelectItem>
                    <SelectItem value="fixed">Fijo UYU</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Valor</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="h-9 border-border/20 bg-white/[0.03] text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Expira</Label>
              <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="h-9 border-border/20 bg-white/[0.03] text-sm" />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3 ring-1 ring-white/[0.06]">
              <span className="text-sm text-foreground">Activo</span>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} className="data-[state=checked]:bg-emerald-500" />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-500 text-white">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="border-border/20 bg-[hsl(235,28%,8%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar descuento</AlertDialogTitle>
            <AlertDialogDescription>Esta accion no se puede deshacer.</AlertDialogDescription>
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
