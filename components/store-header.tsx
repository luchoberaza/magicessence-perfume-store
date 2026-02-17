"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { CartDrawer } from "./cart-drawer"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/categorias", label: "Categorias" },
  { href: "/productos", label: "Productos" },
  { href: "/contacto", label: "Contacto" },
]

export function StoreHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { itemCount } = useCart()

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 text-foreground transition-opacity hover:opacity-80"
            aria-label="Mistic Essence - Inicio"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="text-lg font-bold">M</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Mistic <span className="text-primary">Essence</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegacion principal">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={`Carrito, ${itemCount} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
              aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav
          className={cn(
            "overflow-hidden border-t border-border/30 transition-all duration-300 md:hidden",
            mobileOpen ? "max-h-64 pb-4" : "max-h-0"
          )}
          aria-label="Navegacion movil"
        >
          <div className="flex flex-col gap-1 px-4 pt-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  )
}
