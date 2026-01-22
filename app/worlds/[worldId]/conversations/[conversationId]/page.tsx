import { ChevronLeftIcon, GlobeIcon, MessageSquareIcon } from "lucide-react";
import * as authkit from "@workos-inc/authkit-nextjs";
import { sdk } from "@/lib/sdk";
import type { Metadata } from "next";
import Link from "next/link";

type Params = { worldId: string; conversationId: string };

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { worldId, conversationId } = await props.params;
  const { user } = await authkit.withAuth();

  if (!user) {
    return { title: "Conversation" };
  }

  try {
    const conversation = await sdk.conversations.get(worldId, conversationId, {
      accountId: user.id,
    });
    return {
      title: conversation
        ? `Conversation ${conversation.id.slice(0, 8)}`
        : "Conversation",
    };
  } catch {
    return { title: "Conversation" };
  }
}

export default async function ConversationPage(props: {
  params: Promise<Params>;
}) {
  const { worldId, conversationId } = await props.params;
  const { user } = await authkit.withAuth();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const [conversation, world, messages] = await Promise.all([
    sdk.conversations.get(worldId, conversationId, { accountId: user.id }),
    sdk.worlds.get(worldId, { accountId: user.id }),
    sdk.messages.list(worldId, conversationId, { accountId: user.id }),
  ]);

  if (!conversation) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Conversation not found</h1>
        <Link
          href={`/worlds/${worldId}/conversations`}
          className="text-primary hover:underline"
        >
          Back to conversations
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] max-w-5xl mx-auto px-4 sm:px-6 animate-in fade-in duration-500">
      <div className="mb-6 flex items-start gap-4">
        <Link
          href={`/worlds/${worldId}/conversations`}
          className="p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-500 hover:text-stone-900 dark:hover:text-white"
        >
          <ChevronLeftIcon className="size-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
            <GlobeIcon className="size-3" />
            <span>{world?.label || "World"}</span>
            <span className="opacity-50">/</span>
            <span className="truncate">Conversation {conversation.id}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2 truncate">
            <MessageSquareIcon className="size-5 text-stone-400 shrink-0" />
            Conversation {conversation.id.slice(0, 8)}...
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-0.5">
            Started{" "}
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(conversation.createdAt))}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm transition-all duration-300 flex flex-col items-center justify-center text-center p-12">
        <div className="p-4 rounded-full bg-stone-100 dark:bg-stone-800 mb-4">
          <MessageSquareIcon className="size-8 text-stone-400" />
        </div>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
          Interactive Chat Coming Soon
        </h2>
        <p className="text-stone-500 dark:text-stone-400 max-w-xs">
          Message history and real-time chat with the world&apos;s inhabitants
          will appear here shortly.
        </p>
        {messages.length > 0 && (
          <div className="mt-8 w-full max-w-md text-left border-t border-stone-100 dark:border-stone-800 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
              Recent Messages
            </h3>
            <div className="space-y-4">
              {messages.slice(0, 3).map((m) => (
                <div key={m.id} className="text-sm">
                  <span className="font-bold text-stone-700 dark:text-stone-300 uppercase text-[10px] tracking-tighter mr-2">
                    {m.content.role}
                  </span>
                  <span className="text-stone-600 dark:text-stone-400">
                    {typeof m.content.content === "string"
                      ? m.content.content
                      : JSON.stringify(m.content.content)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
