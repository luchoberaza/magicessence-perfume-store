"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Sparkles, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        router.push("/admin-panel")
        router.refresh()
      } else {
        setError("Credenciales incorrectas")
      }
    } catch {
      setError("Error de conexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] translate-y-1/2 rounded-full bg-accent/[0.04] blur-[100px]" />
        <div className="absolute right-0 top-1/2 h-[300px] w-[300px] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/[0.03] blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* Login card */}
      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-primary/20 shadow-lg shadow-primary/5">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mistic Essence</h1>
          <p className="mt-1 text-sm text-muted-foreground">Panel de administracion</p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/50 shadow-2xl shadow-black/20 backdrop-blur-xl">
          {/* Top gradient line */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <form onSubmit={handleSubmit} className="p-6 pt-8">
            <div className="space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="user" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    id="user"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-border/40 bg-secondary/30 pl-10 focus-visible:ring-primary/30"
                    placeholder="admin"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="pass" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Contrasena
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-border/40 bg-secondary/30 pl-10 pr-10 focus-visible:ring-primary/30"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                  <p className="text-sm font-medium text-destructive">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="group w-full bg-primary font-medium hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Ingresando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Ingresar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Bottom gradient line */}
          <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground/40">
          Acceso restringido a administradores
        </p>
      </div>
    </div>
  )
}
