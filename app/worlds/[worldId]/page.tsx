import * as authkit from "@workos-inc/authkit-nextjs";
import { codeToHtml } from "shiki";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { sdk } from "@/lib/sdk";
import { WorldTabs } from "./world-tabs";
import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ worldId: string }>;
}): Promise<Metadata> {
  const { worldId } = await params;
  const { user } = await authkit.withAuth();

  if (!user) {
    return {
      title: "World Details",
    };
  }

  try {
    const world = await sdk.worlds.get(worldId, { accountId: user.id });
    if (!world) {
      return {
        title: "World Details",
      };
    }
    return {
      title: world.name || "World Details",
    };
  } catch {
    return {
      title: "World Details",
    };
  }
}

export default async function WorldPage({
  params,
}: {
  params: Promise<{ worldId: string }>;
}) {
  const { worldId } = await params;

  // Check authentication
  const { user } = await authkit.withAuth();
  if (!user) {
    const signInUrl = await authkit.getSignInUrl();
    redirect(signInUrl);
  }

  if (!user.id) {
    return (
      <ErrorState
        title="Account Not Found"
        message="Your WorkOS user is not associated with a Worlds API account."
      />
    );
  }

  // Fetch account to verify ownership
  let account;
  try {
    account = await sdk.accounts.get(user.id);
  } catch (error) {
    console.error("Failed to fetch account:", error);
    return (
      <ErrorState
        title="Error"
        message="Failed to load account data. Please try again later."
        titleClassName="text-red-600"
      />
    );
  }

  if (!account) {
    return (
      <ErrorState
        title="Account Not Found"
        message="Your WorkOS user is not associated with a Worlds API account."
      />
    );
  }

  // Fetch world data
  let world;
  try {
    world = await sdk.worlds.get(worldId, { accountId: user.id });
  } catch (error) {
    console.error("Failed to fetch world:", error);
    return (
      <ErrorState
        title="Error"
        message="Failed to load world data. Please try again later."
        titleClassName="text-red-600"
      />
    );
  }

  if (!world) {
    notFound();
  }

  // Verify ownership
  if (world.accountId !== user.id) {
    return (
      <ErrorState
        title="Forbidden"
        message="You do not have permission to view this world."
        titleClassName="text-red-600"
      />
    );
  }

  // Generate code snippets
  const codeSnippet = `import { World } from "@fartlabs/worlds";

const world = new World({
  apiKey: "${account.apiKey}",
  worldId: "${worldId}"
});

const worldRecord = await world.get();
console.log("Connected to world:", worldRecord.name);`;

  const maskedCodeSnippet = `import { World } from "@fartlabs/worlds";

const world = new World({
  apiKey: "${account.apiKey.slice(0, 4)}...${account.apiKey.slice(-4)}",
  worldId: "${worldId}"
});

const worldRecord = await world.get();
console.log("Connected to world:", worldRecord.name);`;

  const codeSnippetHtml = await codeToHtml(codeSnippet, {
    lang: "typescript",
    theme: "github-dark",
  });

  const maskedCodeSnippetHtml = await codeToHtml(maskedCodeSnippet, {
    lang: "typescript",
    theme: "github-dark",
  });

  return (
    <>
      <PageHeader accountId={user.id}>
        <Link
          href="/"
          className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Back to Dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </Link>
      </PageHeader>

      <div className="w-full mx-auto max-w-5xl px-6 pb-12">
        <WorldTabs
          world={world}
          userId={user.id}
          apiKey={account.apiKey}
          codeSnippet={codeSnippet}
          maskedCodeSnippet={maskedCodeSnippet}
          codeSnippetHtml={codeSnippetHtml}
          maskedCodeSnippetHtml={maskedCodeSnippetHtml}
        />
      </div>
    </>
  );
}

function ErrorState({
  title,
  message,
  titleClassName = "text-zinc-900 dark:text-zinc-50",
}: {
  title: string;
  message: string;
  titleClassName?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950 font-sans">
      <div className="text-center">
        <h1 className={`text-2xl font-bold mb-4 ${titleClassName}`}>{title}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{message}</p>
        <Link
          href="/"
          className="mt-6 inline-block text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
