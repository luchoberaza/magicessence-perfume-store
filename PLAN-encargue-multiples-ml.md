# Plan — Múltiples ml por encargue (MisticEssence)

> Pedido del cliente: que un mismo perfume **por encargue** pueda tener varias
> presentaciones de ml (ej. 100ml y 200ml), cada una con su propio precio.
> Hoy el encargue es un **precio único** (`products.encargue_price_int`) sin distinción de ml.

## Decisiones tomadas
- **Modelo elegido:** reutilizar la tabla `variants` (ya tiene `ml` + `price_int`) y
  agregarle un flag `by_order`. Cada presentación es una variante; el flag marca si es
  **stock inmediato** (`by_order = false`, comportamiento actual) o **por encargue**
  (`by_order = true`). Un mismo perfume puede tener algunas en stock y otras por encargue.
- **Compatibilidad:** NO se rompe el modelo viejo. `sale_by_order` + `encargue_price_int`
  siguen funcionando como están; las variantes por encargue son aditivas.

## Cambios (en orden)

### 1. DB — nueva migración `scripts/005-add-variant-by-order.sql`
```sql
ALTER TABLE variants ADD COLUMN IF NOT EXISTS by_order BOOLEAN DEFAULT FALSE;
```
Ejecutar contra la base de Neon/Vercel (igual que las migraciones 003/004).

### 2. Tipos — `lib/types.ts`
Agregar `by_order: boolean` a la interface `Variant`.

### 3. API variants — `app/api/admin/variants/route.ts`
- `POST`: leer y guardar `by_order` (default false).
- `PUT`: leer y actualizar `by_order`.

### 4. API products (GET admin) — `app/api/admin/products/route.ts`
- En el `json_build_object(...)` de `variants` (la subconsulta) agregar
  `'by_order', v.by_order` para que el admin reciba el flag.

### 5. Consultas tienda — `lib/queries.ts`
- `getProductBySlug` ya hace `SELECT * FROM variants ...` → trae `by_order`. OK.
- `has_stock` / `min_price` hoy miran solo `in_stock = true`. Para que un producto que
  **solo** tiene presentaciones por encargue muestre precio "desde" en la grilla:
  - Agregar a las queries de listado (`getProducts`, `getFeaturedProducts`) un campo
    `has_order` = `EXISTS(... variants v WHERE v.by_order = true AND v.is_active = true)`.
  - Agregar `order_min_price` = `MIN(price_int)` de las variantes `by_order` activas.
  - La grilla usará `min_price` (stock) y, si no hay stock, `order_min_price` con la etiqueta "(encargue)".

### 6. Admin UI — `app/admin-panel/products-tab.tsx`
- `variantForm`: agregar `by_order: false`.
- `openVariantCreate` / `openVariantEdit`: incluir `by_order`.
- `handleVariantSave`: enviar `by_order`.
- En el **dialog de variante**: agregar un `Switch` "Por encargue" junto a Stock/Activa.
- En la **lista de variantes** del detalle: badge ámbar "encargue" en las `by_order`
  (y que el toggle de stock no aplique / se atenúe para las de encargue).
- El bloque "Precio encargue" único (`encargue_price_int`) queda como está (legacy/compat).

### 7. Tienda — `app/(store)/producto/[slug]/product-detail.tsx`
Cambio de UX principal. Separar variantes:
```ts
const stockVariants = product.variants.filter(v => !v.by_order)
const orderVariants = product.variants.filter(v => v.by_order)
```
- Mostrar las `orderVariants` como botones seleccionables (con `ml` y precio), estilo ámbar.
- Al seleccionar una variante por encargue → mostrar el modal de advertencia (24/72hs)
  la primera vez → precio = `variant.price_int` de esa presentación.
- Al agregar al carrito: `variantId = ORDER_VARIANT_ID_OFFSET - variant.id`,
  `variantName = "${variant.name} ${variant.ml}ml (Encargue)"`, `price = variant.price_int`,
  `ml = variant.ml`.
- **Compat:** si el producto tiene `sale_by_order` + `encargue_price_int` y NO tiene
  variantes `by_order`, mantener el botón único "Sellado por encargue" actual.

### 8. Carrito / checkout — `lib/cart-store.ts`
- Verificar que un item por encargue (variantId negativo) no colisione con el de stock
  del mismo producto. Hoy ya usa offset negativo, debería estar OK; confirmar al implementar.

## Pruebas end-to-end (antes de deploy)
1. Migración aplicada en la base.
2. Admin: crear perfume con 50ml (stock) + 100ml y 200ml (por encargue), cada uno con su precio.
3. Admin: editar/togglear, ver badge "encargue".
4. Tienda: seleccionar cada presentación, ver precio correcto, modal de encargue, agregar al carrito.
5. Carrito + checkout/WhatsApp: el item por encargue sale con ml y precio correctos.
6. `npm run build` sin errores.

## Notas de operación
- App en producción de un cliente → cambios aditivos, no romper el flujo existente.
- Deploy por Vercel (este repo). Migración SQL contra Neon antes de publicar.
