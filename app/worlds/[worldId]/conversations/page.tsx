import { ConversationsTable } from "./conversations-table";
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
    <ConversationsTable
      worldId={worldId}
      initialConversations={conversations}
    />
  );
}
