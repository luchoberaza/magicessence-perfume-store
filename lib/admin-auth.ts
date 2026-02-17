import { cookies } from "next/headers"
import { compare } from "bcryptjs"

const SESSION_NAME = "admin_session"
const SESSION_VALUE = "authenticated"

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USER
  const expectedHash = process.env.ADMIN_PASSWORD_HASH
  if (!expectedUser || !expectedHash) return false
  if (username !== expectedUser) return false
  return compare(password, expectedHash)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_NAME)?.value === SESSION_VALUE
}

export async function setSession() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_NAME, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_NAME)
}

export function getAdminPath(): string {
  return process.env.ADMIN_PATH || "_panel-admin"
}
