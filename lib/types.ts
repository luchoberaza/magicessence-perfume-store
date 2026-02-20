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
}
