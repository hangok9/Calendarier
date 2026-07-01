import { NextResponse } from "next/server"
import { destroySession } from "@/lib/auth"
import { tryCatch } from "@/lib/errors"

export async function POST() {
  return tryCatch(async () => {
    await destroySession()
    return NextResponse.json({ success: true })
  })
}
