import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireSession } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; planId: string }> }
) {
  try {
    const session = await requireSession()
    const { slug, planId } = await params

    if (session.slug !== slug) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { response } = await request.json()

    if (!response || !["accept", "decline", "maybe"].includes(response)) {
      return NextResponse.json(
        { error: "response debe ser accept, decline o maybe" },
        { status: 400 }
      )
    }

    const { data: existing } = await supabase
      .from("plan_responses")
      .select("id")
      .eq("plan_id", planId)
      .eq("person_id", session.person_id)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("plan_responses")
        .update({ response })
        .eq("id", existing.id)
    } else {
      await supabase.from("plan_responses").insert({
        plan_id: planId,
        person_id: session.person_id,
        response,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
