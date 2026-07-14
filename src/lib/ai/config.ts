import { z } from "zod";
import { invoke } from "@tauri-apps/api/core";

export const aiConfigSchema = z.object({
  provider: z.enum(["openai-compatible", "google", "openai", "groq", "anthropic", "ollama"]),
  apiKey: z.string().default(""),
  modelId: z.string().default(""),
  baseUrl: z.string().url().optional(),
});

export type AIConfig = z.infer<typeof aiConfigSchema>;

export const PROVIDERS = aiConfigSchema.shape.provider.options;

const PROVIDER_DEFAULT_MODELS: Record<AIConfig["provider"], string> = {
  google: "gemini-2.5-flash",
  openai: "gpt-5.5",
  groq: "qwen/qwen3-32b",
  anthropic: "claude-opus-4-8",
  ollama: "llama3",
  "openai-compatible": "",
};

export const PROVIDER_LABELS: Record<AIConfig["provider"], string> = {
  google: "Google Gemini",
  openai: "OpenAI",
  groq: "Groq",
  anthropic: "Anthropic",
  ollama: "Ollama",
  "openai-compatible": "OpenAI Compatible",
};

// ── Secure keyring helpers (async) ──────────────────────────────────────────

/** Saves the API key for a provider into the OS keychain. */
export async function saveApiKey(provider: AIConfig["provider"], apiKey: string): Promise<void> {
  await invoke<void>("save_api_key", { provider, apiKey });
}

/** Retrieves the API key for a provider from the OS keychain. Returns "" if not set. */
export async function getApiKey(provider: AIConfig["provider"]): Promise<string> {
  try {
    return await invoke<string>("get_api_key", { provider });
  } catch {
    return "";
  }
}

// ── Non-sensitive config (localStorage) ─────────────────────────────────────

/**
 * Returns the saved non-sensitive AI config (provider, modelId, baseUrl).
 * Pass an explicit `provider` to load the config for a specific provider
 * (e.g. when switching providers in Settings before saving).
 * NOTE: apiKey is always "" here — load it separately with getApiKey().
 */
export function getAIConfig(provider?: AIConfig["provider"]): Omit<AIConfig, "apiKey"> & { apiKey: "" } {
  const activeProvider = (
    provider ?? localStorage.getItem("ai_provider") ?? "google"
  ) as AIConfig["provider"];

  const rawConfig = {
    provider: activeProvider,
    apiKey: "",
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

  return { ...parsed.data, apiKey: "" };
}

/** Saves non-sensitive config (provider, modelId, baseUrl) to localStorage.
 *  Call saveApiKey() separately to persist the API key securely. */
export function saveAIConfig(config: Partial<Omit<AIConfig, "apiKey">> & { provider: AIConfig["provider"] }) {
  localStorage.setItem("ai_provider", config.provider);
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
