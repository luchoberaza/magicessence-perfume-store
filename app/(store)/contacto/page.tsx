import type { Metadata } from "next"
import { ContactForm } from "./contact-form"

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contactanos para consultas sobre perfumes y fragancias.",
}

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Contacto</h1>
        <p className="mt-2 text-muted-foreground">
          Escribinos tu consulta y te respondemos por WhatsApp
        </p>
      </div>
      <div className="rounded-2xl glass p-6 lg:p-8">
        <ContactForm />
      </div>
    </div>
  )
}
