import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sliders, Shield, Info, Save } from "lucide-react";

export function Settings() {
  const navigate = useNavigate();
  const [resolution, setResolution] = useState("1080p");
  const [port, setPort] = useState(1420);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      navigate("/");
    }, 800);
  };

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
              <select 
                value={resolution} 
                onChange={(e) => setResolution(e.target.value)}
                className="bg-card border border-border/80 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer text-foreground"
              >
                <option value="1080p">1080p (60fps)</option>
                <option value="720p">720p (60fps)</option>
                <option value="480p">480p (30fps)</option>
              </select>
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
