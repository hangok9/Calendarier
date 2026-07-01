import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET environment variable is not set")
  return new TextEncoder().encode(secret)
}

const COOKIE_NAME = "calendarier_session"

const publicApiPaths = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
]

export async function proxy(request: NextRequest) {
  if (request.method === "GET" && request.nextUrl.pathname === "/api/calendars") {
    return NextResponse.next()
  }

  if (publicApiPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    try {
      const { payload } = await jwtVerify(token, getSecret())
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-session-user-id", payload.user_id as string)
      requestHeaders.set("x-session-username", payload.username as string)
      return NextResponse.next({ request: { headers: requestHeaders } })
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
