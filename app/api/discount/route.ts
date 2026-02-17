import { NextRequest, NextResponse } from "next/server"
import { validateDiscountCode } from "@/lib/queries"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  if (!code) {
    return NextResponse.json({ valid: false, message: "Codigo requerido" })
  }
  const result = await validateDiscountCode(code)
  return NextResponse.json(result)
}
