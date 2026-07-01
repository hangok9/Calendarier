import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"
import { tryCatch } from "@/lib/errors"
import { requireCalendarAccess } from "@/services/calendar.service"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return tryCatch(async () => {
    const session = await requireSession()
    const { slug } = await params

    const { calendar } = await requireCalendarAccess(slug, session)

    const { error } = await supabase
      .from("availability")
      .delete()
      .eq("calendar_id", calendar.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  })
}
