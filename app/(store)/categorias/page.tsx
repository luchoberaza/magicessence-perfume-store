import Link from "next/link"
import { getCategories } from "@/lib/queries"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Categorias",
  description: "Explora nuestras categorias de perfumes y fragancias.",
}

export default async function CategoriasPage() {
  const categories = await getCategories()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
        <p className="mt-2 text-muted-foreground">
          Explora nuestros tipos de fragancias
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl glass py-20 text-center">
          <p className="text-lg font-medium text-foreground">Aun no hay categorias</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pronto vamos a estar sumando nuevas categorias.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorias/${cat.slug}`}
              className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl glass glass-hover p-6"
            >
              {cat.image_url && (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity duration-500 group-hover:opacity-40"
                />
              )}
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-foreground">{cat.name}</h2>
                <span className="mt-1 inline-block text-sm font-medium text-primary">
                  Ver productos
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
