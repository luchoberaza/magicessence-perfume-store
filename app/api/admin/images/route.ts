import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"
import { sql } from "@/lib/db"
import { isAuthenticated } from "@/lib/admin-auth"

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
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const formData = await request.formData()
  const file = formData.get("file") as File
  const productId = formData.get("product_id") as string
  const sortOrder = formData.get("sort_order") as string

  if (!file || !productId) {
    return NextResponse.json({ error: "Archivo y product_id requeridos" }, { status: 400 })
  }

  const blob = await put(`products/${productId}/${file.name}`, file, { access: "public" })

  const rows = await sql`
    INSERT INTO product_images (product_id, url, sort_order)
    VALUES (${parseInt(productId)}, ${blob.url}, ${parseInt(sortOrder || "0")})
    RETURNING *
  `

  revalidateStore()
  return NextResponse.json(rows[0])
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id, url } = await request.json()

  try {
    await del(url)
  } catch {
    // Blob deletion might fail for non-blob URLs; continue anyway
  }

  await sql`DELETE FROM product_images WHERE id = ${id}`
  revalidateStore()
  return NextResponse.json({ success: true })
}
