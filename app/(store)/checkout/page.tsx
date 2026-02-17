import type { Metadata } from "next"
import { CheckoutForm } from "./checkout-form"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Completa tu pedido y envia por WhatsApp.",
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Finalizar pedido</h1>
        <p className="mt-2 text-muted-foreground">
          Completa tus datos para confirmar el pedido por WhatsApp
        </p>
      </div>
      <CheckoutForm />
    </div>
  )
}
