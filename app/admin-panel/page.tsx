"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutGrid, Package, Percent } from "lucide-react"
import { useRouter } from "next/navigation"
import { CategoriesTab } from "./categories-tab"
import { ProductsTab } from "./products-tab"
import { DiscountsTab } from "./discounts-tab"
// import { Ticket } from "lucide-react"
// import { RaffleTab } from "./raffle-tab"

export default function AdminDashboard() {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [view, setView] = useState<"dashboard" /* | "raffle" */>("dashboard")

  async function logout() {
    setLoggingOut(true)
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin-login")
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel de Administracion</h1>
          <p className="text-sm text-muted-foreground">Mistic Essence</p>
        </div>
        <div className="flex items-center gap-2">
          {/* <Button
            variant={view === "raffle" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("raffle")}
          >
            <Ticket className="mr-2 h-4 w-4" />
            Rifa
          </Button> */}
          <Button variant="outline" size="sm" onClick={logout} disabled={loggingOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
        </div>
      </div>

      {/* {view === "raffle" ? (
        <RaffleTab onBack={() => setView("dashboard")} />
      ) : ( */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="categories" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Categorias</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Productos</span>
            </TabsTrigger>
            <TabsTrigger value="discounts" className="gap-2">
              <Percent className="h-4 w-4" />
              <span className="hidden sm:inline">Descuentos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="discounts">
            <DiscountsTab />
          </TabsContent>
        </Tabs>
      {/* )} */}
    </div>
  )
}
