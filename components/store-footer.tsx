import Link from "next/link"

export function StoreFooter() {
  return (
    <footer className="border-t border-border/30 bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <p className="text-lg font-semibold tracking-tight text-foreground">
              Mistic <span className="text-primary">Essence</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Fragancias premium en Salto, Uruguay
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground" aria-label="Footer">
            <Link href="/" className="transition-colors hover:text-foreground">
              Inicio
            </Link>
            <Link href="/categorias" className="transition-colors hover:text-foreground">
              Categorias
            </Link>
            <Link href="/productos" className="transition-colors hover:text-foreground">
              Productos
            </Link>
            <Link href="/rifa" className="transition-colors hover:text-foreground">
              Rifa
            </Link>
            <Link href="/contacto" className="transition-colors hover:text-foreground">
              Contacto
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-border/30 pt-6 text-center text-xs text-muted-foreground">
          Mistic Essence - Salto, Uruguay
        </div>
      </div>
    </footer>
  )
}
