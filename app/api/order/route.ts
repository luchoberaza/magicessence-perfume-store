import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, subtotal, discountCode, discount, total, customer } = body

    await sql`
      INSERT INTO order_drafts (items_json, subtotal_int, discount_code, discount_int, total_int, customer_json, status)
      VALUES (${JSON.stringify(items)}, ${subtotal}, ${discountCode || null}, ${discount || 0}, ${total}, ${JSON.stringify(customer)}, 'pendiente_whatsapp')
    `

    // Increment discount code usage if applicable
    if (discountCode) {
      await sql`UPDATE discount_codes SET uses_count = uses_count + 1 WHERE LOWER(code) = LOWER(${discountCode})`
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Order save error:", error)
    return NextResponse.json({ error: "Error al guardar pedido" }, { status: 500 })
  }
}
