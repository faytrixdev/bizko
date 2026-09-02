import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteR2Object } from "@/lib/r2";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { key?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const prefix = `portfolio/${user.id}/`;
  if (typeof body.key !== "string" || !body.key.startsWith(prefix) || body.key.includes("..")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await deleteR2Object(body.key);

  return NextResponse.json({ ok: true });
}
