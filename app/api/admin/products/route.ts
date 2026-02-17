import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { isAuthenticated } from "@/lib/admin-auth"

function revalidateStore() {
  revalidatePath("/(store)", "layout")
}

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const rows = await sql`
    SELECT p.*, c.name as category_name,
      (SELECT json_agg(json_build_object('id', pi.id, 'url', pi.url, 'sort_order', pi.sort_order) ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id) as images,
      (SELECT json_agg(json_build_object('id', v.id, 'name', v.name, 'ml', v.ml, 'price_int', v.price_int, 'in_stock', v.in_stock, 'is_active', v.is_active) ORDER BY v.price_int) FROM variants v WHERE v.product_id = p.id) as variants
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { name, slug, brand, description, category_id, featured, is_active } = await request.json()
  const rows = await sql`
    INSERT INTO products (name, slug, brand, description, category_id, featured, is_active)
    VALUES (${name}, ${slug}, ${brand || null}, ${description || null}, ${category_id || null}, ${featured || false}, ${is_active !== false})
    RETURNING *
  `
  revalidateStore()
  return NextResponse.json(rows[0])
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id, name, slug, brand, description, category_id, featured, is_active } = await request.json()
  const rows = await sql`
    UPDATE products SET name = ${name}, slug = ${slug}, brand = ${brand || null}, description = ${description || null},
      category_id = ${category_id || null}, featured = ${featured || false}, is_active = ${is_active !== false}
    WHERE id = ${id} RETURNING *
  `
  revalidateStore()
  return NextResponse.json(rows[0])
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await request.json()
  await sql`DELETE FROM products WHERE id = ${id}`
  revalidateStore()
  return NextResponse.json({ success: true })
}
