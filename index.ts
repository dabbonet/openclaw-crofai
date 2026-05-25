import type { ProviderResolveDynamicModelContext } from "openclaw/plugin-sdk/plugin-entry";
import {
  OPENAI_COMPATIBLE_REPLAY_HOOKS,
  cloneFirstTemplateModel,
  normalizeModelCompat,
} from "openclaw/plugin-sdk/provider-model-shared";

import { listCrofModelCatalogEntries, resolveCrofModel, CROF_DEFAULT_MODEL_REF, CROF_BASE_URL } from "./provider-catalog";
import { wrapCrofProviderStream } from "./stream";

const PROVIDER_ID = "crof";

function resolveCrofDynamicModel(ctx: ProviderResolveDynamicModelContext) {
  const modelId = ctx.modelId.trim();
  
  // Try to resolve the model from our catalog
  const resolved = resolveCrofModel(modelId);
  if (resolved) {
    return normalizeModelCompat(resolved);
  }

  // Fall back to default model if no match found
  return cloneFirstTemplateModel({
    providerId: PROVIDER_ID,
    modelId,
    templateIds: [CROF_DEFAULT_MODEL_REF.id],
    ctx,
    patch: {
      provider: PROVIDER_ID,
      reasoning: true,
      baseUrl: CROF_BASE_URL,
      api: "openai-completions",
    },
  });
}

export default {
  id: PROVIDER_ID,
  name: "Crof.ai Provider",
  description: "Bundled Crof.ai provider plugin with 21+ DeepSeek, GLM, Kimi, Qwen, and MiniMax models",
  register(api) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: "Crof.ai",
      aliases: ["crof-ai", "crof.ai"],
      docsPath: "/providers/models",
      envVars: ["CROF_API_KEY"],
      auth: [
        {
          methodId: "api-key",
          label: "Crof.ai API key",
          hint: "API key",
          optionKey: "crofApiKey",
          flagName: "--crof-api-key",
          envVar: "CROF_API_KEY",
          promptMessage: "Enter Crof.ai API key",
          defaultModel: CROF_DEFAULT_MODEL_REF,
          noteMessage: [
            "Crof.ai provides access to 21+ AI models including DeepSeek, GLM, Kimi, Qwen, and MiniMax.",
            "Get your API key at: https://crof.ai",
          ].join("\n"),
          noteTitle: "Crof.ai",
          wizard: {
            choiceId: "crof",
            choiceLabel: "Crof.ai catalog",
          },
        },
      ],
      catalog: {
        buildProvider: () => ({
          ...CROF_DEFAULT_MODEL_REF,
          provider: PROVIDER_ID,
          baseUrl: CROF_BASE_URL,
          api: "openai-completions",
          providerId: PROVIDER_ID,
        }),
        listEntries: listCrofModelCatalogEntries,
      },
      resolveDynamicModel: (ctx) => resolveCrofDynamicModel(ctx),
      wrapStreamFn: wrapCrofProviderStream,
      isModernModelRef: () => true,
    });
  },
};
