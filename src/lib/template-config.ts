import type { Plan } from "@/lib/plans";
import type { Template } from "@/types/database";

export interface TemplateConfig {
  id: Template;
  tier: "free" | "pro";
  /** i18n key for the display name, e.g. "dashboard.templateStudio" */
  nameKey: string;
  /** i18n key for the one-line picker description, e.g. "dashboard.templateDescStudio" */
  descriptionKey: string;
}

/** Picker order: 2 free first, then 4 pro. */
export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  { id: "minimal", tier: "free", nameKey: "dashboard.templateMinimal", descriptionKey: "dashboard.templateDescMinimal" },
  { id: "portfolio", tier: "free", nameKey: "dashboard.templatePortfolio", descriptionKey: "dashboard.templateDescPortfolio" },
  { id: "studio", tier: "pro", nameKey: "dashboard.templateStudio", descriptionKey: "dashboard.templateDescStudio" },
  { id: "edito", tier: "pro", nameKey: "dashboard.templateEdito", descriptionKey: "dashboard.templateDescEdito" },
  { id: "urban", tier: "pro", nameKey: "dashboard.templateUrban", descriptionKey: "dashboard.templateDescUrban" },
  { id: "obsidienne", tier: "pro", nameKey: "dashboard.templateObsidienne", descriptionKey: "dashboard.templateDescObsidienne" },
];

const TEMPLATE_BY_ID: Record<string, TemplateConfig> = Object.fromEntries(
  TEMPLATE_CONFIGS.map((cfg) => [cfg.id, cfg]),
);

/** Resolve a template by id; unknown/null/undefined falls back to the first (minimal). */
export function getTemplateConfig(id: string | null | undefined): TemplateConfig {
  return TEMPLATE_BY_ID[id ?? ""] ?? TEMPLATE_CONFIGS[0];
}

export function isTemplateId(value: string): value is Template {
  return value in TEMPLATE_BY_ID;
}

export function canUseTemplate(plan: Plan, id: string): boolean {
  const cfg = TEMPLATE_BY_ID[id];
  if (!cfg) return false;
  return plan === "pro" || cfg.tier === "free";
}