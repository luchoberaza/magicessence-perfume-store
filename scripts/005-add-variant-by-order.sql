-- Permite que una variante (presentacion de ml) sea "por encargue" en vez de stock inmediato.
-- Un mismo perfume puede tener algunas variantes en stock (by_order = false) y otras por encargue (by_order = true).
ALTER TABLE variants ADD COLUMN IF NOT EXISTS by_order BOOLEAN DEFAULT FALSE;
