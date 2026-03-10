"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"

interface RaffleEntry {
  number: number
  participant_name: string
}

interface RaffleTabProps {
  onBack: () => void
}

export function RaffleTab({ onBack }: RaffleTabProps) {
  const [entries, setEntries] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [nameInput, setNameInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/raffle")
      if (!res.ok) throw new Error()
      const rows: RaffleEntry[] = await res.json()
      const map = new Map<number, string>()
      for (const r of rows) map.set(r.number, r.participant_name)
      setEntries(map)
    } catch {
      toast.error("Error al cargar la rifa")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  function handleNumberClick(n: number) {
    setSelectedNumber(n)
    setNameInput(entries.get(n) || "")
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!selectedNumber) return
    const trimmed = nameInput.trim()
    if (!trimmed) {
      toast.error("Ingresa un nombre")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/raffle", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: selectedNumber, participant_name: trimmed }),
      })
      if (!res.ok) throw new Error()
      setEntries(prev => {
        const next = new Map(prev)
        next.set(selectedNumber, trimmed)
        return next
      })
      toast.success(`Numero ${selectedNumber} guardado`)
      setDialogOpen(false)
    } catch {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    if (!selectedNumber) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/raffle", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: selectedNumber }),
      })
      if (!res.ok) throw new Error()
      setEntries(prev => {
        const next = new Map(prev)
        next.delete(selectedNumber)
        return next
      })
      toast.success(`Numero ${selectedNumber} reiniciado`)
      setDialogOpen(false)
    } catch {
      toast.error("Error al reiniciar")
    } finally {
      setSaving(false)
    }
  }

  const isOccupied = selectedNumber !== null && entries.has(selectedNumber)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Rifa</h2>
          <p className="text-xs text-muted-foreground">
            {entries.size} de 300 numeros asignados
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15">
          {Array.from({ length: 300 }, (_, i) => i + 1).map(n => {
            const occupied = entries.has(n)
            return (
              <button
                key={n}
                onClick={() => handleNumberClick(n)}
                title={occupied ? entries.get(n) : `Numero ${n}`}
                className={`
                  flex items-center justify-center rounded-md border text-sm font-medium
                  transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background
                  h-10 sm:h-9
                  ${occupied
                    ? "border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "border-border bg-secondary/30 text-foreground hover:bg-secondary/60"
                  }
                `}
              >
                {n}
              </button>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-background sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Numero {selectedNumber}
            </DialogTitle>
            <DialogDescription>
              {isOccupied
                ? `Asignado a: ${entries.get(selectedNumber!)}`
                : "Este numero esta libre. Asigna un nombre."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-foreground">Nombre del participante</Label>
              <Input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Ingresa el nombre"
                className="bg-secondary/50"
                onKeyDown={e => { if (e.key === "Enter") handleSave() }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {isOccupied && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={saving}
                className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Reiniciar
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
