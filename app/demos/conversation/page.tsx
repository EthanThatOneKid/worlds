import { ConversationDemo } from "@/components/conversation-demo";
import { Metadata } from "next";
import * as authkit from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { sdk } from "@/lib/sdk";

export const metadata: Metadata = {
  title: "Conversation Demo",
  description:
    "A full-featured chat interface demo using Gemini 3 and 2.5 models.",
};

export default async function ConversationDemoPage() {
  const { user } = await authkit.withAuth();

  if (!user) {
    const signInUrl = await authkit.getSignInUrl();
    redirect(signInUrl);
  }

  // Check if user is a shadow user - redirect to root if plan is null/undefined or "shadow"
  try {
    const account = await sdk.accounts.get(user.id);
    if (account && (!account.plan || account.plan === "shadow")) {
      redirect("/");
    }
  } catch (error) {
    console.error("Failed to fetch account for shadow user check:", error);
    redirect("/");
  }
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
