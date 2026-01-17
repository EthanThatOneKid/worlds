"use client";

import { useEffect, useState, useTransition, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WorldRecord } from "@fartlabs/worlds";
import { deleteWorld, updateWorldDescription } from "@/app/actions";
import { PixelPlanet } from "./pixel-planet/pixel-planet";
import { getSeedFromId } from "./pixel-planet/lib/seed-utils";

export function WorldItem({ world }: { world: WorldRecord }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(world.description || "");
  const [isPending, startTransitionAction] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset confirmation state after 3 seconds if not clicked
  useEffect(() => {
    if (confirmDelete) {
      const timer = setTimeout(() => setConfirmDelete(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmDelete]);

  const handleSave = () => {
    startTransitionAction(async () => {
      await updateWorldDescription(world.id, description);
      setIsEditing(false);
    });
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      setIsDeleting(true);
      startTransitionAction(async () => {
        await deleteWorld(world.id);
      });
    } else {
      setConfirmDelete(true);
    }
  };

  const handlePlanetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const targetUrl = `/worlds/${world.id}?lounge=true`;

    // Use View Transition API if available
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      document.startViewTransition(() => {
        startTransition(() => {
          router.push(targetUrl);
        });
      });
    } else {
      startTransition(() => {
        router.push(targetUrl);
      });
    }
  };

  const seed = getSeedFromId(world.id);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-shadow hover:shadow-md group">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePlanetClick}
              className="h-16 w-16 overflow-hidden rounded-full bg-black/5 dark:bg-black/40 flex items-center justify-center relative hover:scale-110 transition-transform cursor-pointer border-4 border-white dark:border-zinc-800 shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              title="View Planet"
            >
              <PixelPlanet type="earth" seed={seed} />
            </button>
            <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
              Active
            </span>
          </div>

          <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(!isEditing)}
              disabled={isPending || isDeleting}
              className="p-2 text-zinc-400 hover:text-blue-500 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Edit Description"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={isPending || isDeleting}
              className={`p-2 rounded-full transition-all duration-200 flex items-center ${
                confirmDelete
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 w-auto cursor-pointer"
                  : "text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              }`}
              title="Delete World"
            >
              {confirmDelete ? (
                <span className="text-xs font-semibold whitespace-nowrap">
                  Confirm?
                </span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <h3
          className="text-lg font-semibold text-zinc-900 dark:text-white mb-1 truncate"
          title={world.name || world.id}
        >
          <Link
            href={`/worlds/${world.id}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {world.name || world.id}
          </Link>
        </h3>

        <div className="mb-4 min-h-[3rem]">
          {isEditing ? (
            <div className="space-y-2 animate-in fade-in zoom-in duration-200">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                rows={2}
                placeholder="Enter description..."
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setDescription(world.description || "");
                  }}
                  disabled={isPending}
                  className="text-xs text-zinc-600 dark:text-zinc-400 px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2"
              title={world.description || undefined}
            >
              {world.description || (
                <span className="italic text-zinc-400">No description</span>
              )}
            </p>
          )}
        </div>

        <div className="mb-4 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
          <p>Updated {new Date(world.updatedAt).toLocaleDateString()}</p>
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          <Link
            href={`/worlds/${world.id}`}
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
          >
            View details
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 ml-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
