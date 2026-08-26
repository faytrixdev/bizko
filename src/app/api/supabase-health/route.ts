import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("profiles").select("count").limit(1);
    if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
    return Response.json({ ok: true, profiles: data });
  } catch (e) {
    return Response.json({ ok: false, exception: String(e), cause: (e as Error)?.cause ? String((e as Error & {cause?: unknown}).cause) : undefined }, { status: 500 });
  }
}
