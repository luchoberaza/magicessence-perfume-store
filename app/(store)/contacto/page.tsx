import type { Metadata } from "next"
import { PageHero } from "@/components/page-hero"
import { ContactForm } from "./contact-form"
import { ContactInfo } from "./contact-info"

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contactanos para consultas sobre perfumes y fragancias.",
}

export default function ContactoPage() {
  return (
    <div>
      <PageHero
        title="Contacto"
        highlight="Contacto"
        subtitle="Escribinos tu consulta y te respondemos por WhatsApp"
      />

      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Info cards */}
          <div className="lg:col-span-2">
            <ContactInfo />
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
