import { sdk } from "@/lib/sdk";
import { CreateInviteButton } from "./create-button";
import { InviteList } from "./invite-list";
import { Metadata } from "next";
import { InviteRecord } from "@fartlabs/worlds/internal";

export const metadata: Metadata = {
  title: "Manage Invites",
};

export default async function InvitesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = Math.max(
    1,
    Math.min(100, parseInt(params.pageSize ?? "25", 10)),
  );

  let invites: InviteRecord[] = [];
  let hasMore = false;

  try {
    // Fetch one extra to check if there are more pages
    const response = await sdk.invites.list(page, pageSize + 1);
    invites = response.slice(0, pageSize);
    hasMore = response.length > pageSize;
  } catch (e) {
    console.error("Failed to list invites", e);
  }

  // Sort invites explicitly
  invites = invites.sort((a: InviteRecord, b: InviteRecord) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
          Invites
        </h1>
        <CreateInviteButton />
      </div>
      <p className="text-stone-500 dark:text-stone-400">
        Manage invite codes for early access.
      </p>
      <InviteList
        invites={invites}
        page={page}
        pageSize={pageSize}
        hasMore={hasMore}
      />
    </div>
  );
}
