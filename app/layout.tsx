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
  ],
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
