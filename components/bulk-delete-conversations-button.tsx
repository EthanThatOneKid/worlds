"use client";

import { useTransition } from "react";
import { deleteConversations } from "@/app/worlds/[worldId]/conversations/actions";
import { Button } from "@/components/ui/button";
import { Trash2Icon, Loader2Icon } from "lucide-react";

export function BulkDeleteConversationsButton({
  worldId,
  conversationIds,
  onDeleted,
}: {
  worldId: string;
  conversationIds: string[];
  onDeleted?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${conversationIds.length} conversations?`,
      )
    ) {
      startTransition(async () => {
        const result = await deleteConversations(worldId, conversationIds);
        if (result && !result.success) {
          alert(`Failed to delete conversations: ${result.error}`);
        } else {
          onDeleted?.();
        }
      });
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending || conversationIds.length === 0}
      className="gap-2"
    >
      {isPending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <Trash2Icon className="size-4" />
      )}
      Delete Selected ({conversationIds.length})
    </Button>
  );
}
