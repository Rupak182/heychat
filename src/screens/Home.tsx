import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Send, 
  Trash2, 
  Settings, 
  Sparkles, 
  Bot, 
  User 
} from "lucide-react";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import {
  Bubble,
  BubbleContent,
} from "@/components/ui/bubble";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

interface MessageType {
  role: "user" | "assistant";
  content: string;
}

export function Home() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const suggestions = [
    "Draft a professional reply to a project update",
    "Explain CSS Flexbox min-h-0 in simple terms",
    "Write a quick TypeScript function to fetch API data",
  ];

  const handleSend = (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isGenerating) return;

    // Add user message
    const newMessages: MessageType[] = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setInput("");
    setIsGenerating(true);

    // Simulate AI response stream
    setTimeout(() => {
      const responseText = getRandomResponse(prompt);
      let currentWordIndex = 0;
      const words = responseText.split(" ");
      
      // Initialize assistant empty message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const interval = setInterval(() => {
        if (currentWordIndex < words.length) {
          const partialText = words.slice(0, currentWordIndex + 1).join(" ");
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              last.content = partialText;
            }
            return updated;
          });
          currentWordIndex++;
        } else {
          clearInterval(interval);
          setIsGenerating(false);
        }
      }, 70);
    }, 600);
  };

  const handleClear = () => {
    setMessages([]);
    setIsGenerating(false);
  };

  // Helper response generator
  const getRandomResponse = (prompt: string): string => {
    const p = prompt.toLowerCase();

    if (p.includes("project update") || p.includes("draft")) {
      return "Here is a professional draft for your update: 'Hi Team, Thanks for the detailed update. I have reviewed the progress and everything looks solid. Let's make sure we test the dark-mode configuration thoroughly before our deployment tomorrow. Let me know if anyone needs assistance.'";
    }
    if (p.includes("flexbox") || p.includes("min-h")) {
      return "The 'min-h-0' property is critical in Flexbox systems. Flex columns default to 'min-height: auto' (the content height). Setting 'min-h-0' lets the flex child shrink below its content height, allowing overflow-y-auto to trigger a scrollbar.";
    }
    return "That's a great question! I'm your AI assistant built inside HeyChat. Ask me anything about programming, layout design, or Tauri settings.";
  };

  return (
    <div className="w-full h-full bg-background overflow-hidden flex flex-col justify-between text-foreground">
      
      {/* 1. Header Bar */}
      <div className="flex items-center justify-end px-4 py-2.5 border-b border-border/50 bg-zinc-50/80 dark:bg-zinc-900/80 shrink-0">
        {/* <div className="flex items-center gap-2 select-none">
          <MessageSquare className="size-4 text-primary" />
          <span className="text-xs font-bold tracking-wider text-foreground">
            HeyChat AI
          </span>
        </div> */}
        
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button 
              onClick={handleClear}
              className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md cursor-pointer"
              title="Clear Conversation"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
          <button 
            onClick={() => navigate("/settings")}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md cursor-pointer"
            title="Settings"
          >
            <Settings className="size-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Chat / Scroll Area */}
      <div className="flex-1 min-h-0">
        {messages.length === 0 ? (
          // Empty State Welcome Screen
          <div className="h-full flex flex-col justify-center items-center max-w-sm mx-auto text-center space-y-6 select-none">
            <div className="p-4 bg-muted/40 border border-border/60 rounded-full shadow-inner">
              <Sparkles className="size-8 text-primary animate-pulse" />
            </div>
            
            <div className="space-y-1.5">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                How can I help you today?
              </h1>
              <p className="text-xs text-muted-foreground">
                Ask a programming question, brainstorm app ideas, or try one of the suggestions below.
              </p>
            </div>

            <div className="w-full space-y-2 py-2">
              {suggestions.map((text, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(text)}
                  className="w-full text-left px-3 py-2 text-xs border border-border/45 hover:border-primary/45 rounded-xl bg-card hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground line-clamp-1 cursor-pointer shadow-sm"
                >
                  “ {text} ”
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Standard Message Scroller
          <MessageScrollerProvider>
            <MessageScroller>
              <MessageScrollerViewport className="px-4 py-6">
                <MessageScrollerContent className="max-w-md mx-auto">
                  {messages.map((msg, index) => (
                    <MessageScrollerItem key={index}>
                      <Message align={msg.role === "user" ? "end" : "start"}>
                        <MessageAvatar className="border border-border/65">
                          {msg.role === "user" ? (
                            <User className="size-4 text-muted-foreground" />
                          ) : (
                            <Bot className="size-4 text-primary" />
                          )}
                        </MessageAvatar>
                        <MessageContent>
                          <Bubble align={msg.role === "user" ? "end" : "start"} variant={msg.role === "user" ? "default" : "muted"}>
                            <BubbleContent>
                              {msg.content || (
                                <span className="flex items-center gap-1 py-1">
                                  <span className="size-1 bg-muted-foreground rounded-full animate-bounce delay-100" />
                                  <span className="size-1 bg-muted-foreground rounded-full animate-bounce delay-200" />
                                  <span className="size-1 bg-muted-foreground rounded-full animate-bounce delay-300" />
                                </span>
                              )}
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))}

                  {isGenerating && messages[messages.length - 1]?.role === "user" && (
                    <MessageScrollerItem>
                      <Message align="start">
                        <MessageAvatar className="border border-border/65">
                          <Bot className="size-4 text-primary" />
                        </MessageAvatar>
                        <MessageContent>
                          <Bubble align="start" variant="muted">
                            <BubbleContent>
                              <span className="flex items-center gap-1 py-1">
                                <span className="size-1 bg-muted-foreground rounded-full animate-bounce delay-100" />
                                <span className="size-1 bg-muted-foreground rounded-full animate-bounce delay-200" />
                                <span className="size-1 bg-muted-foreground rounded-full animate-bounce delay-300" />
                              </span>
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        )}
      </div>

      {/* 3. Input Bar */}
      <div className="p-4 border-t border-border/40 bg-zinc-50/20 dark:bg-zinc-900/20 shrink-0">
        <div className="max-w-md mx-auto">
          <InputGroup className="h-10 rounded-xl px-1 bg-background border-border shadow-xs">
            <InputGroupInput
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              disabled={isGenerating}
              className="text-xs"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                onClick={() => handleSend()}
                disabled={!input.trim() || isGenerating}
                variant="ghost"
                size="icon-sm"
                title="Send"
                className="cursor-pointer"
              >
                <Send className="size-3.5 text-muted-foreground hover:text-foreground transition-colors" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="px-4 py-2 bg-muted/20 border-t border-border/20 flex items-center justify-between text-[10px] text-muted-foreground shrink-0 select-none">
        <div>
          <span>Model: </span>
          <span className="font-semibold text-foreground/80">HeyChat Local</span>
        </div>
        <div>
          <span>Press Enter to Send</span>
        </div>
      </div>

    </div>
  );
}
