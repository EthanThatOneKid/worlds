import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CreateConversationButton } from "@/components/create-conversation-button";
import Link from "next/link";
import { ChevronRightIcon, MessageSquareIcon } from "lucide-react";
import * as authkit from "@workos-inc/authkit-nextjs";
import { sdk } from "@/lib/sdk";
import type { Metadata } from "next";

type Params = { worldId: string };

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { worldId } = await props.params;
  const { user } = await authkit.withAuth();
  if (!user) {
    return { title: "Conversations" };
  }

  try {
    const world = await sdk.worlds.get(worldId, { accountId: user.id });
    return {
      title: world ? `Conversations - ${world.label}` : "Conversations",
    };
  } catch {
    return { title: "Conversations" };
  }
}

export default async function ConversationsPage(props: {
  params: Promise<Params>;
}) {
  const { worldId } = await props.params;
  const { user } = await authkit.withAuth();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const conversations = await sdk.conversations.list(worldId, {
    accountId: user.id,
  });

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            Conversations
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            Manage your chat history and explore your world.
          </p>
        </div>
        {conversations.length > 0 && (
          <CreateConversationButton worldId={worldId} />
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50/50 dark:bg-stone-900/50 text-center">
          <div className="bg-stone-100 dark:bg-stone-800 p-4 rounded-full mb-4">
            <MessageSquareIcon className="size-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
            No conversations yet
          </h3>
          <p className="text-stone-500 dark:text-stone-400 max-w-sm mb-8">
            Start a new conversation to explore your world and chat with its
            inhabitants in real-time.
          </p>
          <CreateConversationButton worldId={worldId} />
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/worlds/${worldId}/conversations/${conversation.id}`}
              className="block"
            >
              <Card className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors border-stone-200 dark:border-stone-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-base font-medium">
                      Conversation {conversation.id.slice(0, 8)}...
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {conversation.createdAt
                        ? `Started ${new Intl.DateTimeFormat("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(conversation.createdAt))}`
                        : "Date unknown"}
                    </CardDescription>
                  </div>
                  <ChevronRightIcon className="size-5 text-stone-400" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
