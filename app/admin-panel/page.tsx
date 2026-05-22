"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutGrid, Package, Percent, Moon, Sparkles, TrendingUp, ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import { CategoriesTab } from "./categories-tab"
import { ProductsTab } from "./products-tab"
import { DiscountsTab } from "./discounts-tab"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "products", label: "Productos", icon: Package },
  { id: "categories", label: "Categorias", icon: LayoutGrid },
  { id: "discounts", label: "Descuentos", icon: Percent },
] as const

type TabId = (typeof navItems)[number]["id"]

export default function AdminDashboard() {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>("products")
  const [stats, setStats] = useState({ products: 0, categories: 0, discounts: 0 })

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/discounts").then((r) => r.json()),
    ]).then(([p, c, d]) => {
      setStats({ products: p?.length ?? 0, categories: c?.length ?? 0, discounts: d?.length ?? 0 })
    }).catch(() => {})
  }, [])

  async function logout() {
    setLoggingOut(true)
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin-login")
  }

  return (
    <div className="min-h-screen">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[40%] left-[20%] h-[600px] w-[600px] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute -bottom-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-accent/[0.04] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Mistic Essence</h1>
              <p className="text-xs text-muted-foreground">Panel de administracion</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            disabled={loggingOut}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesion</span>
          </Button>
        </header>

        {/* Stats cards */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            { label: "Productos", value: stats.products, icon: ShoppingBag, color: "text-primary" },
            { label: "Categorias", value: stats.categories, icon: LayoutGrid, color: "text-emerald-400" },
            { label: "Descuentos", value: stats.discounts, icon: TrendingUp, color: "text-amber-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-border/60 hover:bg-card/70"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/[0.02] opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <stat.icon className={cn("mb-2 h-5 w-5", stat.color)} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <nav className="mb-6 flex gap-1 rounded-2xl border border-border/40 bg-card/30 p-1.5 backdrop-blur-sm">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                activeTab === item.id
                  ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="rounded-2xl border border-border/40 bg-card/30 p-5 backdrop-blur-sm sm:p-6">
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "categories" && <CategoriesTab />}
          {activeTab === "discounts" && <DiscountsTab />}
        </main>
      </div>
    </div>
  )
}
