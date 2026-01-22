"use client";

import { MessageSquareIcon, SendIcon, Loader2Icon } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import React, { useRef, useEffect } from "react";
import type { MessageRecord } from "@fartlabs/worlds";

type Props = {
  worldId: string;
  conversationId: string;
  initialMessages: MessageRecord[];
};

export function ConversationChat({
  worldId,
  conversationId,
  initialMessages,
}: Props) {
  const {
    messages: chatMessages,
    sendMessage,
    status,
  } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/worlds/${worldId}/conversations/${conversationId}/chat`,
    }),
    messages: convertToUIMessages(initialMessages),
  });

  const [input, setInput] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const value = input;
    setInput("");
    // Use sendMessage which is available in the helper type, casting to any to avoid strict signature issues
    await sendMessage({
      role: "user",
      parts: [{ type: "text", text: value }],
    });
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm flex flex-col">
      {/* Messages List */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        ref={scrollRef}
      >
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
            <div className="p-4 rounded-full bg-stone-100 dark:bg-stone-800 mb-4">
              <MessageSquareIcon className="size-8 text-stone-400" />
            </div>
            <p className="text-stone-500 dark:text-stone-400 text-sm">
              Start the conversation...
            </p>
          </div>
        ) : (
          chatMessages.map((m) => (
            <div
              key={m.id}
              className={`flex w-full ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-amber-500 text-white rounded-tr-none"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-none border border-stone-200 dark:border-stone-700"
                }`}
              >
                <div className="font-bold text-[10px] uppercase tracking-wider mb-1 opacity-70">
                  {m.role === "user" ? "You" : "Assistant"}
                </div>

                {/* Tool Invocations */}
                {m.parts ? (
                  m.parts.map((p, i) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const part = p as any;
                    if (part.type === "text") {
                      return (
                        <div key={i} className="whitespace-pre-wrap">
                          {part.text}
                        </div>
                      );
                    }

                    if (part.type === "reasoning") {
                      return null;
                    }

                    if (part.type === "source") {
                      return null;
                    }

                    if (part.type === "tool-invocation") {
                      const invocation = part.toolInvocation;
                      const toolName = invocation.toolName;
                      const toolState = invocation.state;
                      const toolOutput =
                        "result" in invocation ? invocation.result : null;

                      if (toolState === "result") {
                        return (
                          <div
                            key={i}
                            className="mt-2 p-2 bg-stone-50/50 dark:bg-stone-900/50 rounded border border-stone-200 dark:border-stone-700 text-xs font-mono"
                          >
                            <div className="text-stone-400 mb-1 flex items-center gap-1">
                              <div className="size-1.5 rounded-full bg-green-500"></div>
                              Tool: {toolName} (Complete)
                            </div>
                            <div className="truncate opacity-70">
                              Result: {JSON.stringify(toolOutput).slice(0, 100)}
                              ...
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div
                            key={i}
                            className="mt-2 p-2 bg-stone-50/50 dark:bg-stone-900/50 rounded border border-stone-200 dark:border-stone-700 text-xs font-mono animate-pulse"
                          >
                            <div className="text-amber-500 mb-1 flex items-center gap-1">
                              <Loader2Icon className="size-3 animate-spin" />
                              Tool: {toolName} (Executing...)
                            </div>
                          </div>
                        );
                      }
                    }

                    // At this point, part should be a tool part (dynamic-tool or tool-NAME)
                    const isTool =
                      part.type.startsWith("tool-") ||
                      part.type === "dynamic-tool";

                    if (!isTool) return null;

                    // Extract info safely based on type
                    let toolName = "Unknown Tool";
                    let toolOutput: unknown = null;
                    let toolState = "unknown";

                    if (part.type === "dynamic-tool") {
                      toolName = part.toolName;
                      toolState = part.state;
                      toolOutput = part.output;
                    } else {
                      // Static/Typed tool handling
                      // We know it starts with tool- due to check above, but TS needs help
                      toolName = part.type.replace("tool-", "");
                      toolState = part.state;

                      if (toolState === "output-available")
                        toolOutput = part.output;
                    }

                    if (
                      toolState === "output-available" ||
                      toolState === "result"
                    ) {
                      return (
                        <div
                          key={i}
                          className="mt-2 p-2 bg-stone-50/50 dark:bg-stone-900/50 rounded border border-stone-200 dark:border-stone-700 text-xs font-mono"
                        >
                          <div className="text-stone-400 mb-1 flex items-center gap-1">
                            <div className="size-1.5 rounded-full bg-green-500"></div>
                            Tool: {toolName} (Complete)
                          </div>
                          <div className="truncate opacity-70">
                            Result: {JSON.stringify(toolOutput).slice(0, 100)}
                            ...
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={i}
                          className="mt-2 p-2 bg-stone-50/50 dark:bg-stone-900/50 rounded border border-stone-200 dark:border-stone-700 text-xs font-mono animate-pulse"
                        >
                          <div className="text-amber-500 mb-1 flex items-center gap-1">
                            <Loader2Icon className="size-3 animate-spin" />
                            Tool: {toolName} (Executing...)
                          </div>
                        </div>
                      );
                    }
                  })
                ) : (
                  // Fallback using content if parts are missing
                  <div className="whitespace-pre-wrap">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(m as any).content.content}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Status Indicator */}
        {status === "streaming" ? (
          <div className="flex justify-start">
            <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl rounded-tl-none px-4 py-2 flex items-center gap-2">
              <Loader2Icon className="size-4 animate-spin text-stone-400" />
              <span className="text-xs text-stone-400">Thinking...</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 max-w-4xl mx-auto"
        >
          <input
            className="flex-1 bg-stone-100 dark:bg-stone-800 border-0 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-amber-500 placeholder:text-stone-400 text-stone-900 dark:text-stone-100"
            value={input}
            placeholder="Message the world..."
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={status === "streaming" || !input.trim()}
            className="p-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function convertToUIMessages(messages: MessageRecord[]): UIMessage[] {
  return messages.map((m) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parts: any[] = [];
    let contentStr = "";

    // Check for UIMessage style parts first (Assistant messages saved from onFinish)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (Array.isArray((m.content as any).parts)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parts = (m.content as any).parts;
      contentStr =
        typeof m.content.content === "string" ? m.content.content : "";
    }
    // Check for CoreMessage style content array (User messages)
    else if (Array.isArray(m.content.content)) {
      parts = m.content.content;
      contentStr = parts
        .map((p) => {
          if (p.type === "text") return p.text;
          return "";
        })
        .join("");
    }
    // Fallback to string content
    else if (typeof m.content.content === "string") {
      contentStr = m.content.content;
      parts = [{ type: "text", text: contentStr }];
    } else {
      contentStr = JSON.stringify(m.content.content);
      parts = [{ type: "text", text: contentStr }];
    }

    return {
      id: m.id,
      role: m.content.role as "user" | "assistant" | "system",
      content: contentStr,
      parts: parts,
    };
  });
}
