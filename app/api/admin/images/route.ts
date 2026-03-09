import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"
import { sql } from "@/lib/db"
import { isAuthenticated } from "@/lib/admin-auth"

const BLOB_PUBLIC_HOST =
  process.env.BLOB_PUBLIC_HOST ?? "vvcgxc638vwxy6ge.public.blob.vercel-storage.com"

const IMAGE_PROXY_HOST =
  process.env.IMAGE_PROXY_HOST ?? "magicessence-image-proxy.lberaza9.workers.dev"

function toStoredImageUrl(blobUrl: string) {
  try {
    const url = new URL(blobUrl)
    if (url.hostname === BLOB_PUBLIC_HOST) {
      url.hostname = IMAGE_PROXY_HOST
    }
    return url.toString()
  } catch {
    return blobUrl
  }
}

function toBlobUrl(publicUrl: string) {
  try {
    const url = new URL(publicUrl)
    if (url.hostname === IMAGE_PROXY_HOST) {
      url.hostname = BLOB_PUBLIC_HOST
    }
    return url.toString()
  } catch {
    return publicUrl
  }
}

function revalidateStore() {
  try {
    // (store) no es parte de la URL real
    revalidatePath("/", "layout")
    revalidatePath("/productos")
    revalidatePath("/categorias")
  } catch {
    // nunca rompas el upload por revalidate
  }
}


export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()

    // Acepta ambos nombres por compatibilidad
    const fileAny = formData.get("file") ?? formData.get("image")
    const productIdAny = formData.get("product_id") ?? formData.get("productId")
    const sortOrderAny = formData.get("sort_order") ?? formData.get("sortOrder") ?? "0"

    if (!(fileAny instanceof File)) {
      return NextResponse.json({ error: "Archivo inválido (field file/image)" }, { status: 400 })
    }

    const productId = Number(String(productIdAny ?? ""))
    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json({ error: "product_id inválido" }, { status: 400 })
    }

    const sortOrder = Number(String(sortOrderAny ?? "0"))
    const safeName = (fileAny.name || "image").replace(/[^\w.\-]+/g, "_")
    const uid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now())

    const blob = await put(`products/${productId}/${uid}-${safeName}`, fileAny, {
      access: "public",
    })

    const publicUrl = toStoredImageUrl(blob.url)

    const rows = await sql`
      INSERT INTO product_images (product_id, url, sort_order)
      VALUES (${productId}, ${publicUrl}, ${Number.isFinite(sortOrder) ? sortOrder : 0})
      RETURNING *
    `

    // No dejes que revalidate rompa el request
    try {
      revalidateStore()
    } catch { }

    return NextResponse.json(rows[0])
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || String(e) },
      { status: 500 }
    )
  }
}


export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id, url } = await request.json()

  try {
    await del(toBlobUrl(url))
  } catch {
    // Blob deletion might fail for non-blob URLs; continue anyway
  }

  await sql`DELETE FROM product_images WHERE id = ${id}`
  revalidateStore()
  return NextResponse.json({ success: true })
}
