
import * as authkit from "@workos-inc/authkit-nextjs";
import { sdk } from "@/lib/sdk";
import type { Metadata } from "next";
import Link from "next/link";
import { ConversationChat } from "./client";

type Params = { worldId: string };

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { worldId } = await props.params;
  const { user } = await authkit.withAuth();

  if (!user) {
    return { title: "Chat" };
  }

  try {
    const world = await sdk.worlds.get(worldId, { accountId: user.id });
    return {
      title: world ? `Chat - ${world.label}` : "Chat",
    };
  } catch {
    return { title: "Chat" };
  }
}

export default async function ChatPage(props: { params: Promise<Params> }) {
  const { worldId } = await props.params;
  const { user } = await authkit.withAuth();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const world = await sdk.worlds.get(worldId, { accountId: user.id });

  if (!world) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">World not found</h1>
        <Link
          href={`/worlds/${worldId}`}
          className="text-primary hover:underline"
        >
          Back to world
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] max-w-5xl mx-auto px-4 sm:px-6 animate-in fade-in duration-500">


      <ConversationChat worldId={worldId} />
    </div>
  );
}
