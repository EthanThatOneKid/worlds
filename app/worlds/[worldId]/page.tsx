import * as authkit from "@workos-inc/authkit-nextjs";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { sdk } from "@/lib/sdk";
import { WorldDetails } from "./world-details";

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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
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
            <Link
              href="/"
              className="text-lg font-bold text-zinc-900 dark:text-white"
            >
              Worlds
            </Link>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {user.email}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <WorldDetails world={world} />
      </main>
    </div>
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
          href="/dashboard"
          className="mt-6 inline-block text-blue-600 dark:text-blue-400 hover:underline"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
