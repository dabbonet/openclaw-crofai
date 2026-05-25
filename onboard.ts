import {
  applyAgentDefaultModelPrimary,
  applyProviderConfigWithModelCatalog,
  type OpenClawConfig,
} from "openclaw/plugin-sdk/provider-onboard";
import { buildCrofModelDefinition, CROF_BASE_URL, CROF_MODEL_CATALOG } from "./provider-catalog.js";

export const CROF_DEFAULT_MODEL_REF = "crof/deepseek-v4-pro";

export function applyCrofProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[CROF_DEFAULT_MODEL_REF] = {
    ...models[CROF_DEFAULT_MODEL_REF],
    alias: models[CROF_DEFAULT_MODEL_REF]?.alias ?? "Crof",
  };

  return applyProviderConfigWithModelCatalog(cfg, {
    agentModels: models,
    providerId: "crof",
    api: "openai-completions",
    baseUrl: CROF_BASE_URL,
    catalogModels: CROF_MODEL_CATALOG.map(buildCrofModelDefinition),
  });
}

export function applyCrofConfig(cfg: OpenClawConfig): OpenClawConfig {
  return applyAgentDefaultModelPrimary(
    applyCrofProviderConfig(cfg),
    CROF_DEFAULT_MODEL_REF,
  );
}
