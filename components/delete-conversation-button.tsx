"use client";

import { useTransition } from "react";
import { deleteConversation } from "@/app/worlds/[worldId]/conversations/actions";
import { Button } from "@/components/ui/button";
import { Trash2Icon, Loader2Icon } from "lucide-react";

export function DeleteConversationButton({
  worldId,
  conversationId,
}: {
  worldId: string;
  conversationId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm("Are you sure you want to delete this conversation?")) {
      startTransition(async () => {
        const result = await deleteConversation(worldId, conversationId);
        if (result && !result.success) {
          alert(`Failed to delete conversation: ${result.error}`);
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="size-8 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      title="Delete Conversation"
    >
      {isPending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <Trash2Icon className="size-4" />
      )}
    </Button>
  );
}
