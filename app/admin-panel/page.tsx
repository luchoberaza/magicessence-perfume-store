"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  LogOut, Package, LayoutGrid, Percent, Sparkles,
  ChevronRight, TrendingUp, Box, Layers, Activity
} from "lucide-react"
import { CategoriesTab } from "./categories-tab"
import { ProductsTab } from "./products-tab"
import { DiscountsTab } from "./discounts-tab"
import { cn } from "@/lib/utils"

type View = "products" | "categories" | "discounts"

const navigation = [
  { id: "products" as View, label: "Productos", icon: Package, shortcut: "1" },
  { id: "categories" as View, label: "Categorias", icon: Layers, shortcut: "2" },
  { id: "discounts" as View, label: "Descuentos", icon: Percent, shortcut: "3" },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [view, setView] = useState<View>("products")
  const [loggingOut, setLoggingOut] = useState(false)
  const [stats, setStats] = useState({ products: 0, categories: 0, discounts: 0, inStock: 0 })
  const [time, setTime] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/discounts").then((r) => r.json()),
    ]).then(([p, c, d]) => {
      const inStock = p.reduce((acc: number, prod: any) => {
        return acc + (prod.variants?.filter((v: any) => v.in_stock).length ?? 0)
      }, 0)
      setStats({ products: p?.length ?? 0, categories: c?.length ?? 0, discounts: d?.length ?? 0, inStock })
    }).catch(() => {})
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === "1") setView("products")
      if (e.key === "2") setView("categories")
      if (e.key === "3") setView("discounts")
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  async function logout() {
    setLoggingOut(true)
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin-login")
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          "relative hidden flex-col border-r border-border/20 bg-[hsl(235,28%,7%)] transition-all duration-300 lg:flex",
          sidebarCollapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border/10 px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold text-foreground">Mistic Essence</p>
              <p className="truncate text-[10px] text-muted-foreground">{time}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                view === item.id
                  ? "bg-white/[0.07] text-foreground shadow-[inset_0_0.5px_0_rgba(255,255,255,0.1)]"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", view === item.id ? "text-violet-400" : "text-muted-foreground group-hover:text-foreground")} />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 truncate text-left">{item.label}</span>
                  <kbd className="hidden rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-muted-foreground/60 group-hover:block">{item.shortcut}</kbd>
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-border/10 p-3">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground">
            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", sidebarCollapsed ? "" : "rotate-180")} />
            {!sidebarCollapsed && <span>Colapsar</span>}
          </button>
          <button onClick={logout} disabled={loggingOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-muted-foreground/60 transition-colors hover:text-red-400">
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!sidebarCollapsed && <span>{loggingOut ? "Saliendo..." : "Cerrar sesion"}</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-border/10 bg-[hsl(235,28%,7%)] px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              {navigation.find((n) => n.id === view)?.label}
            </span>
          </div>
          <button onClick={logout} disabled={loggingOut} className="rounded-lg p-2 text-muted-foreground/60 transition-colors active:bg-white/[0.04]">
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Desktop top bar */}
        <div className="sticky top-0 z-10 hidden border-b border-border/10 bg-background/80 backdrop-blur-xl lg:block">
          <div className="flex items-center gap-6 px-8 py-4">
            <h1 className="text-lg font-semibold text-foreground">
              {navigation.find((n) => n.id === view)?.label}
            </h1>
            <div className="ml-auto flex items-center gap-1">
              {[
                { label: "Productos", value: stats.products, icon: Box },
                { label: "En stock", value: stats.inStock, icon: Activity },
                { label: "Categorias", value: stats.categories, icon: Layers },
                { label: "Codigos", value: stats.discounts, icon: TrendingUp },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs">
                  <s.icon className="h-3 w-3 text-muted-foreground/50" />
                  <span className="font-mono font-semibold text-foreground">{s.value}</span>
                  <span className="text-muted-foreground/50">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 pb-20 lg:p-8 lg:pb-8">
          {view === "products" && <ProductsTab />}
          {view === "categories" && <CategoriesTab />}
          {view === "discounts" && <DiscountsTab />}
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/10 bg-[hsl(235,28%,7%)]/95 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-5 py-1.5 transition-all",
                view === item.id ? "text-violet-400" : "text-muted-foreground/50 active:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {view === item.id && (
                <span className="absolute bottom-[max(0.25rem,env(safe-area-inset-bottom))] h-0.5 w-6 rounded-full bg-violet-400" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
