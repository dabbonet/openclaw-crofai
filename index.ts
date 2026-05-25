import { defineSingleProviderPluginEntry } from "openclaw/plugin-sdk/provider-entry";
import { applyCrofConfig, CROF_DEFAULT_MODEL_REF } from "./onboard.js";
import { buildCrofProvider } from "./provider-catalog.js";
import { wrapCrofProviderStream } from "./stream.js";

const PROVIDER_ID = "crof";

export default defineSingleProviderPluginEntry({
  id: PROVIDER_ID,
  name: "Crof.ai Provider",
  description: "Bundled Crof.ai provider plugin with 21+ DeepSeek, GLM, Kimi, Qwen, and MiniMax models",
  provider: {
    label: "Crof.ai",
    docsPath: "/providers/models",
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
        applyConfig: (cfg) => applyCrofConfig(cfg),
        wizard: {
          choiceId: "crof",
          choiceLabel: "Crof.ai catalog",
        },
      },
    ],
    catalog: {
      buildProvider: buildCrofProvider,
    },
    wrapStreamFn: wrapCrofProviderStream,
    resolveThinkingProfile: () => ({
      levels: [
        { id: "off", label: "off" },
        { id: "low", label: "low" },
        { id: "medium", label: "medium" },
        { id: "high", label: "high" },
      ],
      defaultLevel: "high",
    }),
  },
});
