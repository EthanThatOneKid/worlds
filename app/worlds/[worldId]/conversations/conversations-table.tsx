"use client";

import { CreateConversationButton } from "@/components/create-conversation-button";
import Link from "next/link";
import { DeleteConversationButton } from "@/components/delete-conversation-button";
import { BulkDeleteConversationsButton } from "@/components/bulk-delete-conversations-button";
import { ChevronRightIcon, MessageSquareIcon } from "lucide-react";
import { useState } from "react";
import type { ConversationRecord } from "@fartlabs/worlds";

export function ConversationsTable({
  worldId,
  initialConversations,
}: {
  worldId: string;
  initialConversations: ConversationRecord[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === initialConversations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(initialConversations.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 h-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white leading-tight">
            Conversations
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm">
            Manage your chat history and explore your world.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <BulkDeleteConversationsButton
              worldId={worldId}
              conversationIds={selectedIds}
              onDeleted={() => setSelectedIds([])}
            />
          )}
          <CreateConversationButton worldId={worldId} />
        </div>
      </div>

      {initialConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50/50 dark:bg-stone-900/50 text-center">
          <div className="bg-stone-100 dark:bg-stone-800 p-4 rounded-full mb-4">
            <MessageSquareIcon className="size-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
            No conversations yet
          </h3>
          <p className="text-stone-500 dark:text-stone-400 max-w-sm mb-8 text-sm">
            Start a new conversation to explore your world and chat with its
            inhabitants in real-time.
          </p>
          <CreateConversationButton worldId={worldId} />
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden bg-white dark:bg-stone-900 shadow-sm transition-all duration-200">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
                <th className="p-3 w-12">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="rounded border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-amber-600 focus:ring-amber-500/20 size-4 cursor-pointer accent-amber-600 transition-all"
                      checked={
                        selectedIds.length === initialConversations.length &&
                        initialConversations.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </div>
                </th>
                <th className="p-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Conversation
                </th>
                <th className="p-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 w-24">
                  Status
                </th>
                <th className="p-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 w-48">
                  Created At
                </th>
                <th className="p-3 text-right w-24"></th>
              </tr>
            </thead>
            <tbody>
              {initialConversations.map((conversation) => (
                <tr
                  key={conversation.id}
                  className={`group hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-all border-b border-stone-100 last:border-0 dark:border-stone-800/50 ${selectedIds.includes(conversation.id) ? "bg-amber-50/40 dark:bg-amber-950/10" : ""}`}
                >
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="rounded border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-amber-600 focus:ring-amber-500/20 size-4 cursor-pointer accent-amber-600 transition-all"
                        checked={selectedIds.includes(conversation.id)}
                        onChange={() => toggleSelect(conversation.id)}
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/worlds/${worldId}/conversations/${conversation.id}`}
                      className="flex items-center gap-3 w-full"
                    >
                      <div className="bg-stone-100 dark:bg-stone-800 p-1.5 rounded transition-all group-hover:text-amber-600 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/40 text-stone-400 shrink-0">
                        <MessageSquareIcon className="size-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                          {conversation.label || "Untitled"}
                        </span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono truncate">
                          {conversation.id}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-inset ring-green-600/10">
                      Active
                    </span>
                  </td>
                  <td className="p-3 text-xs text-stone-500 dark:text-stone-400 font-mono">
                    {conversation.createdAt
                      ? new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(conversation.createdAt))
                      : "Unknown"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <DeleteConversationButton
                        worldId={worldId}
                        conversationId={conversation.id}
                      />
                      <Link
                        href={`/worlds/${worldId}/conversations/${conversation.id}`}
                        className="p-1.5 rounded-md text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
                      >
                        <ChevronRightIcon className="size-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
