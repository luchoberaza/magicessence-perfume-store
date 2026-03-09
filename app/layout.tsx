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
    "Descubri fragancias exclusivas en Mistic Essence. Perfumes premium, decants y mas en Salto, Uruguay.",

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
