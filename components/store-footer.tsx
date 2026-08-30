import Link from "next/link"
import Image from "next/image"
import { Instagram, MessageCircle, MapPin } from "lucide-react"

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/categorias", label: "Categorias" },
  { href: "/productos", label: "Productos" },
  { href: "/combos", label: "Combos" },
  // { href: "/rifa", label: "Rifa" },
  { href: "/contacto", label: "Contacto" },
]

export function StoreFooter() {
  return (
    <footer className="relative border-t border-border/30 bg-card/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:text-left">
          {/* Marca */}
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
            <Image
              src="/logo-mistic.png"
              alt="Mistic Essence"
              width={64}
              height={64}
              className="h-16 w-16 rounded-full ring-1 ring-white/10"
            />
            <div>
              <p className="text-base font-semibold uppercase tracking-[0.18em] text-foreground">
                Mistic <span className="text-primary">Essence</span>
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Despertá tu esencia
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Salto, Uruguay
              </p>
            </div>
          </div>

          {/* Navegacion */}
          <nav
            className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
            aria-label="Footer"
          >
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Contacto */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/mistic.essence"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Mistic Essence"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/59898158434"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp de Mistic Essence"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-border/30 pt-6 text-center text-xs text-muted-foreground">
          Mistic Essence - Salto, Uruguay
        </div>
      </div>
    </footer>
  )
}
