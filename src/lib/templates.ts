import type { ComponentType } from "react";
import type { Template } from "@/types/database";
import {
  TEMPLATE_CONFIGS,
  getTemplateConfig,
  canUseTemplate,
  isTemplateId,
  type TemplateConfig,
} from "@/lib/template-config";
import type { TemplateProps } from "@/components/templates/types";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { PortfolioTemplate } from "@/components/templates/PortfolioTemplate";
import { StudioTemplate } from "@/components/templates/StudioTemplate";
import { EditoTemplate } from "@/components/templates/EditoTemplate";
import { UrbanTemplate } from "@/components/templates/UrbanTemplate";
import { ObsidienneTemplate } from "@/components/templates/ObsidienneTemplate";

export type { TemplateProps };

export { canUseTemplate, getTemplateConfig, isTemplateId };
export type { TemplateConfig };

export interface TemplateDefinition extends TemplateConfig {
  /** Outer page background applied by the renderer around the template sections. */
  bgClass: string;
  Component: ComponentType<TemplateProps>;
}

const COMPONENTS: Record<Template, ComponentType<TemplateProps>> = {
  minimal: MinimalTemplate,
  portfolio: PortfolioTemplate,
  studio: StudioTemplate,
  edito: EditoTemplate,
  urban: UrbanTemplate,
  obsidienne: ObsidienneTemplate,
};

const BG_CLASS: Record<Template, string> = {
  minimal: "bg-white",
  portfolio: "bg-white",
  studio: "bg-white",
  edito: "bg-[#FAF7F2]",
  urban: "bg-white",
  obsidienne: "bg-[#0B0B0F]",
};

export const TEMPLATES: TemplateDefinition[] = TEMPLATE_CONFIGS.map((cfg) => ({
  ...cfg,
  bgClass: BG_CLASS[cfg.id],
  Component: COMPONENTS[cfg.id],
}));

/** Resolve a template definition by id (fallback: minimal). */
export function getTemplate(id: string | null | undefined): TemplateDefinition {
  const cfg = getTemplateConfig(id);
  return TEMPLATES.find((t) => t.id === cfg.id)!;
}