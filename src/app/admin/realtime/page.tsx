import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RealtimeContent } from "./RealtimeContent";

export default async function AdminRealtime() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/");

  return <RealtimeContent />;
}
