"use client";

import { useState, useTransition } from "react";
import type { WorldRecord } from "@fartlabs/worlds";
import { updateWorldDescription, updateWorldName } from "./actions";
import { DeleteWorldSection } from "@/components/delete-world-section";

export function WorldSettings({ world }: { world: WorldRecord }) {
  const [name, setName] = useState(world.name);
  const [description, setDescription] = useState(world.description || "");
  const [isPending, startTransition] = useTransition();

  const handleSaveName = () => {
    startTransition(async () => {
      await updateWorldName(world.id, name);
    });
  };

  const handleSaveDescription = () => {
    startTransition(async () => {
      await updateWorldDescription(world.id, description);
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* General Settings */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-200 dark:border-stone-800">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
            General Settings
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Manage your world&apos;s basic information.
          </p>
        </div>

        <div className="p-5 space-y-5">
          {/* World Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              World Name
            </label>
            <div className="flex gap-4">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow"
                placeholder="Enter world name"
              />
              <button
                onClick={handleSaveName}
                disabled={isPending || name === world.name}
                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          {/* World Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Description
            </label>
            <div className="space-y-4">
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow resize-y"
                placeholder="Describe your world..."
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveDescription}
                  disabled={
                    isPending || description === (world.description || "")
                  }
                  className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <DeleteWorldSection worldId={world.id} worldName={world.name || ""} />
    </div>
  );
}
