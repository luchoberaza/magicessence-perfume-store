import { NextRequest, NextResponse } from "next/server"
import { put, del } from "@vercel/blob"
import { sql } from "@/lib/db"
import { isAuthenticated } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File
  const categoryId = formData.get("category_id") as string

  if (!file || !categoryId) {
    return NextResponse.json({ error: "Archivo y category_id requeridos" }, { status: 400 })
  }

  const blob = await put(`categories/${categoryId}/${file.name}`, file, { access: "public" })

  await sql`UPDATE categories SET image_url = ${blob.url} WHERE id = ${parseInt(categoryId)}`

  return NextResponse.json({ url: blob.url })
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { category_id, url } = await request.json()

  try {
    await del(url)
  } catch {
    // Blob deletion might fail for non-blob URLs; continue anyway
  }

  await sql`UPDATE categories SET image_url = NULL WHERE id = ${parseInt(category_id)}`

  return NextResponse.json({ success: true })
}
