"use client"

import { useSyncExternalStore, useCallback } from "react"

/** Perfume elegido dentro de un combo armado por el comprador. */
export interface CartComboPick {
  productId: number
  name: string
  imageUrl: string | null
}

export interface CartItem {
  /**
   * Identidad del item en el carrito. Reemplaza al viejo indice por variantId,
   * que no alcanzaba para un combo (varios productos en un solo item).
   * Formatos: "v:12" variante | "o:-10007" encargue | "r:45" rifa |
   * "c:2:7-7-19" combo (id del combo + ids elegidos, ordenados).
   */
  key: string
  variantId: number
  productId: number
  productName: string
  productSlug: string
  variantName: string
  ml: number | null
  price: number
  quantity: number
  imageUrl: string | null
  combo?: {
    comboId: number
    comboName: string
    picks: CartComboPick[]
  }
}

interface CartState {
  items: CartItem[]
  discountCode: string | null
  discountType: "percent" | "fixed" | null
  discountValue: number
}

const STORAGE_KEY = "mistic-cart"

// Los items "por encargue" usan un variantId derivado de este offset para no
// colisionar con la variante de stock del mismo producto (variantId = OFFSET - id).
export const ORDER_VARIANT_ID_OFFSET = -10000

const DEFAULT_STATE: CartState = { items: [], discountCode: null, discountType: null, discountValue: 0 }

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null
}

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null
}

function asNumber(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN
  return Number.isFinite(n) ? n : fallback
}

function asInt(v: unknown, fallback: number): number {
  const n = asNumber(v, fallback)
  return Number.isFinite(n) ? Math.trunc(n) : fallback
}

/** Clave estable de un combo: dos armados con los mismos perfumes se fusionan. */
export function buildComboKey(comboId: number, productIds: number[]): string {
  return `c:${comboId}:${[...productIds].sort((a, b) => a - b).join("-")}`
}

/**
 * La clave se deriva siempre del contenido del item, nunca se confia en la que
 * venga guardada: asi los carritos que quedaron en localStorage antes de este
 * cambio (que no tienen key) siguen funcionando sin migracion.
 */
function deriveKey(item: {
  variantId: number
  productId: number
  combo?: { comboId: number; picks: CartComboPick[] }
}): string {
  if (item.combo) {
    return buildComboKey(item.combo.comboId, item.combo.picks.map((p) => p.productId))
  }
  if (item.variantId <= ORDER_VARIANT_ID_OFFSET) return `o:${item.variantId}`
  if (item.variantId < 0 && item.productId === 0) return `r:${-item.variantId}`
  return `v:${item.variantId}`
}

function sanitizeComboPick(v: unknown): CartComboPick | null {
  if (!isRecord(v)) return null
  const productId = asInt(v.productId, -1)
  const name = asString(v.name)
  const imageUrlRaw = v.imageUrl
  const imageUrl = imageUrlRaw === null || imageUrlRaw === undefined ? null : asString(imageUrlRaw)
  if (productId <= 0 || !name) return null
  return { productId, name, imageUrl }
}

function sanitizeCombo(v: unknown): CartItem["combo"] | null {
  if (!isRecord(v)) return null
  const comboId = asInt(v.comboId, -1)
  const comboName = asString(v.comboName)
  const rawPicks = v.picks
  if (comboId <= 0 || !comboName || !Array.isArray(rawPicks)) return null
  const picks = rawPicks.map(sanitizeComboPick).filter(Boolean) as CartComboPick[]
  if (picks.length === 0 || picks.length !== rawPicks.length) return null
  return { comboId, comboName, picks }
}

function sanitizeCartItem(v: unknown): CartItem | null {
  if (!isRecord(v)) return null

  const variantId = asInt(v.variantId, -1)
  const productId = asInt(v.productId, -1)
  const productName = asString(v.productName)
  const productSlug = asString(v.productSlug)
  const variantName = asString(v.variantName)

  const mlRaw = (v as Record<string, unknown>).ml
  const ml = mlRaw === null || mlRaw === undefined ? null : asNumber(mlRaw, NaN)

  const imageUrlRaw = (v as Record<string, unknown>).imageUrl
  const imageUrl = imageUrlRaw === null || imageUrlRaw === undefined ? null : asString(imageUrlRaw)

  const price = asNumber(v.price, NaN)
  const quantity = asInt(v.quantity, 0)

  const combo = v.combo === undefined || v.combo === null ? null : sanitizeCombo(v.combo)
  // Un item que dice ser combo pero trae un combo corrupto se descarta entero.
  if (v.combo !== undefined && v.combo !== null && !combo) return null

  const isComboItem = !!combo
  const isRaffleItem = variantId <= -1 && variantId >= -300 && productId === 0
  const isOrderItem = variantId <= ORDER_VARIANT_ID_OFFSET && productId > 0
  if (!isComboItem && !isRaffleItem && !isOrderItem && (variantId < 0 || productId < 0)) return null
  if (!productName || !productSlug || !variantName) return null
  if (!Number.isFinite(price) || price < 0) return null
  if (quantity <= 0) return null
  if (ml !== null && (!Number.isFinite(ml) || ml <= 0)) return null

  const base = {
    variantId,
    productId,
    productName,
    productSlug,
    variantName,
    ml: ml === null ? null : ml,
    price,
    quantity,
    imageUrl,
    ...(combo ? { combo } : {}),
  }

  return { key: deriveKey(base), ...base }
}

function sanitizeCartState(v: unknown): CartState {
  if (!isRecord(v)) return DEFAULT_STATE

  const rawItems = (v as Record<string, unknown>).items
  const items = Array.isArray(rawItems)
    ? (rawItems.map(sanitizeCartItem).filter(Boolean) as CartItem[])
    : []

  const discountCode = asString((v as Record<string, unknown>).discountCode)
  const discountTypeRaw = asString((v as Record<string, unknown>).discountType)
  const discountType =
    discountTypeRaw === "percent" || discountTypeRaw === "fixed" ? discountTypeRaw : null

  let discountValue = asNumber((v as Record<string, unknown>).discountValue, 0)
  if (!Number.isFinite(discountValue) || discountValue < 0) discountValue = 0
  if (discountType === "percent") discountValue = Math.min(100, discountValue)
  if (discountType === null) discountValue = 0

  return {
    items,
    discountCode: discountType ? discountCode : null,
    discountType,
    discountValue,
  }
}


function getInitialState(): CartState {
  if (typeof window === "undefined") {
    return { items: [], discountCode: null, discountType: null, discountValue: 0 }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return sanitizeCartState(JSON.parse(stored))
  } catch { }
  return { items: [], discountCode: null, discountType: null, discountValue: 0 }
}


let state: CartState = getInitialState()
const listeners = new Set<() => void>()

function emit() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore storage errors (private mode/quota/etc.)
    }

  }
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): CartState {
  return state
}

const SERVER_SNAPSHOT: CartState = DEFAULT_STATE

function getServerSnapshot(): CartState {
  return SERVER_SNAPSHOT
}

export function useCart() {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const addItem = useCallback((item: Omit<CartItem, "quantity" | "key">) => {
    const key = deriveKey(item)
    const existing = state.items.find((i) => i.key === key)
    if (existing) {
      state = {
        ...state,
        items: state.items.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }
    } else {
      state = { ...state, items: [...state.items, { ...item, key, quantity: 1 }] }
    }
    emit()
  }, [])

  const removeItem = useCallback((key: string) => {
    state = { ...state, items: state.items.filter((i) => i.key !== key) }
    emit()
  }, [])

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      state = { ...state, items: state.items.filter((i) => i.key !== key) }
    } else {
      state = {
        ...state,
        items: state.items.map((i) =>
          i.key === key ? { ...i, quantity } : i
        ),
      }
    }
    emit()
  }, [])

  const setDiscount = useCallback(
    (code: string | null, type: "percent" | "fixed" | null, value: number) => {
      state = { ...state, discountCode: code, discountType: type, discountValue: value }
      emit()
    },
    []
  )

  const clearCart = useCallback(() => {
    state = { items: [], discountCode: null, discountType: null, discountValue: 0 }
    emit()
  }, [])

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  let discount = 0
  if (cart.discountType === "percent") {
    discount = Math.round((subtotal * cart.discountValue) / 100)
  } else if (cart.discountType === "fixed") {
    discount = Math.min(cart.discountValue, subtotal)
  }
  const total = subtotal - discount
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0)

  return {
    items: cart.items,
    discountCode: cart.discountCode,
    discountType: cart.discountType,
    discountValue: cart.discountValue,
    subtotal,
    discount,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    setDiscount,
    clearCart,
  }
}
