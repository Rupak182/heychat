import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Send, 
  Trash2, 
  Settings, 
  Sparkles, 
  Bot, 
  User,
  Plus,
  Search,
  MessageSquare
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
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarInput,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface MessageType {
  role: "user" | "assistant";
  content: string;
}

interface Thread {
  id: string;
  title: string;
  messages: MessageType[];
  createdAt: number;
}

export function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize threads with a default thread
  const [threads, setThreads] = useState<Thread[]>(() => {
    const initialId = crypto.randomUUID();
    return [{ id: initialId, title: "New Chat", messages: [], createdAt: Date.now() }];
  });

  // Keep track of the currently selected thread ID
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0].id);

  // Ensure activeThreadId is always valid to prevent message dispatch mismatch
  useEffect(() => {
    const exists = threads.some((t) => t.id === activeThreadId);
    if (!exists && threads.length > 0) {
      setActiveThreadId(threads[0].id);
    }
  }, [threads, activeThreadId]);

  // Active thread helper
  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0] || {
    id: activeThreadId,
    title: "New Chat",
    messages: [] as MessageType[],
    createdAt: Date.now(),
  };

  const messages = activeThread.messages;

  const handleNewChat = () => {
    const newId = crypto.randomUUID();
    const newThread: Thread = {
      id: newId,
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);
  };

  const handleDeleteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (filtered.length === 0) {
        const initialId = crypto.randomUUID();
        return [{ id: initialId, title: "New Chat", messages: [], createdAt: Date.now() }];
      }
      return filtered;
    });
  };

  const handleSend = (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isGenerating) return;

    // Update messages in the active thread
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          const updatedMessages: MessageType[] = [...t.messages, { role: "user", content: prompt }];
          // Update title if it was default "New Chat" and this is the first message
          const newTitle = t.title === "New Chat" && t.messages.length === 0
            ? prompt.length > 25 ? prompt.substring(0, 22) + "..." : prompt
            : t.title;
          return { ...t, messages: updatedMessages, title: newTitle };
        }
        return t;
      })
    );

    setInput("");
    setIsGenerating(true);

    // Simulate AI response stream
    setTimeout(() => {
      const responseText = getRandomResponse(prompt);
      let currentWordIndex = 0;
      const words = responseText.split(" ");

      // Initialize assistant empty message in the active thread
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              messages: [...t.messages, { role: "assistant", content: "" }],
            };
          }
          return t;
        })
      );

      const interval = setInterval(() => {
        if (currentWordIndex < words.length) {
          const partialText = words.slice(0, currentWordIndex + 1).join(" ");
          setThreads((prev) =>
            prev.map((t) => {
              if (t.id === activeThreadId) {
                const updatedMessages = [...t.messages];
                const last = updatedMessages[updatedMessages.length - 1];
                if (last && last.role === "assistant") {
                  last.content = partialText;
                }
                return { ...t, messages: updatedMessages };
              }
              return t;
            })
          );
          currentWordIndex++;
        } else {
          clearInterval(interval);
          setIsGenerating(false);
        }
      }, 70);
    }, 600);
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

  const suggestions = [
    "Draft a professional reply to a project update",
    "Explain CSS Flexbox min-h-0 in simple terms",
    "Write a quick TypeScript function to fetch API data",
  ];

  // Filter threads for search
  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group threads by date
  const groupThreads = (threadsList: Thread[]) => {
    const groups: { [key: string]: Thread[] } = {
      "Today": [],
      "Yesterday": [],
      "Last Week": [],
      "Older": [],
    };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOfSevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;

    threadsList.forEach((t) => {
      if (t.createdAt >= startOfToday) {
        groups["Today"].push(t);
      } else if (t.createdAt >= startOfYesterday) {
        groups["Yesterday"].push(t);
      } else if (t.createdAt >= startOfSevenDaysAgo) {
        groups["Last Week"].push(t);
      } else {
        groups["Older"].push(t);
      }
    });

    return groups;
  };

  const grouped = groupThreads(filteredThreads);

  return (
    <TooltipProvider>
      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        
        {/* Sidebar Component */}
        <Sidebar className="border-r border-border/40">
          <SidebarHeader className="border-b border-border/20 p-2">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 size-3.5 text-muted-foreground/75" />
              <SidebarInput 
                placeholder="Search Chats..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            {Object.entries(grouped).map(([groupName, list]) => {
              if (list.length === 0) return null;
              return (
                <SidebarGroup key={groupName} className="p-0 mb-4">
                  <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground/65 px-2 uppercase tracking-wider mb-1 select-none">
                    {groupName}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-0.5">
                      {list.map((t) => {
                        const isActive = t.id === activeThreadId;
                        return (
                          <SidebarMenuItem key={t.id}>
                            <SidebarMenuButton
                              isActive={isActive}
                              onClick={() => setActiveThreadId(t.id)}
                              className="w-full cursor-pointer text-xs"
                            >
                              <MessageSquare />
                              <span className="truncate">{t.title}</span>
                            </SidebarMenuButton>
                            <SidebarMenuAction
                              showOnHover
                              onClick={(e) => handleDeleteThread(t.id, e)}
                              className="hover:text-destructive cursor-pointer"
                              title="Delete Chat"
                            >
                              <Trash2 />
                            </SidebarMenuAction>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            })}
          </SidebarContent>
        </Sidebar>

        {/* Main Chat Panel Viewport */}
        <SidebarInset className="flex-1 min-w-0 flex flex-col justify-between bg-background">
          
          {/* Top Unified Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-background/95 backdrop-blur shrink-0 select-none z-10">
            <div className="flex items-center gap-2.5">
              <SidebarTrigger />
              <span className="text-xs font-semibold text-foreground/85 truncate max-w-[200px]">
                {activeThread.title}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleNewChat}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 p-1.5 rounded-md transition-all cursor-pointer"
                title="New Chat"
              >
                <Plus className="size-4" />
              </button>
              <button 
                onClick={() => navigate("/settings")}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 p-1.5 rounded-md transition-all cursor-pointer"
                title="Settings"
              >
                <Settings className="size-4" />
              </button>
            </div>
          </div>

          {/* Chat viewport */}
          <div className="flex-1 min-h-0 bg-background">
            {messages.length === 0 ? (
              // Empty State Welcome Screen
              <div className="h-full flex flex-col justify-center items-center max-w-sm mx-auto text-center space-y-6 select-none p-4">
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

          {/* Input Bar */}
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

          {/* Footer */}
          <div className="px-4 py-2 bg-muted/20 border-t border-border/20 flex items-center justify-between text-[10px] text-muted-foreground shrink-0 select-none">
            <div>
              <span>Model: </span>
              <span className="font-semibold text-foreground/80">HeyChat Local</span>
            </div>
            <div>
              <span>Press Enter to Send</span>
            </div>
          </div>

        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
