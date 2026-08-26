# Plan — Combos armables (MisticEssence)

> Pedido del cliente: poder crear **combos** con precio fijo donde el comprador
> elige N perfumes (ej. "Combo 3 decants de 5ml") dentro de una o más categorías.
> El combo define el precio; el comprador define qué perfumes lo componen.

## Decisiones tomadas (validadas con el cliente)

| Tema | Decisión |
|------|----------|
| **Presentación (ml)** | El sistema **no valida ml**. El combo se asocia a categorías y el admin puede excluir perfumes puntuales. El tamaño lo comunica el nombre del combo. |
| **Repetidos** | El comprador **puede repetir** el mismo perfume dentro del combo. |
| **Ubicación** | Sección propia `/combos` + link en el header + franja en el home. |
| **Stock** | Solo se listan perfumes con al menos una variante activa y en stock. |
| **Cantidad** | El combo lleva control de cantidad en el carrito; dos armados idénticos se fusionan en x2. |
| **Descuentos** | Los códigos aplican sobre el combo como sobre cualquier producto. |
| **Slots** | La cantidad de perfumes la define el admin por combo (2 a 10). |
| **Modelo** | Entidad propia (`combos`), NO un flag sobre `products`. |
| **Carrito** | Refactor a clave de texto (`key`), reemplazando el índice por `variantId`. |

## Arquitectura

**Entidad propia** en vez de reutilizar `products` con un flag: un combo no tiene
marca, ni ml, ni variantes, y meterlo en `products` obligaría a filtrar `is_combo`
en las cinco queries de `lib/queries.ts`, en la grilla, en destacados y en el sitemap.
Un olvido = combos apareciendo como perfumes sueltos.

**El pool de perfumes no se persiste**: se resuelve en cada carga como
`productos activos de las categorías del combo − excluidos − sin stock`.
Un perfume nuevo en una categoría entra solo al combo; uno sin stock sale solo.

## Cambios (en orden de ejecución)

### 1. DB — `scripts/006-create-combos.sql`
Tablas `combos`, `combo_categories`, `combo_excluded_products` + índices.
Ejecutar contra Neon antes del deploy (igual que 003/004/005).

### 2. Tipos — `lib/types.ts`
`Combo`, `ComboPoolProduct`, `ComboWithDetails`.

### 3. Consultas tienda — `lib/queries.ts`
- `getCombos()` — combos activos con su cantidad de perfumes disponibles.
- `getComboBySlug(slug)` — combo + pool resuelto (imagen, marca, categoría).

### 4. API admin — `app/api/admin/combos/route.ts`
GET / POST / PUT / DELETE con `isAuthenticated()` y `revalidatePath`.
Maneja también las categorías y las exclusiones del combo.

### 5. API imagen — `app/api/admin/combos/image/route.ts`
Calcado de `categories/image` (Vercel Blob + reescritura al host del proxy).

### 6. Admin UI — `app/admin-panel/combos-tab.tsx` + `page.tsx`
Cuarta entrada de navegación (atajo `4`, icono `Gift`). Lista de combos,
dialog de alta/edición (nombre, slug, descripción, precio, slots, orden,
activo, categorías) y panel de perfumes incluidos/excluidos con el pool resuelto.

### 7. Carrito — `lib/cart-store.ts`
Refactor: `CartItem` gana `key: string` y `combo?`. Las operaciones pasan a
indexar por `key`. Claves: `v:{id}` variante · `o:{id}` encargue · `r:{n}` rifa ·
`c:{comboId}:{ids ordenados}` combo. `sanitizeCartItem` deriva la `key` cuando
falta, para que los carritos ya guardados en el navegador sigan funcionando.

### 8. Consumidores del carrito
`cart-drawer.tsx`, `checkout-form.tsx`, `product-detail.tsx`, `raffle-grid.tsx`:
pasan a operar por `key`. El drawer y el resumen del checkout listan los perfumes
elegidos debajo del nombre del combo.

### 9. WhatsApp — `lib/whatsapp.ts`
`OrderItem` gana `details?: string[]`, que se imprimen indentados bajo la línea.

### 10. Tienda — `/combos` y `/combos/[slug]`
- `combos/page.tsx` — grilla de combos (`ComboCard`).
- `combos/[slug]/page.tsx` — server component que resuelve el pool.
- `components/combo-builder.tsx` — el armador (client): slots, pool con buscador
  y filtro por categoría, botón sticky con el precio.

### 11. Navegación
`store-header.tsx` (link "Combos"), `app/sitemap.ts`, franja `CombosStrip` en el home.

## Pruebas end-to-end (gate de cierre)
1. Migración aplicada en Neon.
2. Admin: crear combo con 2 categorías, excluir perfumes, subir imagen.
3. Un perfume sin stock no aparece en el armador.
4. Armar un combo repitiendo un perfume.
5. Dos armados idénticos se fusionan en x2 en el carrito.
6. Un carrito guardado antes del deploy sigue funcionando (compatibilidad de `key`).
7. Código de descuento sobre un carrito con combo.
8. Mensaje de WhatsApp con las líneas de detalle del combo.
9. `order_drafts` guarda las picks.
10. Responsive completo del armador en mobile.
11. `npm run build` sin errores.

## Notas de operación
- App en producción de un cliente → todo aditivo salvo el refactor del carrito,
  que es retrocompatible con los carritos ya guardados en `localStorage`.
- Deploy por Vercel. Migración SQL contra Neon **antes** de publicar.
