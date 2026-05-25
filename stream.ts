import type { ProviderWrapStreamFnContext } from "openclaw/plugin-sdk/plugin-entry";

/**
 * Crof.ai uses an OpenAI-compatible API but does NOT support the
 * `reasoning_effort` parameter that OpenClaw typically sends for
 * reasoning models. This wrapper strips those params before sending
 * the request to Crof.ai.
 */
function stripReasoningParams(payloadObj: Record<string, unknown>): void {
  delete payloadObj.reasoning_effort;
  delete payloadObj.reasoningEffort;
}

/**
 * Wraps the base stream function to strip reasoning params that
 * Crof.ai doesn't support in its OpenAI-compatible API.
 */
export function wrapCrofProviderStream(
  baseStreamFn: ProviderWrapStreamFnContext["streamFn"],
): ProviderWrapStreamFnContext["streamFn"] | undefined {
  if (!baseStreamFn) {
    return undefined;
  }

  const underlying = baseStreamFn;
  return (model, context, options) => {
    if (model.provider !== "crof") {
      return underlying(model, context, options);
    }

    // Strip reasoning_effort from the payload before sending to Crof.ai
    return streamWithPayloadPatch(underlying, model, context, options, stripReasoningParams);
  };
}

/**
 * Patches the payload before sending to the underlying stream function.
 */
async function streamWithPayloadPatch(
  baseStreamFn: ProviderWrapStreamFnContext["streamFn"],
  model: Parameters<ProviderWrapStreamFnContext["streamFn"]>[0],
  context: Parameters<ProviderWrapStreamFnContext["streamFn"]>[1],
  options: Parameters<ProviderWrapStreamFnContext["streamFn"]>[2],
  patchFn: (payloadObj: Record<string, unknown>) => void,
): ReturnType<ProviderWrapStreamFnContext["streamFn"]> {
  const patchedOptions = options
    ? {
        ...options,
        onPayload: options.onPayload
          ? async (payload: unknown, mdl: unknown) => {
              const result = await options.onPayload!(payload, mdl);
              if (result && typeof result === "object") {
                patchFn(result as Record<string, unknown>);
              }
              return result;
            }
          : async (payload: unknown, _mdl: unknown) => {
              if (payload && typeof payload === "object") {
                patchFn(payload as Record<string, unknown>);
              }
              return payload;
            },
      }
    : undefined;

  return baseStreamFn(model, context, patchedOptions ?? undefined);
}
