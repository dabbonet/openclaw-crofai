import type { StreamFn } from "@mariozechner/pi-agent-core";
import type { ProviderWrapStreamFnContext } from "openclaw/plugin-sdk/plugin-entry";

const RETRY_INSTRUCTION =
  "The previous assistant turn recorded reasoning but did not produce a user-visible answer. Continue from that partial turn and produce the visible answer now. Do not restate the reasoning or restart from scratch.";

function isEmptyAssistantMessage(message: unknown): boolean {
  if (!message || typeof message !== "object") return true;

  const msg = message as Record<string, unknown>;

  // Has tool calls? Not empty.
  if (Array.isArray(msg.toolCalls) && msg.toolCalls.length > 0) return false;

  // Check content blocks
  const content = msg.content;
  if (Array.isArray(content)) {
    if (content.length === 0) return true;
    const hasVisible = content.some((block: unknown) => {
      if (!block || typeof block !== "object") return false;
      const b = block as Record<string, unknown>;
      if (b.type === "text" && typeof b.text === "string" && b.text.trim().length > 0) {
        return true;
      }
      if (b.type === "toolCall") return true;
      return false;
    });
    return !hasVisible;
  }

  // Has raw text?
  if (typeof msg.text === "string" && msg.text.trim().length > 0) return false;

  return true;
}

function createReplayStream(chunks: unknown[], message: unknown): any {
  let index = 0;
  return {
    async *[Symbol.asyncIterator]() {
      while (index < chunks.length) {
        yield chunks[index++];
      }
    },
    async result() {
      return message;
    },
  };
}

async function executeWithRetry(
  baseStreamFn: StreamFn,
  model: Parameters<StreamFn>[0],
  context: Parameters<StreamFn>[1],
  options: Parameters<StreamFn>[2],
  attemptCount: number,
): Promise<any> {
  const maxRetries = 3;

  // Create stream
  let stream = baseStreamFn(model, context, options);
  if (stream && typeof stream === "object" && "then" in stream) {
    stream = await stream;
  }
  if (!stream || typeof stream !== "object") return stream;

  // Buffer all chunks and convert thinking blocks to visible text
  const chunks: unknown[] = [];
  try {
    for await (const chunk of stream) {
      // Convert thinking blocks to visible text blocks with marker
      if (Array.isArray(chunk) && chunk.length > 0) {
        const convertedChunk = chunk.map((block) => {
          if (!block || typeof block !== "object") return block;
          const record = block as Record<string, unknown>;
          if (record.type === "thinking" && record.thinking && typeof record.thinking === "string") {
            // Convert thinking block to text block with emoji marker
            return {
              type: "text",
              text: `💭 ${record.thinking.trim()}`,
            };
          }
          return block;
        });
        chunks.push(convertedChunk);
      } else {
        chunks.push(chunk);
      }
    }
  } catch {
    // Stream error — return replay of what we got so far
    const result = await stream.result().catch(() => null);
    return createReplayStream(chunks, result);
  }

  // Get final message
  const message = await stream.result();

  // Check if empty
  if (!isEmptyAssistantMessage(message) || attemptCount >= maxRetries) {
    return createReplayStream(chunks, message);
  }

  // Retry with continuation instruction
  const patchedContext = {
    ...context,
    systemPrompt: context.systemPrompt
      ? `${context.systemPrompt}\n\n${RETRY_INSTRUCTION}`
      : RETRY_INSTRUCTION,
  };

  return executeWithRetry(baseStreamFn, model, patchedContext, options, attemptCount + 1);
}

export function wrapCrofProviderStream(
  ctx: ProviderWrapStreamFnContext,
): ProviderWrapStreamFnContext["streamFn"] | undefined {
  if (!ctx.streamFn) return undefined;
  const baseStreamFn = ctx.streamFn;

  return (model, context, options) => {
    if (model.provider !== "crof") {
      return baseStreamFn(model, context, options);
    }

    // Wrap the stream to convert thinking blocks to visible text blocks
    // This enables Discord to render the thinking process instead of just the final answer
    return executeWithRetry(baseStreamFn, model, context, options, 0);
  };
}
