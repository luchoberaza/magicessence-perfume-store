import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { isAuthenticated } from "@/lib/admin-auth"

function revalidateStore() {
  try {
    // (store) NO es parte de la URL real
    revalidatePath("/", "layout")
    revalidatePath("/productos")
    revalidatePath("/categorias")
  } catch {
    // nunca rompas el flujo por un revalidate
  }
}


export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { product_id, name, ml, price_int, in_stock, is_active, by_order } = await request.json()
  const rows = await sql`
    INSERT INTO variants (product_id, name, ml, price_int, in_stock, is_active, by_order)
    VALUES (${product_id}, ${name}, ${ml || null}, ${price_int}, ${in_stock !== false}, ${is_active !== false}, ${by_order === true})
    RETURNING *
  `
  revalidateStore()
  return NextResponse.json(rows[0])
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id, name, ml, price_int, in_stock, is_active, by_order } = await request.json()
  const rows = await sql`
    UPDATE variants SET name = ${name}, ml = ${ml || null}, price_int = ${price_int}, in_stock = ${in_stock}, is_active = ${is_active}, by_order = ${by_order === true}
    WHERE id = ${id} RETURNING *
  `
  revalidateStore()
  return NextResponse.json(rows[0])
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await request.json()
  await sql`DELETE FROM variants WHERE id = ${id}`
  revalidateStore()
  return NextResponse.json({ success: true })
}
