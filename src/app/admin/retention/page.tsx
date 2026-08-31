import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RetentionContent } from "./RetentionContent";

export default async function AdminRetention() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <RetentionContent />;
}
