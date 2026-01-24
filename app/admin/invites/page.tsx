import { sdk } from "@/lib/sdk";
import { CreateInviteButton } from "./create-button";
import { InviteList } from "./invite-list";
import { Metadata } from "next";
import { InviteRecord } from "@fartlabs/worlds/internal";

export const metadata: Metadata = {
  title: "Manage Invites",
};

export default async function InvitesPage() {
  let invites: InviteRecord[] = [];
  try {
    invites = await sdk.invites.list(1, 100);
  } catch (e) {
    console.error("Failed to list invites", e);
  }

  // Sort invites explicitly just in case standard sort isn't applied
  invites = invites.sort((a: InviteRecord, b: InviteRecord) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
          Invite Codes
        </h1>
        <CreateInviteButton />
      </div>
      <p className="text-stone-500 dark:text-stone-400">
        Manage invite codes for early access.
      </p>
      <InviteList invites={invites} />
    </div>
  );
}
