import { createGoogle } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { getAIConfig } from "./config";

export function getModelInstance() {
  const config = getAIConfig();

  switch (config.provider) {
    case "google":
      if (!config.apiKey) throw new Error("Google Gemini API Key is missing.");
      const google = createGoogle({ 
        apiKey: config.apiKey,
        fetch: tauriFetch
      });
      return google(config.modelId);

    case "openai":
      if (!config.apiKey) throw new Error("OpenAI API Key is missing.");
      const openai = createOpenAI({ 
        apiKey: config.apiKey,
        fetch: tauriFetch
      });
      return openai(config.modelId);

    case "groq":
      if (!config.apiKey) throw new Error("Groq API Key is missing.");
      const groq = createOpenAI({ 
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: config.apiKey,
        fetch: tauriFetch
      });
      return groq(config.modelId);

    case "anthropic":
      if (!config.apiKey) throw new Error("Anthropic API Key is missing.");
      const anthropic = createAnthropic({ 
        apiKey: config.apiKey,
        fetch: tauriFetch
      });
      return anthropic(config.modelId);

    case "ollama":
      const customOpenAI = createOpenAI({
        baseURL: config.baseUrl || "http://localhost:11434/v1",
        apiKey: "ollama",
        fetch: tauriFetch
      });
      return customOpenAI(config.modelId);

    default:
      return null;
  }
}
