import { StoreHeader } from "@/components/store-header"
import { StoreFooter } from "@/components/store-footer"
import { Toaster } from "@/components/ui/sonner"

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHeader />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <StoreFooter />
      <Toaster />
    </>
  )
}
