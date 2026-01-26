"use client";

import { useChat } from "@ai-sdk/react";
import {
  type ChatStatus,
  DefaultChatTransport,
  type SourceDocumentUIPart,
  type TextUIPart,
} from "ai";
import { CheckIcon, CopyIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { MessageResponse } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  usePromptInputReferencedSources,
} from "@/components/ai-elements/prompt-input";
import {
  Attachment,
  AttachmentHoverCard,
  AttachmentHoverCardContent,
  AttachmentHoverCardTrigger,
  AttachmentInfo,
  AttachmentPreview,
  Attachments,
} from "@/components/ai-elements/attachments";
import {
  ExecuteSparqlTool,
  SearchFactsTool,
  GenerateIriTool,
  GenericTool,
} from "@/components/tool-displays";
import { parseAsBoolean, useQueryState } from "nuqs";
import { getSeedFromId } from "./pixel-planet/lib/seed-utils";
import { PixelPlanet } from "./pixel-planet/pixel-planet";

type Props = {
  worldId: string;
  worldLabel?: string;
  className?: string;
};

const PromptInputSourcesDisplay = ({
  worldId,
  worldLabel,
}: {
  worldId: string;
  worldLabel?: string;
}) => {
  const sources = usePromptInputReferencedSources();
  const [, setShowPlanetDialog] = useQueryState(
    "lounge",
    parseAsBoolean.withDefault(false),
  );

  if (sources.sources.length === 0) {
    return null;
  }

  const seed = getSeedFromId(worldId);

  return (
    <Attachments variant="inline">
      {sources.sources.map((source) => {
        const isWorldSource =
          source.sourceId === worldId || source.filename === worldId;

        const content = (
          <Attachment
            data={source}
            key={source.id}
            onClick={() => {
              if (isWorldSource) {
                setShowPlanetDialog(true);
              }
            }}
          >
            <AttachmentPreview />
            <AttachmentInfo />
          </Attachment>
        );

        if (isWorldSource) {
          return (
            <AttachmentHoverCard key={source.id}>
              <AttachmentHoverCardTrigger asChild>
                {content}
              </AttachmentHoverCardTrigger>
              <AttachmentHoverCardContent className="w-80 p-0 overflow-hidden bg-stone-900 border-stone-800">
                <div className="relative h-48 w-full bg-black overflow-hidden border-b border-stone-800">
                  <PixelPlanet
                    type="earth"
                    seed={seed}
                    stars={true}
                    advanced={{ orbitControls: false }}
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-4">
                    <h3 className="text-white font-bold text-lg">
                      {worldLabel || worldId}
                    </h3>
                    <p className="text-stone-400 text-xs font-mono opacity-80">
                      {worldId}
                    </p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span>World is active and reachable</span>
                  </div>
                  <p className="text-stone-300 text-sm leading-relaxed">
                    This is your active world. All messages will be sent to this
                    environment. Click to enter the 3D lounge.
                  </p>
                </div>
              </AttachmentHoverCardContent>
            </AttachmentHoverCard>
          );
        }

        return content;
      })}
    </Attachments>
  );
};

type PromptInputWrapperProps = {
  sendMessage: ReturnType<typeof useChat>["sendMessage"];
  status: ChatStatus;
  worldId: string;
  worldLabel?: string;
};

// Component that adds the world as a source on mount
const PromptInputWorldSource = ({
  worldId,
  worldLabel,
}: {
  worldId: string;
  worldLabel?: string;
}) => {
  const sources = usePromptInputReferencedSources();

  React.useEffect(() => {
    // Check if world source already exists
    const worldSourceExists = sources.sources.some(
      (source) => source.title === worldLabel || source.filename === worldId,
    );

    if (!worldSourceExists) {
      const worldSource: SourceDocumentUIPart = {
        type: "source-document",
        sourceId: worldId,
        title: worldLabel || worldId,
        filename: worldId,
        mediaType: "text/plain",
      };
      sources.add(worldSource);
    }
  }, [worldId, worldLabel, sources]);

  return null;
};

// Component that must be rendered inside PromptInput to access sources context
// This component creates the submit handler with access to sources
const PromptInputSubmitHandler = ({
  sendMessage,
  onSubmitRef,
  worldId,
}: {
  sendMessage: ReturnType<typeof useChat>["sendMessage"];
  onSubmitRef: React.MutableRefObject<
    ((message: PromptInputMessage) => Promise<void>) | null
  >;
  worldId: string;
}) => {
  useEffect(() => {
    onSubmitRef.current = async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim());
      if (!hasText) return;

      // Build parts array with text
      // Build parts array with text
      const parts: Array<TextUIPart> = [{ type: "text", text: message.text }];

      // Deriving sources from worldId
      const sources = [{ worldId, default: true }];

      // Use sendMessage with sources and right in the body
      await sendMessage(
        {
          role: "user",
          parts,
        },
        {
          body: {
            sources,
            write: true, // TODO: Make this configurable from props if needed
          },
        },
      );
    };
  }, [sendMessage, onSubmitRef, worldId]);

  return null;
};

const PromptInputWrapper = ({
  sendMessage,
  status,
  worldId,
  worldLabel,
}: PromptInputWrapperProps) => {
  const submitHandlerRef = React.useRef<
    ((message: PromptInputMessage) => Promise<void>) | null
  >(null);

  const handleSubmit = async (message: PromptInputMessage) => {
    if (submitHandlerRef.current) {
      await submitHandlerRef.current(message);
    }
  };

  return (
    <PromptInput
      onSubmit={handleSubmit}
      className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
    >
      <PromptInputWorldSource worldId={worldId} worldLabel={worldLabel} />
      <PromptInputSubmitHandler
        sendMessage={sendMessage}
        onSubmitRef={submitHandlerRef}
        worldId={worldId}
      />
      <PromptInputBody>
        <PromptInputTextarea
          placeholder="Message the world..."
          className="pb-3 w-full min-h-[60px] resize-none"
        />
      </PromptInputBody>
      <PromptInputFooter>
        <div className="flex-1 min-w-0">
          <PromptInputSourcesDisplay
            worldId={worldId}
            worldLabel={worldLabel}
          />
        </div>
        <PromptInputSubmit status={status} size="icon-sm" />
      </PromptInputFooter>
    </PromptInput>
  );
};

export function ConversationChat({
  worldId,
  worldLabel,
  className = "",
}: Props) {
  const {
    messages: chatMessages,
    sendMessage,
    status,
    addToolApprovalResponse,
  } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/chat`,
    }),
    messages: [],
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm flex flex-col ${
        chatMessages.length > 0 ? "min-h-[400px] max-h-[700px]" : ""
      } ${className}`}
    >
      {/* Messages List */}
      {chatMessages.length > 0 && (
        <div
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          ref={scrollRef}
        >
          {chatMessages.map((m) => (
            <div
              key={m.id}
              className={`flex w-full items-start gap-2 ${
                m.role === "user" ? "justify-end" : "justify-start"
              } group`}
            >
              {/* Copy button for user messages - appears on the left */}
              {m.role === "user" && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center self-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                          onClick={() => {
                            const text = m.parts
                              ? m.parts
                                  .filter((p) => p.type === "text")
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  .map((p) => (p as any).text)
                                  .join("")
                              : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (m as any).content.content;
                            handleCopy(m.id, text);
                          }}
                        >
                          {copiedId === m.id ? (
                            <CheckIcon className="size-3.5" />
                          ) : (
                            <CopyIcon className="size-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy message</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-amber-500 text-stone-950 rounded-tr-none"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-none border border-stone-200 dark:border-stone-700"
                }`}
              >
                <div className="font-bold text-[10px] uppercase tracking-wider mb-1 opacity-70">
                  {m.role === "user" ? "You" : "Assistant"}
                </div>

                {/* Tool Invocations */}
                {m.parts ? (
                  m.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <div
                          key={i}
                          className="prose dark:prose-invert max-w-none"
                        >
                          <MessageResponse>{part.text}</MessageResponse>
                        </div>
                      );
                    }

                    if (part.type === "reasoning") {
                      return null;
                    }

                    // if (part.type === "source") {
                    //   return null;
                    // }

                    // Handle tool parts - type is "tool-{toolName}" e.g. "tool-executeSparql"
                    if (part.type.startsWith("tool-")) {
                      // Extract tool name from type (e.g., "tool-executeSparql" -> "executeSparql")
                      const toolName = part.type.slice(5); // Remove "tool-" prefix
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const toolPart = part as any;
                      const toolState = toolPart.state as
                        | "input-streaming"
                        | "input-available"
                        | "approval-requested"
                        | "approval-responded"
                        | "output-available"
                        | "output-error"
                        | "output-denied";
                      const toolArgs = toolPart.input;
                      const toolOutput = toolPart.output;
                      const approval = toolPart.approval as
                        | { id: string; approved?: boolean; reason?: string }
                        | undefined;

                      // Render tool-specific components
                      if (toolName === "executeSparql") {
                        return (
                          <ExecuteSparqlTool
                            key={i}
                            input={toolArgs}
                            output={toolOutput}
                            state={toolState}
                            approval={approval}
                            onApprove={
                              approval
                                ? () =>
                                    addToolApprovalResponse({
                                      id: approval.id,
                                      approved: true,
                                    })
                                : undefined
                            }
                            onReject={
                              approval
                                ? () =>
                                    addToolApprovalResponse({
                                      id: approval.id,
                                      approved: false,
                                    })
                                : undefined
                            }
                          />
                        );
                      }

                      if (toolName === "searchFacts") {
                        return (
                          <SearchFactsTool
                            key={i}
                            input={toolArgs}
                            output={toolOutput}
                            state={toolState}
                          />
                        );
                      }

                      if (toolName === "generateIri") {
                        return (
                          <GenerateIriTool
                            key={i}
                            input={toolArgs}
                            output={toolOutput}
                            state={toolState}
                          />
                        );
                      }

                      // Fallback to generic tool display
                      return (
                        <GenericTool
                          key={i}
                          toolName={toolName}
                          input={toolArgs}
                          output={toolOutput}
                          state={toolState}
                        />
                      );
                    }

                    return null;
                  })
                ) : (
                  // Fallback using content if parts are missing
                  <div className="prose dark:prose-invert max-w-none">
                    <MessageResponse>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {typeof (m as any).content === "string"
                        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (m as any).content
                        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (m as any).content?.content}
                    </MessageResponse>
                  </div>
                )}
              </div>

              {/* Copy button for assistant messages - appears on the right */}
              {m.role === "assistant" && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center self-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                          onClick={() => {
                            const text = m.parts
                              ? m.parts
                                  .filter((p) => p.type === "text")
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  .map((p) => (p as any).text)
                                  .join("")
                              : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (m as any).content.content;
                            handleCopy(m.id, text);
                          }}
                        >
                          {copiedId === m.id ? (
                            <CheckIcon className="size-3.5" />
                          ) : (
                            <CopyIcon className="size-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy message</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          ))}

          {/* Status Indicator */}
          {status === "submitted" ? (
            <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl rounded-tl-none px-5 py-3 flex items-center gap-3 border border-stone-200 dark:border-stone-700 shadow-sm">
                <div className="flex gap-1">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="size-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="size-1.5 rounded-full bg-amber-500 animate-bounce"></span>
                </div>
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400 tracking-wide">
                  Assistant is thinking...
                </span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Input Area */}
      <PromptInputWrapper
        sendMessage={sendMessage}
        status={status}
        worldId={worldId}
        worldLabel={worldLabel}
      />
    </div>
  );
}
