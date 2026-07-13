import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Sliders, Shield, Info, Save, Sparkles } from "lucide-react";
import { getAIConfig, saveAIConfig, type AIConfig } from "@/lib/ai/config";

const PROVIDER_MODELS: Record<AIConfig["provider"], string[]> = {
  google: ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-2.5-flash-lite"],
  groq: ["openai/gpt-oss-120b", "qwen/qwen3-32b"],
  openai: ["gpt-5.5", "gpt-5.4"],
  anthropic: ["claude-sonnet-4-6", "claude-opus-4-8"],
  ollama: ["llama3", "mistral"],
};

const PROVIDER_OPTIONS = [
  { label: "Google Gemini", value: "google" },
  { label: "OpenAI", value: "openai" },
  { label: "Groq", value: "groq" },
  { label: "Anthropic", value: "anthropic" },
  { label: "Ollama (Local)", value: "ollama" },
];

const RESOLUTION_OPTIONS = [
  { label: "1080p (60fps)", value: "1080p" },
  { label: "720p (60fps)", value: "720p" },
  { label: "480p (30fps)", value: "480p" },
];

export function Settings() {
  const navigate = useNavigate();
  const [resolution, setResolution] = useState("1080p");
  const [port, setPort] = useState(1420);
  const [isSaving, setIsSaving] = useState(false);

  // AI Configuration State
  const [provider, setProvider] = useState<AIConfig["provider"]>("google");
  const [modelId, setModelId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  const modelItems = (PROVIDER_MODELS[provider] || []).map((model) => ({ label: model, value: model }));

  // Load existing configuration on mount
  useEffect(() => {
    const config = getAIConfig();
    setProvider(config.provider);
    setModelId(config.modelId);
    setApiKey(config.apiKey || "");
    setBaseUrl(config.baseUrl || "");
  }, []);

  const handleProviderChange = (newProvider: AIConfig["provider"]) => {
    const saved = getAIConfig(newProvider);
    setProvider(newProvider);
    setModelId(saved.modelId);
    setApiKey(saved.apiKey);
    setBaseUrl(saved.baseUrl ?? "");
  };

  const handleSave = useCallback(() => {
    setIsSaving(true);
    try {
      saveAIConfig({
        provider,
        modelId,
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim(),
      });
    } catch (err) {
      console.error("Failed to save AI configuration:", err);
    }

    setTimeout(() => {
      setIsSaving(false);
      navigate("/");
    }, 600);
  }, [provider, modelId, apiKey, baseUrl, navigate]);

  return (
    <div className="w-full h-full bg-background overflow-hidden flex flex-col justify-between text-foreground">
      
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-zinc-50/80 dark:bg-zinc-900/80 shrink-0">
        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase py-1 select-none">
          HeyChat Settings
        </span>

        {/* Right Back button (Fully Clickable) */}
        <button 
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md cursor-pointer shrink-0"
          title="Back to Home"
        >
          <ArrowLeft className="size-4" />
        </button>
      </div>

      {/* 2. Main Content */}
      <div className="flex-1 min-h-0 p-6 space-y-6 overflow-y-auto">
        
        {/* AI Configuration Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="size-3.5 text-primary" /> AI Engine Configuration
          </h2>
          <div className="grid gap-4 rounded-xl border border-border/45 bg-muted/10 p-4">
            
            {/* Provider Selection */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold block">AI Provider</label>
                <span className="text-[10px] text-muted-foreground">Select AI provider or LLM service</span>
              </div>
              <Select 
                items={PROVIDER_OPTIONS}
                value={provider} 
                onValueChange={(val) => handleProviderChange(val as AIConfig["provider"])}
              >
                <SelectTrigger className="w-48 bg-card border border-border/80 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PROVIDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Model ID select list */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold block">Model ID</label>
                <span className="text-[10px] text-muted-foreground">Select the target LLM model</span>
              </div>
              <Select 
                items={modelItems}
                value={modelId} 
                onValueChange={(val) => setModelId(val as string)}
              >
                <SelectTrigger className="w-48 bg-card border border-border/80 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {modelItems.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* API Key (Optional for Ollama) */}
            {provider !== "ollama" && (
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold block">API Key</label>
                  <span className="text-[10px] text-muted-foreground">Paste your API access token</span>
                </div>
                <Input 
                  type="password" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="API Key"
                  className="w-48 text-xs bg-card border border-border/80 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40"
                />
              </div>
            )}

            {/* Base URL (Only for Ollama) */}
            {provider === "ollama" && (
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold block">Base URL</label>
                  <span className="text-[10px] text-muted-foreground">Ollama API endpoint address</span>
                </div>
                <Input 
                  type="text" 
                  value={baseUrl} 
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434/v1"
                  className="w-48 text-xs bg-card border border-border/80 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40"
                />
              </div>
            )}

          </div>
        </div>

        {/* Quality Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Sliders className="size-3.5" /> Quality & Streaming
          </h2>
          <div className="grid gap-3 rounded-xl border border-border/45 bg-muted/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold block">Default Resolution</label>
                <span className="text-[10px] text-muted-foreground">Adjust casting video stream quality</span>
              </div>
              <Select 
                items={RESOLUTION_OPTIONS}
                value={resolution} 
                onValueChange={(val) => setResolution(val as string)}
              >
                <SelectTrigger className="w-48 bg-card border border-border/80 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {RESOLUTION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Network Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Shield className="size-3.5" /> Security & Connection
          </h2>
          <div className="grid gap-3 rounded-xl border border-border/45 bg-muted/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold block">Discovery Port</label>
                <span className="text-[10px] text-muted-foreground">Local scanning network port</span>
              </div>
              <input 
                type="number" 
                value={port} 
                onChange={(e) => setPort(Number(e.target.value))}
                className="w-20 bg-card border border-border/80 rounded-lg px-2 py-1 text-xs text-right outline-none focus:ring-1 focus:ring-primary/40 text-foreground"
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Info className="size-3.5" /> About System
          </h2>
          <div className="grid gap-3 rounded-xl border border-border/45 bg-muted/10 p-4 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>App Version</span>
              <span className="font-semibold text-foreground">v0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span>Tauri Version</span>
              <span className="font-semibold text-foreground">v2.0.0</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Footer */}
      <div className="px-4 py-2.5 bg-muted/40 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground shrink-0">
        <Button 
          variant="ghost" 
          size="xs"
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground gap-1"
        >
          <ArrowLeft className="size-3" />
          <span>Back</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="xs"
            onClick={handleSave}
            className="gap-1.5"
            disabled={isSaving}
          >
            <Save className={`size-3 ${isSaving ? "animate-spin" : ""}`} />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </Button>
          <span className="text-border">|</span>
          <div className="flex items-center gap-0.5 text-muted-foreground/80">
            <span>Apply</span>
            <span className="font-mono bg-muted border border-border/80 px-1 py-0.2 rounded text-[10px] shadow-sm ml-1">↵</span>
          </div>
        </div>
      </div>

    </div>
  );
}
