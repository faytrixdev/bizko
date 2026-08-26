import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("pid");
  const type = searchParams.get("type");
  const to = searchParams.get("to");

  if (profileId && type && to) {
    const supabase = await createClient();
    supabase.from("events").insert({ profile_id: profileId, type }).then(() => {});
  }

  return NextResponse.redirect(to || "https://wa.me", { status: 302 });
}
