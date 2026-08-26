import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username || !/^[a-z0-9_]{3,30}$/.test(username)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  const supabase = await createClient();
  const { data } = await supabase.rpc("is_username_available", { uname: username });

  return NextResponse.json({ available: data ?? false });
}
