"use client";

import { useTransition } from "react";
import { deleteInviteAction } from "./actions";
import { InviteRecord } from "@fartlabs/worlds/internal";

export function InviteList({ invites }: { invites: InviteRecord[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
      <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800">
        <thead className="bg-stone-50 dark:bg-stone-950/50">
          <tr>
            <th
              scope="col"
              className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider"
            >
              Code
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider"
            >
              Created At
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200 dark:divide-stone-800 bg-white dark:bg-stone-900">
          {invites.map((invite) => (
            <InviteRow key={invite.code} invite={invite} />
          ))}
          {invites.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-3 py-8 text-center text-sm text-stone-500 dark:text-stone-400"
              >
                No invites found. Create one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function InviteRow({ invite }: { invite: InviteRecord }) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-stone-900 dark:text-white font-mono">
        {invite.code}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-stone-500 dark:text-stone-400">
        {invite.createdAt
          ? new Date(invite.createdAt).toLocaleDateString()
          : "-"}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-stone-500 dark:text-stone-400">
        {invite.redeemedAt ? (
          <div className="flex flex-col">
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300 w-fit">
              Redeemed
            </span>
            <span className="text-xs text-stone-500 mt-1">
              {new Date(invite.redeemedAt).toLocaleDateString()}
            </span>
          </div>
        ) : (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Active
          </span>
        )}
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <button
          onClick={() =>
            startTransition(async () => {
              await deleteInviteAction(invite.code);
            })
          }
          disabled={isPending}
          className="text-red-600 hover:text-red-900 dark:hover:text-red-400 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isPending ? "Deleting..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}
