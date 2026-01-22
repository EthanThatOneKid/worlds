import { ComingSoonPlaceholder } from "@/components/coming-soon-placeholder";

import * as authkit from "@workos-inc/authkit-nextjs";
import { sdk } from "@/lib/sdk";
import type { Metadata } from "next";

type Params = { worldId: string };

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { worldId } = await props.params;
  const { user } = await authkit.withAuth();

  if (!user) {
    return { title: "Webhooks" };
  }

  try {
    const world = await sdk.worlds.get(worldId, { accountId: user.id });
    return {
      title: world ? `Webhooks - ${world.label}` : "Webhooks",
    };
  } catch {
    return { title: "Webhooks" };
  }
}

export default function WorldWebhooksPage() {
  return (
    <ComingSoonPlaceholder
      title="Webhooks - Coming soon"
      description="Connect third-party webhooks to your world."
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-amber-600 dark:text-amber-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
          />
        </svg>
      }
    />
  );
}
