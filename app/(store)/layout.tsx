import { StoreHeader } from "@/components/store-header"
import { StoreFooter } from "@/components/store-footer"
import { SiteBackground } from "@/components/site-background"
import { Toaster } from "@/components/ui/sonner"

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fibras animadas fijas detras de toda la tienda */}
      <SiteBackground />
      <StoreHeader />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <StoreFooter />
      <Toaster />
    </>
  )
}
