"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MessageCircle, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { formatUYU } from "@/lib/currency"
import { buildOrderWhatsAppUrl } from "@/lib/whatsapp"
import Link from "next/link"

const schema = z.object({
  departamento: z.string().min(1, "Requerido"),
  domicilio: z.string().min(1, "Requerido"),
  correo: z.string().email("Email no valido").or(z.literal("")).optional(),
  metodoPago: z.enum(["transferencia", "efectivo"]),
  entrega: z.enum(["retiro", "envio"]),
  nota: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function CheckoutForm() {
  const cart = useCart()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      metodoPago: "transferencia",
      entrega: "retiro",
    },
  })

  const metodoPago = watch("metodoPago")
  const entrega = watch("entrega")

  async function onSubmit(data: FormData) {
    // Save order draft
    try {
      await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items.map((i) => ({
            variantId: i.variantId,
            productName: i.productName,
            variantName: i.variantName,
            ml: i.ml,
            quantity: i.quantity,
            unitPrice: i.price,
          })),
          subtotal: cart.subtotal,
          discountCode: cart.discountCode,
          discount: cart.discount,
          total: cart.total,
          customer: data,
        }),
      })
    } catch {
      // Non-blocking; order proceeds via WhatsApp regardless
    }

    const url = buildOrderWhatsAppUrl(
      cart.items.map((i) => ({
        name: i.productName,
        variant: `${i.variantName}${i.ml ? ` ${i.ml}ml` : ""}`,
        quantity: i.quantity,
        unitPrice: i.price,
      })),
      cart.subtotal,
      cart.discount,
      cart.total,
      {
        departamento: data.departamento,
        domicilio: data.domicilio,
        correo: data.correo || undefined,
        metodoPago: data.metodoPago === "transferencia" ? "Transferencia" : "Efectivo",
        entrega: data.entrega === "retiro" ? "Retiro" : "Envio",
        nota: data.nota || undefined,
      },
      cart.discountCode || undefined
    )

    const win = window.open(url, "_blank", "noopener,noreferrer")
    if (win) {
      cart.clearCart()
    } else {
      alert(
        "Tu navegador bloqueó la apertura de WhatsApp. Permití los pop-ups y volvé a intentar enviar el pedido."
      )
    }

  }

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl glass py-20 text-center">
        <div className="rounded-full bg-secondary p-6">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="mt-4 text-lg font-medium text-foreground">Tu carrito esta vacio</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Agrega productos antes de continuar.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/productos">Ver productos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Order summary */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl glass p-5 space-y-4 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-foreground">Tu pedido</h2>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.variantId} className="flex justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variantName}{item.ml ? ` - ${item.ml}ml` : ""} x{item.quantity}
                  </p>
                </div>
                <p className="shrink-0 font-medium text-foreground">
                  {formatUYU(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-border/30 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatUYU(cart.subtotal)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Descuento</span>
                <span>-{formatUYU(cart.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold text-foreground">
              <span>Total</span>
              <span>{formatUYU(cart.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-5">
        <div className="rounded-2xl glass p-5 space-y-5">
          <h2 className="text-lg font-semibold text-foreground">Datos de entrega</h2>

          <div className="space-y-2">
            <Label htmlFor="departamento" className="text-foreground">Departamento</Label>
            <Input
              id="departamento"
              placeholder="Ej: Salto"
              className="bg-secondary/50"
              {...register("departamento")}
            />
            {errors.departamento && (
              <p className="text-xs text-destructive">{errors.departamento.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="domicilio" className="text-foreground">Domicilio</Label>
            <Input
              id="domicilio"
              placeholder="Direccion completa"
              className="bg-secondary/50"
              {...register("domicilio")}
            />
            {errors.domicilio && (
              <p className="text-xs text-destructive">{errors.domicilio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo" className="text-foreground">
              Correo electronico <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="correo"
              type="email"
              placeholder="tu@email.com"
              className="bg-secondary/50"
              {...register("correo")}
            />
            {errors.correo && (
              <p className="text-xs text-destructive">{errors.correo.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-foreground">Metodo de pago</Label>
            <RadioGroup
              value={metodoPago}
              onValueChange={(v) => setValue("metodoPago", v as "transferencia" | "efectivo")}
              className="flex gap-3"
            >
              <label className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${metodoPago === "transferencia" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-foreground"}`}>
                <RadioGroupItem value="transferencia" id="transferencia" />
                Transferencia
              </label>
              <label className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${metodoPago === "efectivo" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-foreground"}`}>
                <RadioGroupItem value="efectivo" id="efectivo" />
                Efectivo
              </label>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-foreground">Entrega</Label>
            <RadioGroup
              value={entrega}
              onValueChange={(v) => setValue("entrega", v as "retiro" | "envio")}
              className="flex gap-3"
            >
              <label className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${entrega === "retiro" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-foreground"}`}>
                <RadioGroupItem value="retiro" id="retiro" />
                Retiro
              </label>
              <label className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${entrega === "envio" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-foreground"}`}>
                <RadioGroupItem value="envio" id="envio" />
                Envio
              </label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nota" className="text-foreground">
              Nota <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="nota"
              placeholder="Algun comentario extra..."
              rows={3}
              className="bg-secondary/50 resize-none"
              {...register("nota")}
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full">
          <MessageCircle className="mr-2 h-5 w-5" />
          Confirmar y enviar por WhatsApp
        </Button>
      </form>
    </div>
  )
}
