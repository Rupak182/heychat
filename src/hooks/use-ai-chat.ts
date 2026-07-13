import { useChat, type UIMessage } from "@ai-sdk/react";
import { streamText, DefaultChatTransport, toUIMessageStream, createUIMessageStreamResponse, convertToModelMessages, validateUIMessages } from "ai";
import { getModelInstance } from "@/lib/ai/provider";
import { insertMessage, getThreadMessages } from "@/db/queries";
import { useEffect, useState, useCallback } from "react";

interface UseAIChatOptions {
  threadId: string;
  onGenerationFinish?: () => void;
}

export function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function useAIChat({ threadId, onGenerationFinish }: UseAIChatOptions) {
  const [input, setInput] = useState("");

  const {
    messages,
    setMessages,
    status,
    sendMessage,
    stop,
    error,
    clearError,
  } = useChat({
    id: threadId,
    transport: new DefaultChatTransport({
      // Custom fetch handler executes streamText client-side using Tauri's fetch bridge
      fetch: async (_url: RequestInfo | URL, options?: RequestInit) => {
        const body = JSON.parse(options?.body as string || "{}");
        const recentMessages = body.messages || [];

        // Filter out any messages that don't have parts yet
        const validRecentMessages = recentMessages.filter(
          (msg: UIMessage) => msg.parts && msg.parts.length > 0
        );

        // Slice the context history to keep only the last 15 messages (15 max tokens window)
        const slicedMessages = validRecentMessages.slice(-15);

        // Validate the UI messages against the schema
        const validatedMessages = await validateUIMessages({
          messages: slicedMessages,
        });

        let model;
        try {
          model = getModelInstance();
        } catch (err: any) {
          throw new Error(err.message || "Failed to load AI model. Please check settings.");
        }

        if (!model) {
          throw new Error("No API key configured. Please check your settings.");
        }

        // Convert UIMessage[] → ModelMessage[] (the format streamText expects)
        const modelMessages = await convertToModelMessages(validatedMessages);

        // Generate client-side text stream utilizing the Tauri HTTP plugin
        let result;
        try {
          result = streamText({
            model,
            messages: modelMessages,
            abortSignal: options?.signal || undefined,
            maxRetries: 0, // Fail fast on 503 / overloaded errors instead of hanging during retries
          });
        } catch (err: any) {
          throw new Error(err.message || "Failed to start AI stream.");
        }

        const uiStream = toUIMessageStream({
          stream: result.stream,
          originalMessages: slicedMessages,
          // Override the default error handler to surface the real API error
          // (default intentionally hides it with "An error occurred.")
          onError: (err) => (err as Error).message ?? "An error occurred.",
        });

        return createUIMessageStreamResponse({
          stream: uiStream,
        });
      },
    }),
    onError: () => {
      // Release status from 'streaming'/'submitted' to 'idle' immediately on stream failure
      stop();
    },
    onFinish: async ({ message }) => {
      const textContent = getMessageText(message);
      try {
        await insertMessage(message.id, threadId, "assistant", textContent);
      } catch (dbErr) {
        console.error("Failed to save assistant response to SQLite:", dbErr);
      }

      if (onGenerationFinish) {
        onGenerationFinish();
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;

    // Save user message to database defensively
    const userMsgId = crypto.randomUUID();
    try {
      await insertMessage(userMsgId, threadId, "user", prompt);
    } catch (dbErr) {
      console.error("Failed to save user message to SQLite:", dbErr);
    }

    setInput("");
    try {
      await sendMessage({
        id: userMsgId,
        role: "user",
        parts: [{ type: "text", text: prompt }],
      });
    } catch (err: any) {
      // Stream starter errors will propagate through useChat's onError
    }
  }, [input, threadId, sendMessage]);

  const append = useCallback(async (options: { role: string; content: string }) => {
    // Save user message to database defensively
    const userMsgId = crypto.randomUUID();
    try {
      await insertMessage(userMsgId, threadId, "user", options.content);
    } catch (dbErr) {
      console.error("Failed to save appended message to SQLite:", dbErr);
    }

    try {
      await sendMessage({
        id: userMsgId,
        role: "user",
        parts: [{ type: "text", text: options.content }],
      });
    } catch (err: any) {
      // Stream starter errors will propagate through useChat's onError
    }
  }, [threadId, sendMessage]);

  // Sync messages local SQLite DB states on active thread changes
  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      return;
    }

    async function syncFromDb() {
      try {
        const threadMsgs = await getThreadMessages(threadId);
        setMessages(
          threadMsgs.map((msg) => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            parts: [{ type: 'text', text: msg.content }],
            createdAt: new Date(msg.createdAt),
          }))
        );
      } catch (err) {
        console.error("Failed to sync messages from SQLite:", err);
      }
    }
    syncFromDb();

    // Abort active stream when switching threads
    return () => {
      stop();
    };
  }, [threadId, setMessages, stop]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSubmit,
    stop,
    append,
    error,
    clearError,
  };
}

