import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";
import { RESERVED_USERNAMES } from "@/lib/reservedUsernames";
import { isValidUsername } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(request, {
    limit: 60,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json(
      { available: false, reason: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username || !isValidUsername(username)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  if (RESERVED_USERNAMES.has(username)) {
    return NextResponse.json({ available: false, reason: "reserved" });
  }

  const supabase = await createClient();
  const { data } = await supabase.rpc("is_username_available", { uname: username });

  return NextResponse.json({ available: data ?? false });
}
