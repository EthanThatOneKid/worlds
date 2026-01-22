"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createConversation } from "@/app/worlds/[worldId]/conversations/actions";
import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2Icon } from "lucide-react";

export function CreateConversationButton({ worldId }: { worldId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createConversation(worldId);
      if (result && !result.success) {
        alert(`Failed to create conversation: ${result.error}`);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <Button onClick={handleCreate} disabled={isPending} className="gap-2">
      {isPending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <PlusIcon className="size-4" />
      )}
      {isPending ? "Creating..." : "Create Conversation"}
    </Button>
  );
}
