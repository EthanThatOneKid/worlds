"use client";

import { useState, useRef, useEffect } from "react";
import { updateConversationLabel } from "@/app/worlds/[worldId]/conversations/actions";
import { Edit2Icon, CheckIcon, XIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EditableConversationLabel({
  worldId,
  conversationId,
  initialLabel,
  className = "text-xl font-bold tracking-tight text-stone-900 dark:text-white truncate",
  inputClassName = "h-9 text-lg font-bold bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 focus:ring-amber-500/20",
}: {
  worldId: string;
  conversationId: string;
  initialLabel: string;
  className?: string;
  inputClassName?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(initialLabel);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (label === initialLabel) {
      setIsEditing(false);
      return;
    }

    setIsPending(true);
    try {
      const result = await updateConversationLabel(
        worldId,
        conversationId,
        label,
      );
      if (result && !result.success) {
        alert(`Failed to update label: ${result.error}`);
        setLabel(initialLabel);
      }
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Failed to update label");
      setLabel(initialLabel);
      setIsEditing(false);
    } finally {
      setIsPending(false);
    }
  };

  const handleCancel = () => {
    setLabel(initialLabel);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 max-w-md w-full">
        <Input
          ref={inputRef}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          className={inputClassName}
        />
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            disabled={isPending}
            className="size-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
          >
            {isPending ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <CheckIcon className="size-3.5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            disabled={isPending}
            className="size-7 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <XIcon className="size-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group max-w-full overflow-hidden">
      <span className={className}>{label}</span>
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all shrink-0"
        title="Edit label"
      >
        <Edit2Icon className="size-3" />
      </button>
    </div>
  );
}
