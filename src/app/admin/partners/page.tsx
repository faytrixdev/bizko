import { getPartnerAdminData } from "./data";
import { PartnersClient } from "./PartnersClient";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const data = await getPartnerAdminData();
  return <PartnersClient data={data} />;
}
