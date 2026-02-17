import { NextRequest, NextResponse } from "next/server"
import { verifyCredentials, setSession } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    const valid = await verifyCredentials(username, password)
    if (!valid) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }
    await setSession()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
