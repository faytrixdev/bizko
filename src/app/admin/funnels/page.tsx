import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FunnelsContent } from "./FunnelsContent";

export default async function AdminFunnels() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <FunnelsContent />;
}
