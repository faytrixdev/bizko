import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TechnologyContent } from "./TechnologyContent";

export default async function AdminTechnology() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <TechnologyContent />;
}
