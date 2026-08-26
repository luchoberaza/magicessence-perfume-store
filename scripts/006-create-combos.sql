-- Combos armables: el admin define un combo con precio fijo y una cantidad de
-- perfumes a elegir; el comprador arma el combo eligiendo de las categorias
-- asociadas. El pool de perfumes NO se persiste: se resuelve en cada carga como
-- productos activos de las categorias del combo, menos los excluidos, menos los
-- que no tienen ninguna variante en stock.

CREATE TABLE IF NOT EXISTS combos (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  slots INTEGER NOT NULL DEFAULT 3 CHECK (slots >= 2 AND slots <= 10),
  price_int INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS combo_categories (
  combo_id INTEGER NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (combo_id, category_id)
);

CREATE TABLE IF NOT EXISTS combo_excluded_products (
  combo_id INTEGER NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (combo_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_combos_slug ON combos(slug);
CREATE INDEX IF NOT EXISTS idx_combos_active ON combos(is_active);
CREATE INDEX IF NOT EXISTS idx_combo_categories_combo ON combo_categories(combo_id);
CREATE INDEX IF NOT EXISTS idx_combo_excluded_combo ON combo_excluded_products(combo_id);
