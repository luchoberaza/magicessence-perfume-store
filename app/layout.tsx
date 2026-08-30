import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: {
    default: "Mistic Essence | Perfumes Premium en Salto, Uruguay",
    template: "%s | Mistic Essence",
  },
  description:
    "Descubrí fragancias exclusivas en Mistic Essence. Perfumes premium, decants y más en Salto, Uruguay.",

metadataBase: new URL("https://www.misticessence.com"),
alternates: {
  canonical: "/",
},
// El favicon de la pestaña y el icono que muestra Google salen de
// app/icon.png y app/apple-icon.png; la imagen al compartir el link, de
// app/opengraph-image.png. Next los detecta por convencion de archivo.
openGraph: {
  title: "Mistic Essence | Perfumes Premium en Salto, Uruguay",
  description:
    "Descubrí fragancias exclusivas en Mistic Essence. Perfumes premium, decants y más en Salto, Uruguay.",
  url: "https://www.misticessence.com",
  siteName: "Mistic Essence",
  locale: "es_UY",
  type: "website",
},
twitter: {
  card: "summary_large_image",
  title: "Mistic Essence | Perfumes Premium en Salto, Uruguay",
  description:
    "Descubrí fragancias exclusivas en Mistic Essence. Perfumes premium, decants y más en Salto, Uruguay.",
},
 keywords: [
    "perfumes",
  "perfumes premium",
  "decants",
  "fragancias",
  "Mistic Essence",
  "perfumes en Salto",
  "perfumes en Uruguay",
  "perfumes exclusivos",
  "perfumes de alta calidad",
  "perfumes para hombres",
  "perfumes para mujeres",
  "perfumes salto",
  "perfumes uruguay",
  "perfumes online",
  "perfumes a domicilio",
  "perfumes originales",
  "perfumes de diseñador",
  "perfumes de nicho",
  "perfumes unisex",
  "perfumes de autor",
  "perfumes de lujo",
  "salto perfumes",
  "uruguay perfumes",
  "perfumes baratos",
  "perfumes económicos",
  "perfumes de calidad",
  "perfumes para regalar",
  "perfumes para ocasiones especiales",
  "perfumes para el día a día",
  "decants de perfumes",
  "decants de fragancias",
  "decants de perfumes premium",
  "decants de perfumes exclusivos",
  "decants de perfumes de diseñador",
  "decants de perfumes de nicho",
  "decants de perfumes unisex",
  "decants de perfumes de autor",
  "decants de perfumes de lujo",
  "decants en Salto",
  "decants en Uruguay",
  "decants online",
  "decants a domicilio",
  "decants originales",
  "decants de diseñador",
  "decants de nicho",
  "decants unisex",
  "decants de autor",
  "decants de lujo",
  "decants baratos",
  "decants económicos",
  "decants de calidad",
  "decants para regalar",
  "decants para ocasiones especiales",
  "decants para el día a día",
  "salto",
  "uruguay",
  "salto, uruguay",
  "salto perfumes",
  "mistic essence",
  "mistic essence perfumes",
  "mistic essence decants",
  "mistic essence salto",
  "mistic essence uruguay",
  "mistic essence online",
  "perfumería en Salto",
  "perfumería",
  "fragancias exclusivas",
  "perfumes de alta calidad",
  "perfumes salto",
  "perfumes uruguay",
  "perfumes online",
  ],
}


/**
 * Datos estructurados del negocio. Es lo que le permite a Google asociar el
 * logo, el telefono y la ubicacion a la marca en los resultados de busqueda.
 */
const negocioJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Mistic Essence",
  slogan: "Despertá tu esencia",
  description:
    "Perfumes premium, decants y combos armables en Salto, Uruguay.",
  url: "https://www.misticessence.com",
  logo: "https://www.misticessence.com/logo-mistic.png",
  image: "https://www.misticessence.com/og-image.png",
  telephone: "+598 98 158 434",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Salto",
    addressCountry: "UY",
  },
  areaServed: {
    "@type": "Country",
    name: "Uruguay",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "20:00",
    },
  ],
  sameAs: ["https://www.instagram.com/mistic.essence"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(negocioJsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
