import { SignJWT, jwtVerify } from "jose"
import { cookies, headers } from "next/headers"
import type { SessionPayload } from "@/types"
import { unauthorized } from "./errors"

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set")
  }
  return new TextEncoder().encode(secret)
}

function getResetSecret(): Uint8Array {
  const secret = process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET
  if (!secret) {
    throw new Error("RESET_TOKEN_SECRET or JWT_SECRET environment variable is not set")
  }
  return new TextEncoder().encode(secret)
}

const COOKIE_NAME = "calendarier_session"

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(getSecret())

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
    const headersList = await headers()
    const userId = headersList.get("x-session-user-id")
    const username = headersList.get("x-session-username")
    if (userId && username) {
      return { user_id: userId, username }
    }
  } catch {}

  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, getSecret())
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
    throw unauthorized()
  }
  return session
}

export async function createResetToken(userId: string): Promise<string> {
  const secret = getResetSecret()
  return await new SignJWT({ user_id: userId, purpose: "reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret)
}

export async function verifyResetToken(token: string): Promise<{ user_id: string }> {
  const secret = getResetSecret()
  const { payload } = await jwtVerify(token, secret)
  const data = payload as unknown as { user_id: string; purpose: string }
  if (data.purpose !== "reset") {
    throw new Error("Token invalido")
  }
  return { user_id: data.user_id }
}
