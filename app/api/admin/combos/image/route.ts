import { NextRequest, NextResponse } from "next/server"
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

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File
  const comboId = formData.get("combo_id") as string

  if (!file || !comboId) {
    return NextResponse.json({ error: "Archivo y combo_id requeridos" }, { status: 400 })
  }

  const safeName = (file.name || "image").replace(/[^\w.\-]+/g, "_")
  const blob = await put(`combos/${comboId}/${safeName}`, file, { access: "public" })

  const publicUrl = toStoredImageUrl(blob.url)

  await sql`UPDATE combos SET image_url = ${publicUrl} WHERE id = ${parseInt(comboId)}`

  return NextResponse.json({ url: publicUrl })
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { combo_id, url } = await request.json()

  try {
    await del(toBlobUrl(url))
  } catch {
    // Blob deletion might fail for non-blob URLs; continue anyway
  }

  await sql`UPDATE combos SET image_url = NULL WHERE id = ${parseInt(combo_id)}`

  return NextResponse.json({ success: true })
}
