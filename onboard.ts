import { CROF_DEFAULT_MODEL_REF } from "./provider-catalog";

/**
 * Apply Crof.ai configuration to provider config.
 * This function normalizes the base URL and applies Crof-specific settings.
 */
export function applyCrofConfig(cfg: { baseUrl?: string; api?: string; apiKey?: string }): {
  baseUrl?: string;
  api?: string;
  apiKey?: string;
} {
  // Normalize base URL to Crof.ai's endpoint
  const normalizedBaseUrl = (cfg.baseUrl ?? "").trim().replace(/\/+$/, "");
  if (normalizedBaseUrl && normalizedBaseUrl !== "https://crof.ai/v1") {
    return {
      ...cfg,
      baseUrl: "https://crof.ai/v1",
    };
  }
  
  // Apply default model reference
  return {
    ...cfg,
    ...CROF_DEFAULT_MODEL_REF,
    provider: "crof",
  };
}

export const CROF_DEFAULT_MODEL_REF = CROF_DEFAULT_MODEL_REF;
