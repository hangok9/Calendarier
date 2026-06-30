import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await requireSession()
    const { slug, id } = await params

    if (session.slug !== slug) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { error } = await supabase
      .from("custom_events")
      .delete()
      .eq("id", id)
      .eq("calendar_id", session.calendar_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
