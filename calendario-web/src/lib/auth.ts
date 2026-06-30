import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { SessionPayload } from "@/types"

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "calendarier-jwt-secret-change-in-production-2026"
)

const COOKIE_NAME = "calendarier_session"

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })

  return token
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error("No autorizado")
  }
  return session
}
