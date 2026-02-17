import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/admin-auth"
import { Toaster } from "@/components/ui/sonner"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin | Mistic Essence",
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated()
  if (!authed) redirect("/admin-login")

  return (
    <div className="min-h-screen bg-background">
      {children}
      <Toaster />
    </div>
  )
}
