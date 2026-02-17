import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { isAuthenticated } from "@/lib/admin-auth"

function revalidateStore() {
  revalidatePath("/(store)", "layout")
}

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const rows = await sql`SELECT * FROM categories ORDER BY sort_order ASC, name ASC`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { name, slug, image_url, sort_order } = await request.json()
  const rows = await sql`
    INSERT INTO categories (name, slug, image_url, sort_order)
    VALUES (${name}, ${slug}, ${image_url || null}, ${sort_order || 0})
    RETURNING *
  `
  revalidateStore()
  return NextResponse.json(rows[0])
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id, name, slug, image_url, sort_order } = await request.json()
  const rows = await sql`
    UPDATE categories SET name = ${name}, slug = ${slug}, image_url = ${image_url || null}, sort_order = ${sort_order || 0}
    WHERE id = ${id} RETURNING *
  `
  revalidateStore()
  return NextResponse.json(rows[0])
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await request.json()
  await sql`DELETE FROM categories WHERE id = ${id}`
  revalidateStore()
  return NextResponse.json({ success: true })
}
