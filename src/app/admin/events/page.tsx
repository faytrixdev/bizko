import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EventsContent } from "./EventsContent";

export default async function AdminEvents() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RPC SECURITY DEFINER : `is_admin` n'est plus lisible via PostgREST
  // (liste blanche de colonnes, migration 20260923000008).
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");

  return <EventsContent />;
}
