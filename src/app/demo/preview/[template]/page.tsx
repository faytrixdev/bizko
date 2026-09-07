import { notFound } from "next/navigation";
import { isTemplateId } from "@/lib/template-config";
import { DemoProfileView } from "../../DemoProfileView";

type Props = { params: Promise<{ template: string }> };

export default async function PreviewPage({ params }: Props) {
  const { template } = await params;
  if (!isTemplateId(template)) notFound();
  return <DemoProfileView template={template} />;
}
