import { z } from "zod";

export const aiConfigSchema = z.object({
  provider: z.enum(["google", "openai", "groq", "anthropic", "ollama"]),
  apiKey: z.string().default(""),
  modelId: z.string().min(1, "Model ID is required"),
  baseUrl: z.string().url().optional(),
});

export type AIConfig = z.infer<typeof aiConfigSchema>;

const PROVIDER_DEFAULT_MODELS: Record<AIConfig["provider"], string> = {
  google: "gemini-2.5-flash",
  openai: "gpt-4o",
  groq: "qwen/qwen3-32b",
  anthropic: "claude-sonnet-4-5",
  ollama: "llama3",
};

/**
 * Returns the saved AI config.
 * Pass an explicit `provider` to load the config for a specific provider
 * (e.g. when switching providers in Settings before saving).
 */
export function getAIConfig(provider?: AIConfig["provider"]): AIConfig {
  const activeProvider = (
    provider ?? localStorage.getItem("ai_provider") ?? "google"
  ) as AIConfig["provider"];

  const rawConfig = {
    provider: activeProvider,
    apiKey: localStorage.getItem(`ai_api_key_${activeProvider}`) ?? "",
    modelId:
      localStorage.getItem(`ai_model_id_${activeProvider}`) ??
      PROVIDER_DEFAULT_MODELS[activeProvider],
    baseUrl:
      localStorage.getItem(`ai_base_url_${activeProvider}`) || undefined,
  };

  const parsed = aiConfigSchema.safeParse(rawConfig);
  if (!parsed.success) {
    return {
      provider: "google",
      apiKey: "",
      modelId: PROVIDER_DEFAULT_MODELS["google"],
    };
  }

  return parsed.data;
}

/** Saves the config, scoping apiKey, modelId and baseUrl to the given provider. */
export function saveAIConfig(config: Partial<AIConfig> & { provider: AIConfig["provider"] }) {
  localStorage.setItem("ai_provider", config.provider);
  if (config.apiKey !== undefined) {
    localStorage.setItem(`ai_api_key_${config.provider}`, config.apiKey);
  }
  if (config.modelId) {
    localStorage.setItem(`ai_model_id_${config.provider}`, config.modelId);
  }
  if (config.baseUrl !== undefined) {
    if (config.baseUrl.trim()) {
      localStorage.setItem(`ai_base_url_${config.provider}`, config.baseUrl.trim());
    } else {
      localStorage.removeItem(`ai_base_url_${config.provider}`);
    }
  }
}
