import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RealtimeContent } from "./RealtimeContent";

export default async function AdminRealtime() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <RealtimeContent />;
}
