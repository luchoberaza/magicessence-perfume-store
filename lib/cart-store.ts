"use client"

import { useSyncExternalStore, useCallback } from "react"

export interface CartItem {
  variantId: number
  productId: number
  productName: string
  productSlug: string
  variantName: string
  ml: number | null
  price: number
  quantity: number
  imageUrl: string | null
}

interface CartState {
  items: CartItem[]
  discountCode: string | null
  discountType: "percent" | "fixed" | null
  discountValue: number
}

const STORAGE_KEY = "mistic-cart"

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

  const isRaffleItem = variantId <= -1 && variantId >= -300 && productId === 0
  if (!isRaffleItem && (variantId < 0 || productId < 0)) return null
  if (!productName || !productSlug || !variantName) return null
  if (!Number.isFinite(price) || price < 0) return null
  if (quantity <= 0) return null
  if (ml !== null && (!Number.isFinite(ml) || ml <= 0)) return null

  return {
    variantId,
    productId,
    productName,
    productSlug,
    variantName,
    ml: ml === null ? null : ml,
    price,
    quantity,
    imageUrl,
  }
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

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    const existing = state.items.find((i) => i.variantId === item.variantId)
    if (existing) {
      state = {
        ...state,
        items: state.items.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }
    } else {
      state = { ...state, items: [...state.items, { ...item, quantity: 1 }] }
    }
    emit()
  }, [])

  const removeItem = useCallback((variantId: number) => {
    state = { ...state, items: state.items.filter((i) => i.variantId !== variantId) }
    emit()
  }, [])

  const updateQuantity = useCallback((variantId: number, quantity: number) => {
    if (quantity <= 0) {
      state = { ...state, items: state.items.filter((i) => i.variantId !== variantId) }
    } else {
      state = {
        ...state,
        items: state.items.map((i) =>
          i.variantId === variantId ? { ...i, quantity } : i
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
