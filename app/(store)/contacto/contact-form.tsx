"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageCircle } from "lucide-react"
import { buildContactWhatsAppUrl } from "@/lib/whatsapp"

const schema = z.object({
  message: z.string().min(1, "El mensaje es requerido"),
  name: z.string().optional(),
  email: z.string().email("Email no valido").optional().or(z.literal("")),
})

type FormData = z.infer<typeof schema>

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  function onSubmit(data: FormData) {
    const url = buildContactWhatsAppUrl(data.message, data.name || undefined, data.email || undefined)
    window.open(url, "_blank")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="message" className="text-foreground">
          Tu mensaje <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          placeholder="Contanos tu consulta..."
          rows={5}
          className="bg-secondary/50 resize-none"
          {...register("message")}
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">
            Nombre <span className="text-xs text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="name"
            placeholder="Tu nombre"
            className="bg-secondary/50"
            {...register("name")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Correo <span className="text-xs text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            className="bg-secondary/50"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full">
        <MessageCircle className="mr-2 h-5 w-5" />
        Enviar por WhatsApp
      </Button>
    </form>
  )
}
