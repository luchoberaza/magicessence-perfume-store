import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { isAuthenticated } from "@/lib/admin-auth"

function normalizeHex(input: unknown): string | null {
  if (typeof input !== "string") return null
  const s = input.trim()
  if (!s) return null
  return /^#[0-9A-Fa-f]{6}$/.test(s) ? s : null
}

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


export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const rows = await sql`
    SELECT p.*, c.name as category_name,
          ARRAY(
        SELECT DISTINCT cid FROM (
          SELECT p.category_id as cid
          UNION ALL
          SELECT pc.category_id FROM product_categories pc WHERE pc.product_id = p.id
        ) t
        WHERE cid IS NOT NULL
      ) as category_ids,
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
  const { name, slug, brand, description, category_id, category_ids, color_hex, featured, sale_by_order, is_active } = await request.json()
  const hex = normalizeHex(color_hex)
  if (color_hex && !hex) {
    return NextResponse.json({ error: "color_hex inválido (usa formato #RRGGBB)" }, { status: 400 })
  }

  const catIds: number[] = Array.isArray(category_ids)
    ? category_ids.map((x) => parseInt(String(x))).filter((n) => Number.isFinite(n))
    : (category_id ? [parseInt(String(category_id))].filter((n) => Number.isFinite(n)) : [])

  const primaryCategoryId = catIds[0] ?? (category_id ? parseInt(String(category_id)) : null)
  const rows = await sql`
    INSERT INTO products (name, slug, brand, description, color_hex, category_id, featured, sale_by_order, is_active)
VALUES (${name}, ${slug}, ${brand || null}, ${description || null}, ${hex}, ${primaryCategoryId || null}, ${featured || false}, ${sale_by_order || false}, ${is_active !== false})
    RETURNING *
  `
  const created = rows[0] as { id: number } | undefined
  if (created?.id && catIds.length > 0) {
    for (const cid of catIds) {
      await sql`INSERT INTO product_categories (product_id, category_id) VALUES (${created.id}, ${cid}) ON CONFLICT DO NOTHING`
    }
  }

  revalidateStore()
  return NextResponse.json(rows[0])
}


export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id, name, slug, brand, description, category_id, category_ids, color_hex, featured, sale_by_order, is_active } = await request.json()
  const hex = normalizeHex(color_hex)
  if (color_hex && !hex) {
    return NextResponse.json({ error: "color_hex inválido (usa formato #RRGGBB)" }, { status: 400 })
  }

  const catIds: number[] = Array.isArray(category_ids)
    ? category_ids.map((x) => parseInt(String(x))).filter((n) => Number.isFinite(n))
    : (category_id ? [parseInt(String(category_id))].filter((n) => Number.isFinite(n)) : [])

  const primaryCategoryId = catIds[0] ?? (category_id ? parseInt(String(category_id)) : null)
  const rows = await sql`
    UPDATE products SET name = ${name}, slug = ${slug}, brand = ${brand || null}, description = ${description || null},
  color_hex = ${hex}, category_id = ${primaryCategoryId || null}, featured = ${featured || false}, sale_by_order = ${sale_by_order || false}, is_active = ${is_active !== false}
    WHERE id = ${id} RETURNING *
  `
  await sql`DELETE FROM product_categories WHERE product_id = ${id}`
  for (const cid of catIds) {
    await sql`INSERT INTO product_categories (product_id, category_id) VALUES (${id}, ${cid}) ON CONFLICT DO NOTHING`
  }

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
