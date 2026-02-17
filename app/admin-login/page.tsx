"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl glass p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Mistic Essence</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user" className="text-foreground">Usuario</Label>
            <Input
              id="user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-secondary/50"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass" className="text-foreground">Contrasena</Label>
            <Input
              id="pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary/50"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  )
}
