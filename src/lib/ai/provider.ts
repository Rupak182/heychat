import { createGoogle } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { getAIConfig, getApiKey } from "./config";

export async function getModelInstance() {
  const config = getAIConfig();
  const apiKey = await getApiKey(config.provider);

  switch (config.provider) {
    case "google":
      if (!apiKey) throw new Error("Google Gemini API Key is missing.");
      return createGoogle({ apiKey, fetch: tauriFetch })(config.modelId);

    case "openai":
      if (!apiKey) throw new Error("OpenAI API Key is missing.");
      return createOpenAI({ apiKey, fetch: tauriFetch })(config.modelId);

    case "groq":
      if (!apiKey) throw new Error("Groq API Key is missing.");
      return createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey,
        fetch: tauriFetch,
      })(config.modelId);

    case "anthropic":
      if (!apiKey) throw new Error("Anthropic API Key is missing.");
      return createAnthropic({ apiKey, fetch: tauriFetch })(config.modelId);

    case "ollama":
      return createOpenAI({
        baseURL: config.baseUrl || "http://localhost:11434/v1",
        apiKey: "ollama",
        fetch: tauriFetch,
      })(config.modelId);

    default:
      return null;
  }
}
