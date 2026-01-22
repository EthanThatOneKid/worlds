import { ComingSoonPlaceholder } from "@/components/coming-soon-placeholder";
import { MessageSquareIcon } from "lucide-react";

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

export default function ConversationsPage() {
  return (
    <div className="animate-in fade-in duration-500">
      <ComingSoonPlaceholder
        title="Conversations are coming soon"
        description="Soon you will be able to have long-form conversations with your worlds, explore their history, and chat about the inhabitants in real-time."
        icon={<MessageSquareIcon className="size-6 text-amber-600" />}
      />
    </div>
  );
}
