"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<"user" | "pass" | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const router = useRouter()

  useEffect(() => {
    function handleMouse(e: MouseEvent) {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height
      setTilt({ x: y * -8, y: x * 8 })
    }
    function handleLeave() { setTilt({ x: 0, y: 0 }) }
    const card = cardRef.current
    card?.addEventListener("mousemove", handleMouse)
    card?.addEventListener("mouseleave", handleLeave)
    return () => { card?.removeEventListener("mousemove", handleMouse); card?.removeEventListener("mouseleave", handleLeave) }
  }, [])

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
      if (res.ok) { router.push("/admin-panel"); router.refresh() }
      else setError("Credenciales incorrectas")
    } catch { setError("Error de conexion") }
    finally { setLoading(false) }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#050510] px-4">
      {/* ── Animated aurora background ── */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(120,60,255,0.15), transparent)" }} />
        <div className="aurora-1 absolute -top-[40%] left-[10%] h-[800px] w-[600px] rounded-full opacity-30 blur-[100px]" />
        <div className="aurora-2 absolute -top-[30%] right-[5%] h-[700px] w-[500px] rounded-full opacity-25 blur-[120px]" />
        <div className="aurora-3 absolute top-[10%] left-[30%] h-[500px] w-[800px] rounded-full opacity-20 blur-[130px]" />
      </div>

      {/* ── Floating particles ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="particle absolute h-[2px] w-[2px] rounded-full bg-white/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      {/* ── Grid perspective floor ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-[0.04]">
        <div className="absolute inset-x-0 bottom-0 h-[60vh]" style={{ perspective: "500px" }}>
          <div
            className="h-full w-full border-t border-white/20"
            style={{
              transform: "rotateX(60deg)",
              backgroundImage: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.05) 100%), repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 80px), repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 80px)",
              transformOrigin: "bottom",
            }}
          />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="relative w-full max-w-[380px]">
        {/* Logo with orbiting rings */}
        <div className="mb-10 flex flex-col items-center">
          <div className="logo-container relative mb-5 flex h-20 w-20 items-center justify-center">
            {/* Orbiting rings */}
            <div className="orbit-ring absolute inset-0 rounded-full border border-violet-500/20" style={{ animation: "orbit 8s linear infinite" }} />
            <div className="orbit-ring absolute inset-[-8px] rounded-full border border-fuchsia-500/10" style={{ animation: "orbit 12s linear infinite reverse" }} />
            <div className="orbit-ring absolute inset-[-16px] rounded-full border border-violet-400/5" style={{ animation: "orbit 16s linear infinite" }} />
            {/* Orbiting dots */}
            <div className="absolute inset-0" style={{ animation: "orbit 8s linear infinite" }}>
              <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            </div>
            <div className="absolute inset-[-8px]" style={{ animation: "orbit 12s linear infinite reverse" }}>
              <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-fuchsia-400 shadow-[0_0_6px_rgba(232,121,249,0.8)]" />
            </div>
            {/* Core logo */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-violet-600 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z" />
                <path d="M5 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
                <path d="M18 14l.7 1.5 1.3.5-1.3.5-.7 1.5-.7-1.5L16 16l1.3-.5.7-1.5z" />
              </svg>
            </div>
          </div>
          <h1 className="bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Mistic Essence
          </h1>
          <p className="mt-2 text-xs tracking-[0.3em] uppercase text-muted-foreground/40">Administracion</p>
        </div>

        {/* Card with 3D tilt */}
        <div
          ref={cardRef}
          className="group relative"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.15s ease-out",
          }}
        >
          {/* Animated gradient border */}
          <div className="absolute -inset-[1px] rounded-3xl opacity-60 blur-[1px] gradient-border" />

          {/* Card body */}
          <div className="relative overflow-hidden rounded-3xl bg-[hsl(240,20%,6%)]/90 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
            {/* Inner glow top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
            {/* Noise texture */}
            <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

            <form onSubmit={handleSubmit} className="relative space-y-6 p-8">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                  Usuario
                </label>
                <div className={`input-wrapper relative rounded-xl transition-all duration-300 ${focused === "user" ? "input-focused" : ""}`}>
                  <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-violet-500/50 via-fuchsia-500/50 to-violet-500/50 opacity-0 transition-opacity duration-300" style={{ opacity: focused === "user" ? 0.6 : 0 }} />
                  <div className="relative flex items-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06]">
                    <User className="ml-4 h-4 w-4 shrink-0 text-white/20" />
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setFocused("user")}
                      onBlur={() => setFocused(null)}
                      className="h-12 w-full bg-transparent px-3 text-sm text-white placeholder:text-white/20 focus:outline-none"
                      placeholder="admin"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                  Contrasena
                </label>
                <div className={`input-wrapper relative rounded-xl transition-all duration-300 ${focused === "pass" ? "input-focused" : ""}`}>
                  <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-violet-500/50 via-fuchsia-500/50 to-violet-500/50 opacity-0 transition-opacity duration-300" style={{ opacity: focused === "pass" ? 0.6 : 0 }} />
                  <div className="relative flex items-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06]">
                    <Lock className="ml-4 h-4 w-4 shrink-0 text-white/20" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused("pass")}
                      onBlur={() => setFocused(null)}
                      className="h-12 w-full bg-transparent px-3 text-sm text-white placeholder:text-white/20 focus:outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="mr-4 shrink-0 text-white/20 transition-colors hover:text-white/50"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 ring-1 ring-red-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                  <p className="text-xs font-medium text-red-400">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="submit-btn group relative h-12 w-full overflow-hidden rounded-xl font-medium text-white transition-all disabled:opacity-60"
              >
                {/* Button gradient bg */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_100%] transition-all group-hover:bg-[position:100%_0]" style={{ animation: "shimmer 3s linear infinite" }} />
                {/* Button glow */}
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)" }} />
                {/* Button content */}
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verificando...
                    </>
                  ) : (
                    <>
                      Acceder
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Bottom glow */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
          </div>
        </div>

        {/* Decorative text */}
        <p className="mt-10 text-center text-[9px] tracking-[0.4em] uppercase text-white/10">
          Portal de acceso restringido
        </p>
      </div>

      {/* ── Inline styles for animations ── */}
      <style jsx>{`
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          50% { transform: translateY(-100vh) scale(0.5); opacity: 0.3; }
        }
        @keyframes aurora-move-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(100px, 50px) rotate(10deg) scale(1.1); }
          66% { transform: translate(-50px, 30px) rotate(-5deg) scale(0.9); }
        }
        @keyframes aurora-move-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-120px, 40px) rotate(-15deg) scale(1.2); }
        }
        @keyframes aurora-move-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(80px, -30px) scale(1.3); }
          80% { transform: translate(-60px, 20px) scale(0.8); }
        }
        .aurora-1 {
          background: radial-gradient(ellipse, rgba(139,92,246,0.4), rgba(139,92,246,0) 70%);
          animation: aurora-move-1 15s ease-in-out infinite;
        }
        .aurora-2 {
          background: radial-gradient(ellipse, rgba(232,121,249,0.3), rgba(232,121,249,0) 70%);
          animation: aurora-move-2 18s ease-in-out infinite;
        }
        .aurora-3 {
          background: radial-gradient(ellipse, rgba(99,102,241,0.25), rgba(99,102,241,0) 70%);
          animation: aurora-move-3 20s ease-in-out infinite;
        }
        .particle {
          animation: float 8s ease-in-out infinite;
        }
        .gradient-border {
          background: conic-gradient(from 0deg, rgba(139,92,246,0.3), rgba(232,121,249,0.3), rgba(99,102,241,0.3), rgba(139,92,246,0.3));
          animation: orbit 6s linear infinite;
        }
      `}</style>
    </div>
  )
}
