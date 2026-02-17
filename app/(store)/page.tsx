import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShoppingBag, MessageCircle } from "lucide-react"
import { getFeaturedProducts } from "@/lib/queries"
import { ProductCard } from "@/components/product-card"

export const metadata = {
  title: "Mistic Essence | Perfumes Premium en Salto, Uruguay",
  description: "Descubri fragancias exclusivas en Mistic Essence. Perfumes premium, decants y mas en Salto, Uruguay.",
}

export default async function HomePage() {
  const featured = await getFeaturedProducts(3)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.16] blur-sm"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/40 to-accent/8" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(265_55%_65%/0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-2xl text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/monogram.png"
              alt=""
              aria-hidden="true"
              className="mx-auto mb-6 h-20 w-auto mix-blend-lighten lg:h-28"
            />
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
              Salto, Uruguay
            </p>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-6xl">
              Tu fragancia,{" "}
              <span className="text-primary">tu esencia</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
              Encontra perfumes exclusivos que reflejan tu personalidad.
              Calidad premium, variedad unica y atencion cercana desde Salto para todo Uruguay.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/categorias">
                  Ver categorias
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/productos">Todos los productos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
              Descubri hoy
            </h2>
            <p className="mt-2 text-muted-foreground">
              Seleccion especial de nuestro catalogo
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/productos">
                Ver todo el catalogo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* How to buy */}
      <section className="border-t border-border/30 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground lg:text-3xl">
            Como comprar
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Elegi",
                desc: "Explora nuestro catalogo y encontra la fragancia que va con vos.",
                icon: ShoppingBag,
              },
              {
                step: "02",
                title: "Agrega al carrito",
                desc: "Selecciona la variante que prefieras y sumala al carrito.",
                icon: ArrowRight,
              },
              {
                step: "03",
                title: "Confirma por WhatsApp",
                desc: "Envia tu pedido directo a nuestro WhatsApp y coordinamos la entrega.",
                icon: MessageCircle,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group flex flex-col items-center rounded-2xl p-6 text-center glass glass-hover"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="mb-1 text-xs font-medium uppercase tracking-widest text-primary">
                  Paso {item.step}
                </span>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
