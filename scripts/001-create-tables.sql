-- Create tables for Mistic Essence perfume store

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  brand VARCHAR(255),
  description TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  ml INTEGER,
  price_int INTEGER NOT NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS discount_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('percent', 'fixed')),
  value INTEGER NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  uses_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS order_drafts (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  items_json JSONB NOT NULL,
  subtotal_int INTEGER NOT NULL,
  discount_code VARCHAR(100),
  discount_int INTEGER DEFAULT 0,
  total_int INTEGER NOT NULL,
  customer_json JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pendiente_whatsapp'
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_variants_product ON variants(product_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
