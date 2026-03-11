import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { isAuthenticated } from "@/lib/admin-auth"

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const rows = await sql`SELECT number, participant_name FROM raffle_entries ORDER BY number`
  return NextResponse.json(rows)
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { number, participant_name } = await request.json()

  if (!number || typeof number !== "number" || number < 1 || number > 300) {
    return NextResponse.json({ error: "Numero invalido" }, { status: 400 })
  }

  const name = typeof participant_name === "string" ? participant_name.trim() : ""
  if (!name) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })
  }

  const rows = await sql`
    INSERT INTO raffle_entries (number, participant_name, updated_at)
    VALUES (${number}, ${name}, NOW())
    ON CONFLICT (number)
    DO UPDATE SET participant_name = ${name}, updated_at = NOW()
    RETURNING *
  `
  revalidatePath("/rifa")
  return NextResponse.json(rows[0])
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { number } = await request.json()

  if (!number || typeof number !== "number" || number < 1 || number > 300) {
    return NextResponse.json({ error: "Numero invalido" }, { status: 400 })
  }

  await sql`DELETE FROM raffle_entries WHERE number = ${number}`
  revalidatePath("/rifa")
  return NextResponse.json({ success: true })
}
