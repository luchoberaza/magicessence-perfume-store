import { sql } from "./db"
import type { Category, ProductWithDetails, Variant, ProductImage } from "./types"

export async function getCategories(): Promise<Category[]> {
  const rows = await sql`SELECT * FROM categories ORDER BY sort_order ASC, name ASC`
  return rows as Category[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const rows = await sql`SELECT * FROM categories WHERE slug = ${slug} LIMIT 1`
  return (rows[0] as Category) || null
}

export async function getProducts(options?: {
  categoryId?: number
  featured?: boolean
}): Promise<ProductWithDetails[]> {
  let rows: Record<string, unknown>[]

  if (options?.categoryId && options?.featured) {
    rows = await sql`
      SELECT p.*,
        c.name as category_name,
        c.slug as category_slug,
                ARRAY(
          SELECT DISTINCT cid FROM (
            SELECT p.category_id as cid
            UNION ALL
            SELECT pc.category_id FROM product_categories pc WHERE pc.product_id = p.id
          ) t
          WHERE cid IS NOT NULL
        ) as category_ids,
        (SELECT MIN(v.price_int) FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.in_stock = true AND v.by_order = false) as min_price,
        EXISTS(SELECT 1 FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.in_stock = true AND v.by_order = false) as has_stock,
        (SELECT MIN(v.price_int) FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.by_order = true) as order_min_price,
        EXISTS(SELECT 1 FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.by_order = true) as has_order
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
  AND (
    p.category_id = ${options.categoryId}
    OR EXISTS(SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id = ${options.categoryId})
  ) AND p.featured = true
      ORDER BY p.created_at DESC
    `
  } else if (options?.categoryId) {
    rows = await sql`
      SELECT p.*,
        c.name as category_name,
        c.slug as category_slug,
                ARRAY(
          SELECT DISTINCT cid FROM (
            SELECT p.category_id as cid
            UNION ALL
            SELECT pc.category_id FROM product_categories pc WHERE pc.product_id = p.id
          ) t
          WHERE cid IS NOT NULL
        ) as category_ids,
        (SELECT MIN(v.price_int) FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.in_stock = true AND v.by_order = false) as min_price,
        EXISTS(SELECT 1 FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.in_stock = true AND v.by_order = false) as has_stock,
        (SELECT MIN(v.price_int) FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.by_order = true) as order_min_price,
        EXISTS(SELECT 1 FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.by_order = true) as has_order
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
  AND (
    p.category_id = ${options.categoryId}
    OR EXISTS(SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id = ${options.categoryId})
  )
      ORDER BY p.created_at DESC
    `
  } else if (options?.featured) {
    rows = await sql`
      SELECT p.*,
        c.name as category_name,
        c.slug as category_slug,
                ARRAY(
          SELECT DISTINCT cid FROM (
            SELECT p.category_id as cid
            UNION ALL
            SELECT pc.category_id FROM product_categories pc WHERE pc.product_id = p.id
          ) t
          WHERE cid IS NOT NULL
        ) as category_ids,
        (SELECT MIN(v.price_int) FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.in_stock = true AND v.by_order = false) as min_price,
        EXISTS(SELECT 1 FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.in_stock = true AND v.by_order = false) as has_stock,
        (SELECT MIN(v.price_int) FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.by_order = true) as order_min_price,
        EXISTS(SELECT 1 FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.by_order = true) as has_order
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true AND p.featured = true
      ORDER BY p.created_at DESC
    `
  } else {
    rows = await sql`
      SELECT p.*,
        c.name as category_name,
        c.slug as category_slug,
                ARRAY(
          SELECT DISTINCT cid FROM (
            SELECT p.category_id as cid
            UNION ALL
            SELECT pc.category_id FROM product_categories pc WHERE pc.product_id = p.id
          ) t
          WHERE cid IS NOT NULL
        ) as category_ids,
        (SELECT MIN(v.price_int) FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.in_stock = true AND v.by_order = false) as min_price,
        EXISTS(SELECT 1 FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.in_stock = true AND v.by_order = false) as has_stock,
        (SELECT MIN(v.price_int) FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.by_order = true) as order_min_price,
        EXISTS(SELECT 1 FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.by_order = true) as has_order
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
    `
  }

  const products = rows as ProductWithDetails[]

  // Fetch images for all products
  if (products.length > 0) {
    for (const p of products) {
      const images = await sql`SELECT * FROM product_images WHERE product_id = ${p.id} ORDER BY sort_order ASC`
      p.images = images as ProductImage[]
      p.variants = []
    }
  }

  return products
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  const rows = await sql`
    SELECT p.*,
      c.name as category_name,
      c.slug as category_slug,
            ARRAY(
        SELECT DISTINCT cid FROM (
          SELECT p.category_id as cid
          UNION ALL
          SELECT pc.category_id FROM product_categories pc WHERE pc.product_id = p.id
        ) t
        WHERE cid IS NOT NULL
      ) as category_ids,
      (SELECT MIN(v.price_int) FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.in_stock = true AND v.by_order = false) as min_price,
      EXISTS(SELECT 1 FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.in_stock = true AND v.by_order = false) as has_stock,
      (SELECT MIN(v.price_int) FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.by_order = true) as order_min_price,
      EXISTS(SELECT 1 FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.by_order = true) as has_order
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ${slug} AND p.is_active = true
    LIMIT 1
  `
  if (!rows[0]) return null

  const product = rows[0] as ProductWithDetails
  const images = await sql`SELECT * FROM product_images WHERE product_id = ${product.id} ORDER BY sort_order ASC`
  product.images = images as ProductImage[]

  const variants = await sql`SELECT * FROM variants WHERE product_id = ${product.id} AND is_active = true ORDER BY price_int ASC`
  product.variants = variants as Variant[]

  return product
}

export async function getFeaturedProducts(limit = 3): Promise<ProductWithDetails[]> {
  const rows = await sql`
    SELECT p.*,
      c.name as category_name,
      c.slug as category_slug,
            ARRAY(
        SELECT DISTINCT cid FROM (
          SELECT p.category_id as cid
          UNION ALL
          SELECT pc.category_id FROM product_categories pc WHERE pc.product_id = p.id
        ) t
        WHERE cid IS NOT NULL
      ) as category_ids,
      (SELECT MIN(v.price_int) FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.in_stock = true AND v.by_order = false) as min_price,
      EXISTS(SELECT 1 FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.in_stock = true AND v.by_order = false) as has_stock,
      (SELECT MIN(v.price_int) FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.by_order = true) as order_min_price,
      EXISTS(SELECT 1 FROM variants v WHERE v.product_id = p.id AND v.is_active = true AND v.by_order = true) as has_order
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = true
    ORDER BY p.featured DESC, RANDOM()
    LIMIT ${limit}
  `
  const products = rows as ProductWithDetails[]

  for (const p of products) {
    const images = await sql`SELECT * FROM product_images WHERE product_id = ${p.id} ORDER BY sort_order ASC`
    p.images = images as ProductImage[]
    p.variants = []
  }

  return products
}

/*
export async function getRaffleEntries(): Promise<number[]> {
  const rows = await sql`SELECT number FROM raffle_entries ORDER BY number`
  return rows.map((r: { number: number }) => r.number)
}
*/

export async function validateDiscountCode(code: string): Promise<{
  valid: boolean
  type?: "percent" | "fixed"
  value?: number
  message?: string
}> {
  const rows = await sql`
    SELECT * FROM discount_codes 
    WHERE LOWER(code) = LOWER(${code}) AND active = true
    LIMIT 1
  `
  if (!rows[0]) return { valid: false, message: "Codigo no valido" }

  const discount = rows[0] as { type: "percent" | "fixed"; value: number; expires_at: string | null }
  if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
    return { valid: false, message: "Codigo expirado" }
  }

  return { valid: true, type: discount.type, value: discount.value }
}
