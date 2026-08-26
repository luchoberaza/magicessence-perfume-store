import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { isAuthenticated } from "@/lib/admin-auth"

function revalidateStore() {
  try {
    // (store) NO es parte de la URL real
    revalidatePath("/", "layout")
    revalidatePath("/combos")
  } catch {
    // nunca rompas el flujo por un revalidate
  }
}

/** Reemplaza las categorias y exclusiones de un combo. */
async function syncRelations(
  comboId: number,
  categoryIds: unknown,
  excludedProductIds: unknown
) {
  const cats = Array.isArray(categoryIds)
    ? categoryIds.map(Number).filter((n) => Number.isFinite(n) && n > 0)
    : []
  const excluded = Array.isArray(excludedProductIds)
    ? excludedProductIds.map(Number).filter((n) => Number.isFinite(n) && n > 0)
    : []

  await sql`DELETE FROM combo_categories WHERE combo_id = ${comboId}`
  for (const categoryId of cats) {
    await sql`
      INSERT INTO combo_categories (combo_id, category_id)
      VALUES (${comboId}, ${categoryId})
      ON CONFLICT DO NOTHING
    `
  }

  await sql`DELETE FROM combo_excluded_products WHERE combo_id = ${comboId}`
  for (const productId of excluded) {
    await sql`
      INSERT INTO combo_excluded_products (combo_id, product_id)
      VALUES (${comboId}, ${productId})
      ON CONFLICT DO NOTHING
    `
  }
}

/**
 * Pool de perfumes elegibles del combo + los que quedan fuera por falta de
 * stock, para que el admin entienda por que un perfume no aparece en la tienda.
 */
async function getAdminPool(comboId: number) {
  const rows = await sql`
    SELECT p.id, p.name, p.brand,
      (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) as image_url,
      c.name as category_name,
      EXISTS(
        SELECT 1 FROM variants v
        WHERE v.product_id = p.id AND v.is_active = true AND v.in_stock = true AND v.by_order = false
      ) as has_stock,
      EXISTS(
        SELECT 1 FROM combo_excluded_products ce WHERE ce.combo_id = ${comboId} AND ce.product_id = p.id
      ) as excluded
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = true
      AND EXISTS (
        SELECT 1 FROM combo_categories cc
        WHERE cc.combo_id = ${comboId}
          AND (
            cc.category_id = p.category_id
            OR EXISTS (SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id = cc.category_id)
          )
      )
    ORDER BY c.name ASC NULLS LAST, p.name ASC
  `
  return rows
}

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const comboId = Number(request.nextUrl.searchParams.get("pool") ?? "")
  if (Number.isFinite(comboId) && comboId > 0) {
    return NextResponse.json(await getAdminPool(comboId))
  }

  const rows = await sql`
    SELECT c.*,
      ARRAY(SELECT cc.category_id FROM combo_categories cc WHERE cc.combo_id = c.id) as category_ids,
      ARRAY(SELECT ce.product_id FROM combo_excluded_products ce WHERE ce.combo_id = c.id) as excluded_product_ids,
      (
        SELECT COUNT(*)::int FROM products p
        WHERE p.is_active = true
          AND EXISTS (
            SELECT 1 FROM combo_categories cc
            WHERE cc.combo_id = c.id
              AND (
                cc.category_id = p.category_id
                OR EXISTS (SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id = cc.category_id)
              )
          )
          AND NOT EXISTS (SELECT 1 FROM combo_excluded_products ce WHERE ce.combo_id = c.id AND ce.product_id = p.id)
          AND EXISTS (SELECT 1 FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.in_stock = true AND v.by_order = false)
      ) as available_count
    FROM combos c
    ORDER BY c.sort_order ASC, c.created_at DESC
  `
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const { name, slug, description, slots, price_int, is_active, sort_order } = body

  if (!name || !slug) return NextResponse.json({ error: "Nombre y slug requeridos" }, { status: 400 })

  const safeSlots = Math.min(10, Math.max(2, Number(slots) || 3))
  const safePrice = Math.max(0, Math.trunc(Number(price_int) || 0))

  const rows = await sql`
    INSERT INTO combos (name, slug, description, slots, price_int, is_active, sort_order)
    VALUES (
      ${name}, ${slug}, ${description || null}, ${safeSlots}, ${safePrice},
      ${is_active !== false}, ${Number(sort_order) || 0}
    )
    RETURNING *
  `
  const combo = rows[0] as { id: number }
  await syncRelations(combo.id, body.category_ids, body.excluded_product_ids)

  revalidateStore()
  return NextResponse.json(combo)
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const { id, name, slug, description, slots, price_int, is_active, sort_order } = body

  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 })

  const safeSlots = Math.min(10, Math.max(2, Number(slots) || 3))
  const safePrice = Math.max(0, Math.trunc(Number(price_int) || 0))

  const rows = await sql`
    UPDATE combos SET
      name = ${name},
      slug = ${slug},
      description = ${description || null},
      slots = ${safeSlots},
      price_int = ${safePrice},
      is_active = ${is_active !== false},
      sort_order = ${Number(sort_order) || 0}
    WHERE id = ${id}
    RETURNING *
  `
  await syncRelations(Number(id), body.category_ids, body.excluded_product_ids)

  revalidateStore()
  try {
    revalidatePath(`/combos/${slug}`)
  } catch { }
  return NextResponse.json(rows[0])
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await request.json()
  await sql`DELETE FROM combos WHERE id = ${id}`

  revalidateStore()
  return NextResponse.json({ success: true })
}
