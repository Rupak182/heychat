import { useState, useEffect, useRef } from "react";
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

import { initDb } from "@/db/client";
import {
  getThreadsList,
  getThreadMessages,
  insertThread,
  insertMessage,
  deleteThreadCascade,
} from "@/db/queries";

interface MessageType {
  id: string;
  threadId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

interface Thread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}


// Static mock data — defined outside the component so they don't re-create on every render
const SUGGESTIONS = [
  "Draft a professional reply to a project update",
  "Explain CSS Flexbox min-h-0 in simple terms",
  "Write a quick TypeScript function to fetch API data",
];

function getRandomResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("project update") || p.includes("draft")) {
    return "Here is a professional draft for your update: 'Hi Team, Thanks for the detailed update. I have reviewed the progress and everything looks solid. Let's make sure we test the dark-mode configuration thoroughly before our deployment tomorrow. Let me know if anyone needs assistance.'";
  }
  if (p.includes("flexbox") || p.includes("min-h")) {
    return "The 'min-h-0' property is critical in Flexbox systems. Flex columns default to 'min-height: auto' (the content height). Setting 'min-h-0' lets the flex child shrink below its content height, allowing overflow-y-auto to trigger a scrollbar.";
  }
  return "That's a great question! I'm your AI assistant built inside HeyChat. Ask me anything about programming, layout design, or Tauri settings.";
}

export function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);

  const activeThreadIdRef = useRef(activeThreadId);
  activeThreadIdRef.current = activeThreadId;

  const handleNewChat = () => {
    setActiveThreadId("");
  };

  // Initialize DB and load threads
  useEffect(() => {
    async function loadDbAndThreads() {
      try {
        await initDb();
        const threadsList = await getThreadsList();
        setThreads(threadsList);
      } catch (err: any) {
        console.error("Failed to load database:", err);
        setDbError(err?.message || String(err));
      } finally {
        // Show the window only after the theme and DB are ready
        try {
          const { getCurrentWindow } = await import("@tauri-apps/api/window");
          await getCurrentWindow().show();
        } catch {}
      }
    }
    loadDbAndThreads();
  }, []);


  // Load messages whenever activeThreadId changes
  useEffect(() => {
    // Immediately clear messages to prevent old thread message flash
    setMessages([]);

    if (!activeThreadId) return;

    let active = true;
    async function loadMessages() {
      try {
        const threadMsgs = await getThreadMessages(activeThreadId);
        if (active) {
          setMessages(threadMsgs);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    }
    loadMessages();

    return () => {
      active = false;
    };
  }, [activeThreadId]);

  const activeThreadTitle = threads.find((t) => t.id === activeThreadId)?.title || "New Chat";

  const handleDeleteThread = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteThreadCascade(id);
      const threadsList = await getThreadsList();
      setThreads(threadsList);
      if (activeThreadId === id) {
        setActiveThreadId("");
      }
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isGenerating) return;

    setInput("");
    setIsGenerating(true);

    let targetThreadId = activeThreadId;

    try {
      // 1. If no thread is active, create one directly with a title from the user prompt
      const isNewChat = !targetThreadId;
      if (isNewChat) {
        targetThreadId = crypto.randomUUID();
        const threadTitle = prompt.length > 25 ? prompt.substring(0, 22) + "..." : prompt;
        await insertThread(targetThreadId, threadTitle);
        const freshList = await getThreadsList();
        setThreads(freshList);
        setActiveThreadId(targetThreadId);
      }

      // 2. Insert user message in database
      const userMsgId = crypto.randomUUID();
      await insertMessage(userMsgId, targetThreadId, "user", prompt);

      // 3. Refresh messages state
      const freshMsgs = await getThreadMessages(targetThreadId);
      setMessages(freshMsgs);

      // Add a temporary streaming message immediately
      if (activeThreadIdRef.current === targetThreadId) {
        setMessages((prev) => [
          ...prev,
          {
            id: "streaming-temp",
            threadId: targetThreadId,
            role: "assistant",
            content: "",
            createdAt: Date.now(),
          },
        ]);
      }

      const responseText = getRandomResponse(prompt);
      let currentWordIndex = 0;
      const words = responseText.split(" ");

      const interval = setInterval(() => {
        if (currentWordIndex < words.length) {
          // If user switched away, abandon this stream entirely
          if (activeThreadIdRef.current !== targetThreadId) {
            clearInterval(interval);
            setIsGenerating(false);
            return;
          }
          const partialText = words.slice(0, currentWordIndex + 1).join(" ");
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === "streaming-temp" ? { ...msg, content: partialText } : msg
            )
          );
          currentWordIndex++;
        } else {
          clearInterval(interval);
          setIsGenerating(false);

          // Stream finished. Insert actual assistant message in the DB
          const assistantMsgId = crypto.randomUUID();
          insertMessage(assistantMsgId, targetThreadId, "assistant", responseText)
            .then(async () => {
              if (activeThreadIdRef.current === targetThreadId) {
                // Reload final messages from database to replace temp streaming state
                const finalMsgs = await getThreadMessages(targetThreadId);
                setMessages(finalMsgs);
              }
            })
            .catch((err) => {
              console.error("Failed to save assistant message:", err);
              // Remove the temp streaming message to avoid stale UI
              setMessages((prev) => prev.filter((msg) => msg.id !== "streaming-temp"));
            });
        }
      }, 70);
    } catch (err) {
      console.error("Failed to send message:", err);
      setIsGenerating(false);
    }
  };

  // Filter and group threads for sidebar
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
      if (t.updatedAt >= startOfToday) {
        groups["Today"].push(t);
      } else if (t.updatedAt >= startOfYesterday) {
        groups["Yesterday"].push(t);
      } else if (t.updatedAt >= startOfSevenDaysAgo) {
        groups["Last Week"].push(t);
      } else {
        groups["Older"].push(t);
      }
    });


    return groups;
  };

  const grouped = groupThreads(filteredThreads);

  if (dbError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-xs text-destructive select-none p-4 text-center">
        <div className="flex flex-col items-center gap-2 max-w-sm">
          <span className="font-bold text-sm">Database Error</span>
          <span className="text-[11px] opacity-80">Failed to initialize SQLite: {dbError}</span>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded-md text-[10px] cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


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
                {activeThreadTitle}
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
            {!activeThreadId ? (
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
                  {SUGGESTIONS.map((text, idx) => (
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
