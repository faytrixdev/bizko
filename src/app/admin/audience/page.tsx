import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AudienceContent } from "./AudienceContent";

export default async function AdminAudience() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <AudienceContent />;
}
