# Crof.ai Provider for OpenClaw

A provider plugin for OpenClaw that integrates with Crof.ai's OpenAI-compatible API, providing access to 21+ models including DeepSeek V4, GLM, Kimi, Qwen, and MiniMax.

## Features

- **21+ Models**: Access to DeepSeek, GLM, Kimi, Qwen, and MiniMax models
- **OpenAI-Compatible API**: Uses Crof.ai's `https://crof.ai/v1` endpoint
- **Automatic Model Selection**: Smart model routing based on capabilities
- **Streaming Support**: Full streaming support with automatic context management
- **Reasoning Models**: Support for DeepSeek V4 with reasoning capabilities

## Available Models

### DeepSeek Models
- `deepseek-v4-pro`: DeepSeek V4 Pro (1M context, 131K tokens)
- `deepseek-v4-pro-precision`: DeepSeek V4 Pro Precision (1M context, 131K tokens)
- `deepseek-v4-flash`: DeepSeek V4 Flash (1M context, 131K tokens)
- `deepseek-v3.2`: DeepSeek V3.2 (164K context, 164K tokens)

### GLM Models
- `glm-5.1`: GLM 5.1 (203K context, 203K tokens)
- `glm-5.1-precision`: GLM 5.1 Precision (203K context, 203K tokens)
- `glm-5`: GLM 5 (203K context, 203K tokens)
- `glm-4.7`: GLM 4.7 (203K context, 203K tokens)
- `glm-4.7-flash`: GLM 4.7 Flash (202K context, 131K tokens)

### Kimi Models
- `kimi-k2.6`: Kimi K2.6 (262K context, 262K tokens)
- `kimi-k2.6-precision`: Kimi K2.6 Precision (262K context, 262K tokens)
- `kimi-k2.5`: Kimi K2.5 (262K context, 262K tokens)
- `kimi-k2.5-lightning`: Kimi K2.5 Lightning (131K context, 32K tokens)

### Qwen Models
- `qwen3.6-27b`: Qwen3.6 27B (262K context, 262K tokens)
- `qwen3.5-397b-a17b`: Qwen3.5 397B A17B (262K context, 262K tokens)
- `qwen3.5-9b`: Qwen3.5 9B (262K context, 262K tokens)

### MiMo Models
- `mimo-v2.5-pro`: MiMo V2.5 Pro (1M context, 131K tokens)
- `mimo-v2.5-pro-precision`: MiMo V2.5 Pro Precision (1M context, 131K tokens)

### Other Models
- `greg`: Greg experiment (229K context, 229K tokens)
- `minimax-m2.5`: MiniMax M2.5 (205K context, 131K tokens)
- `gemma-4-31b-it`: Gemma 4 31B (262K context, 262K tokens)

## Usage

### In openclaw.json

```json
{
  "models": {
    "providers": {
      "crof": {
        "baseUrl": "https://crof.ai/v1",
        "apiKey": "your_crof_api_key_here",
        "api": "openai-completions",
        "models": [
          {
            "id": "deepseek-v4-pro",
            "name": "DeepSeek V4 Pro",
            "reasoning": true,
            "contextWindow": 1000000,
            "maxTokens": 131072,
            "cost": {
              "input": 0.30,
              "output": 0.50,
              "cacheRead": 0.003
            }
          }
        ]
      }
    }
  }
}
```

### In Agent Configuration

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "crof/deepseek-v4-pro",
        "fallbacks": ["crof/glm-5.1"]
      }
    }
  }
}
```

## Notes

1. **reasoning_effort Parameter**: Crof.ai's OpenAI-compatible API does not support the `reasoning_effort` parameter. This extension automatically strips this parameter before sending requests to Crof.ai.

2. **API Key Management**: Store your Crof.ai API key securely using environment variables or OpenClaw's secret management.

3. **Model Selection**: The extension supports all 21+ models from Crof.ai's catalog. Use the model ID directly in your agent configuration.

## Installation

This extension is bundled with OpenClaw. It will be automatically loaded when OpenClaw starts.

## Testing

To test the extension:

```bash
cd /Users/ahmed/Documents/openclaw-vps
npm run build
```

Then copy to VPS:

```bash
docker cp openclaw-crof/ fincy:/home/ubuntu/openclaw-crof/
```

## License

MIT
