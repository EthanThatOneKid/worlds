import * as authkit from "@workos-inc/authkit-nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Worlds } from "@fartlabs/worlds";
import { sdk } from "@/lib/sdk";
import { WorldItem } from "./world-item";
import { CreateWorldButton } from "./create-world-button";

export default async function DashboardPage() {
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

  if (!account?.apiKey) {
    return (
      <ErrorState
        title="Error"
        message="No API key found for account"
        titleClassName="text-red-600"
      />
    );
  }

  const userWorlds = new Worlds({
    apiKey: account.apiKey,
    baseUrl: process.env.WORLDS_API_BASE_URL!,
  });
  const worlds = await userWorlds.list();
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold text-zinc-900 dark:text-white"
          >
            Worlds
          </Link>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {user.email}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            My Worlds
          </h1>
          <CreateWorldButton />
        </div>

        {worlds.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
              No worlds yet
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              You haven&apos;t created any worlds yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {worlds.map((world) => (
              <WorldItem key={world.id} world={world} />
            ))}
          </div>
        )}
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
      </div>
    </div>
  );
}
