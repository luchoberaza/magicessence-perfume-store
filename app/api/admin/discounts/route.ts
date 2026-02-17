import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { isAuthenticated } from "@/lib/admin-auth"

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const rows = await sql`SELECT * FROM discount_codes ORDER BY id DESC`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { code, type, value, active, expires_at } = await request.json()
  const rows = await sql`
    INSERT INTO discount_codes (code, type, value, active, expires_at)
    VALUES (${code}, ${type}, ${value}, ${active !== false}, ${expires_at || null})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id, code, type, value, active, expires_at } = await request.json()
  const rows = await sql`
    UPDATE discount_codes SET code = ${code}, type = ${type}, value = ${value}, active = ${active}, expires_at = ${expires_at || null}
    WHERE id = ${id} RETURNING *
  `
  return NextResponse.json(rows[0])
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await request.json()
  await sql`DELETE FROM discount_codes WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
