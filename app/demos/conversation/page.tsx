import { ConversationDemo } from "@/components/conversation-demo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conversation Demo",
  description: "A full-featured chat interface demo using Gemini 3 and 2.5 models.",
};

export default function ConversationDemoPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-white">
            Conversation AI Elements Demo
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2">
            A full-featured chat interface demo using Gemini 3 and 2.5 models.
          </p>
        </header>
        <ConversationDemo />
      </div>
    </div>
  );
}
