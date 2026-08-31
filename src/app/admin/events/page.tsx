import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EventsContent } from "./EventsContent";

export default async function AdminEvents() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <EventsContent />;
}
