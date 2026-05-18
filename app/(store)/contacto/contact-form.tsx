"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageCircle, Send, User, Mail } from "lucide-react"
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
    <motion.div
      className="rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm lg:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Envianos un mensaje</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Completa el formulario y te contactamos por WhatsApp
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label htmlFor="message" className="text-foreground flex items-center gap-2">
            <MessageCircle className="h-3.5 w-3.5 text-primary" />
            Tu mensaje <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="message"
            placeholder="Contanos tu consulta..."
            rows={5}
            className="bg-secondary/30 border-border/50 resize-none focus:border-primary/40 transition-colors"
            {...register("message")}
          />
          {errors.message && (
            <p className="text-xs text-destructive">{errors.message.message}</p>
          )}
        </motion.div>

        <motion.div
          className="grid gap-4 sm:grid-cols-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              Nombre <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="name"
              placeholder="Tu nombre"
              className="bg-secondary/30 border-border/50 focus:border-primary/40 transition-colors"
              {...register("name")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-primary" />
              Correo <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              className="bg-secondary/30 border-border/50 focus:border-primary/40 transition-colors"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" size="lg" className="group w-full text-base">
              <Send className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Enviar por WhatsApp
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  )
}
