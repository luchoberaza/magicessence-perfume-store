const PHONE = "59898158434"

function getUruguayDateTime(): string {
  const now = new Date()
  return now.toLocaleString("es-UY", {
    timeZone: "America/Montevideo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function buildContactWhatsAppUrl(message: string, name?: string, email?: string): string {
  let text = `Consulta desde Mistic Essence\nFecha: ${getUruguayDateTime()}\n\n`
  if (name) text += `Nombre: ${name}\n`
  if (email) text += `Correo: ${email}\n`
  text += `\nMensaje:\n${message}`
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`
}

export interface OrderItem {
  name: string
  variant: string
  quantity: number
  unitPrice: number
}

export interface OrderCustomer {
  departamento: string
  domicilio: string
  correo?: string
  metodoPago: string
  entrega: string
  nota?: string
}

export function buildOrderWhatsAppUrl(
  items: OrderItem[],
  subtotal: number,
  discount: number,
  total: number,
  customer: OrderCustomer,
  discountCode?: string
): string {
  let text = `Pedido desde Mistic Essence\nFecha: ${getUruguayDateTime()}\n\n`
  text += `--- Productos ---\n`
  for (const item of items) {
    const formatter = new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU", minimumFractionDigits: 0, maximumFractionDigits: 0 })
    text += `${item.name} - ${item.variant} x${item.quantity} (${formatter.format(item.unitPrice)} c/u)\n`
  }
  const fmt = new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU", minimumFractionDigits: 0, maximumFractionDigits: 0 })
  text += `\n--- Resumen ---\n`
  text += `Subtotal: ${fmt.format(subtotal)}\n`
  if (discount > 0) {
    text += `Descuento${discountCode ? ` (${discountCode})` : ""}: -${fmt.format(discount)}\n`
  }
  text += `TOTAL: ${fmt.format(total)}\n`
  text += `\n--- Datos del Cliente ---\n`
  text += `Departamento: ${customer.departamento}\n`
  text += `Domicilio: ${customer.domicilio}\n`
  if (customer.correo) text += `Correo: ${customer.correo}\n`
  text += `Metodo de pago: ${customer.metodoPago}\n`
  text += `Entrega: ${customer.entrega}\n`
  if (customer.nota) text += `Nota: ${customer.nota}\n`
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`
}
