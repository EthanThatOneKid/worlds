import { ComingSoonPlaceholder } from "@/components/coming-soon-placeholder";
import { MessageSquareIcon } from "lucide-react";

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
