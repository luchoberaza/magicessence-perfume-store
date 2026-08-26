export interface Category {
  id: number
  name: string
  slug: string
  image_url: string | null
  sort_order: number
}

export interface Product {
  id: number
  name: string
  slug: string
  brand: string | null
  description: string | null
  category_id: number | null
  color_hex: string | null
  featured: boolean
  sale_by_order: boolean
  encargue_price_int: number | null
  is_active: boolean
  created_at: string
}

export interface ProductImage {
  id: number
  product_id: number
  url: string
  sort_order: number
}

export interface Variant {
  id: number
  product_id: number
  name: string
  ml: number | null
  price_int: number
  in_stock: boolean
  is_active: boolean
  by_order: boolean
}

export interface DiscountCode {
  id: number
  code: string
  type: "percent" | "fixed"
  value: number
  active: boolean
  expires_at: string | null
  uses_count: number
}

export interface ProductWithDetails extends Product {
  images: ProductImage[]
  variants: Variant[]
  category_name: string | null
  category_slug: string | null
  category_ids?: number[]
  min_price: number | null
  has_stock: boolean
  order_min_price?: number | null
  has_order?: boolean
}
export interface Combo {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
  slots: number
  price_int: number
  is_active: boolean
  sort_order: number
  created_at: string
}

/** Perfume elegible dentro de un combo (pool resuelto en cada carga). */
export interface ComboPoolProduct {
  id: number
  name: string
  slug: string
  brand: string | null
  image_url: string | null
  /** Todas las categorias del producto, para filtrar por chips en el armador. */
  category_ids: number[]
  category_name: string | null
}

export interface ComboWithDetails extends Combo {
  category_ids: number[]
  categories: { id: number; name: string }[]
  /** Cantidad de perfumes disponibles hoy para armar este combo. */
  available_count: number
  pool?: ComboPoolProduct[]
}
