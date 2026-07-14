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
import { ArrowLeft, Info, Save, Sparkles } from "lucide-react";
import { getAIConfig, saveAIConfig, saveApiKey, getApiKey, PROVIDER_LABELS, PROVIDERS, type AIConfig } from "@/lib/ai/config";

const PROVIDER_MODELS: Record<AIConfig["provider"], string[]> = {
  google: ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-2.5-flash-lite"],
  groq: ["openai/gpt-oss-120b", "qwen/qwen3-32b"],
  openai: ["gpt-5.5", "gpt-5.4"],
  anthropic: ["claude-sonnet-4-6", "claude-opus-4-8"],
  ollama: ["llama3", "mistral"],
};



export function Settings() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  // Non-sensitive config from localStorage
  const [config, setConfig] = useState(() => getAIConfig());
  // API key loaded separately from OS keychain
  const [apiKey, setApiKey] = useState("");

  // Load the API key from the OS keychain whenever the provider changes
  useEffect(() => {
    let active = true;
    setApiKey(""); // Clear immediately to avoid displaying the previous provider's key
    getApiKey(config.provider).then((key) => {
      if (active) {
        setApiKey(key);
      }
    });
    return () => {
      active = false;
    };
  }, [config.provider]);

  const handleProviderChange = (newProvider: AIConfig["provider"]) => {
    setConfig(getAIConfig(newProvider));
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Save non-sensitive fields to localStorage
      saveAIConfig({ ...config, baseUrl: config.baseUrl?.trim() });
      // Save API key securely to OS keychain
      await saveApiKey(config.provider, apiKey.trim());
    } catch (err) {
      console.error("Failed to save AI configuration:", err);
    }

    setTimeout(() => {
      setIsSaving(false);
      navigate("/");
    }, 600);
  }, [config, apiKey, navigate]);

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
                value={config.provider} 
                onValueChange={(val) => handleProviderChange(val as AIConfig["provider"])}
              >
                <SelectTrigger className="w-48 bg-card border border-border/80 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PROVIDER_LABELS[p]}
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
                value={config.modelId} 
                onValueChange={(val) => setConfig({ ...config, modelId: val || "" })}
              >
                <SelectTrigger className="w-48 bg-card border border-border/80 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(PROVIDER_MODELS[config.provider] || []).map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* API Key (Optional for Ollama) */}
            {config.provider !== "ollama" && (
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
            {config.provider === "ollama" && (
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold block">Base URL</label>
                  <span className="text-[10px] text-muted-foreground">Ollama API endpoint address</span>
                </div>
                <Input 
                  type="text" 
                  value={config.baseUrl || ""} 
                  onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                  placeholder="http://localhost:11434/v1"
                  className="w-48 text-xs bg-card border border-border/80 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40"
                />
              </div>
            )}

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
