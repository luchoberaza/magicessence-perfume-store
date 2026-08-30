"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { CartDrawer } from "./cart-drawer"
import { ShinyText } from "./effects"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/categorias", label: "Categorias" },
  { href: "/productos", label: "Productos" },
  { href: "/combos", label: "Combos", isNew: true },
  // { href: "/rifa", label: "Rifa" },
  { href: "/contacto", label: "Contacto" },
]

export function StoreHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const { itemCount } = useCart()
  const pathname = usePathname()

  // El header arranca transparente sobre el hero y se opaca al bajar.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const highlighted = hovered ?? NAV_LINKS.find((link) => isActive(link.href))?.href ?? null

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-border/40 bg-background/70 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3 text-foreground"
            aria-label="Mistic Essence - Inicio"
          >
            <span className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-primary/25 blur-md opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <Image
                src="/logo-me.png"
                alt=""
                width={40}
                height={40}
                priority
                className="relative h-10 w-10 rounded-full ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-105"
              />
            </span>
            <span className="flex flex-col leading-none">
              <ShinyText className="text-[15px] font-semibold uppercase tracking-[0.18em]">
                Mistic
              </ShinyText>
              <span className="mt-0.5 text-[15px] font-semibold uppercase tracking-[0.28em] text-primary">
                Essence
              </span>
            </span>
          </Link>

          {/* Nav desktop: la pastilla se desliza al item apuntado */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Navegacion principal"
            onMouseLeave={() => setHovered(null)}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHovered(link.href)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
                  isActive(link.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {highlighted === link.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full border border-primary/25 bg-primary/10"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {link.label}
                  {link.isNew && (
                    <span className="rounded-full bg-primary/20 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-primary">
                      Nuevo
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
              aria-label={`Carrito, ${itemCount} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </motion.span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground md:hidden"
              aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Nav movil */}
        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.nav
              key="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.25, 0.4, 0.25, 1] }}
              className="overflow-hidden border-t border-border/30 bg-background/80 backdrop-blur-xl md:hidden"
              aria-label="Navegacion movil"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      isActive(link.href)
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    {link.label}
                    {link.isNew && (
                      <span className="rounded-full bg-primary/20 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-primary">
                        Nuevo
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  )
}
