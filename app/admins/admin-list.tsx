"use client";

import { useTransition, useState } from "react";
import { toggleAdminAction } from "./actions";

type WorkOSUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string | null;
};

export function AdminList({ users }: { users: WorkOSUser[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
      <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800">
        <thead className="bg-stone-50 dark:bg-stone-950/50">
          <tr>
            <th
              scope="col"
              className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider"
            >
              User
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider"
            >
              Email
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
              Admin Status
            </th>
            <th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200 dark:divide-stone-800 bg-white dark:bg-stone-900">
          {users.map((user) => (
            <AdminRow key={user.id} user={user} />
          ))}
          {users.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-3 py-8 text-center text-sm text-stone-500 dark:text-stone-400"
              >
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AdminRow({ user }: { user: WorkOSUser }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isAdmin = !!user.metadata?.admin;
  const displayName =
    user.firstName || user.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "N/A";

  const handleToggle = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleAdminAction(user.id, !isAdmin);
      if (!result.success) {
        setError(result.error || "Failed to update admin status");
      }
    });
  };

  return (
    <tr>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-stone-900 dark:text-white">
        {displayName}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-stone-500 dark:text-stone-400">
        {user.email || "-"}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-stone-500 dark:text-stone-400">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        {isAdmin ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Admin
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-800 dark:bg-stone-800 dark:text-stone-300">
            User
          </span>
        )}
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`${
              isAdmin
                ? "text-red-600 hover:text-red-900 dark:hover:text-red-400"
                : "text-green-600 hover:text-green-900 dark:hover:text-green-400"
            } disabled:opacity-50 transition-colors cursor-pointer`}
          >
            {isPending
              ? "Updating..."
              : isAdmin
                ? "Remove Admin"
                : "Make Admin"}
          </button>
          {error && (
            <span className="text-xs text-red-600 dark:text-red-400">
              {error}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}
