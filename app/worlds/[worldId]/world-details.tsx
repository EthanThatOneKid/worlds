"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";
import type { WorldRecord } from "@fartlabs/worlds";
import {
  deleteWorld,
  updateWorldDescription,
  updateWorldName,
} from "./actions";
import { WorldConnectButton } from "./connect-sdk-dialog";
import { PixelPlanet } from "@/components/pixel-planet/pixel-planet";
import { PlanetDialog } from "@/components/pixel-planet/planet-dialog";
import { getSeedFromId } from "@/components/pixel-planet/lib/seed-utils";

export function WorldDetails({
  world,
  userId, // eslint-disable-line @typescript-eslint/no-unused-vars
  apiKey,
  codeSnippet,
  maskedCodeSnippet,
  codeSnippetHtml,
  maskedCodeSnippetHtml,
}: {
  world: WorldRecord;
  userId: string;
  apiKey: string;
  codeSnippet: string;
  maskedCodeSnippet: string;
  codeSnippetHtml: string;
  maskedCodeSnippetHtml: string;
}) {
  const router = useRouter();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [name, setName] = useState(world.name);
  const [description, setDescription] = useState(world.description || "");
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showPlanetDialog, setShowPlanetDialog] = useQueryState(
    "lounge",
    parseAsBoolean.withDefault(false),
  );

  const handleSaveName = () => {
    startTransition(async () => {
      await updateWorldName(world.id, name);
      setIsEditingName(false);
    });
  };

  const handleSaveDescription = () => {
    startTransition(async () => {
      await updateWorldDescription(world.id, description);
      setIsEditingDescription(false);
    });
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      setIsDeleting(true);
      startTransition(async () => {
        await deleteWorld(world.id);
        router.push("/dashboard");
      });
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const seed = getSeedFromId(world.id);

  return (
    <div className="space-y-8">
      <PlanetDialog
        isOpen={showPlanetDialog}
        onClose={() => setShowPlanetDialog(null)}
        type="earth"
        seed={seed}
      />
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
        {/* Planet Icon */}
        <button
          onClick={() => setShowPlanetDialog(true)}
          className="flex-shrink-0 h-32 w-32 md:h-40 md:w-40 overflow-hidden rounded-full bg-black/5 dark:bg-black/40 flex items-center justify-center relative hover:scale-105 transition-transform cursor-pointer border-4 border-white dark:border-zinc-800 shadow-xl"
          title="View Planet"
        >
          <PixelPlanet type="earth" seed={seed} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="space-y-2">
            {/* Title Row */}
            <div className="flex items-center gap-4">
              {isEditingName ? (
                <div className="flex items-center gap-2 flex-1 max-w-lg animate-in fade-in zoom-in duration-200">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-3xl font-bold rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Enter world name..."
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isPending}
                    className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setName(world.name);
                    }}
                    disabled={isPending}
                    className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group">
                  <h1
                    onClick={() =>
                      !isPending && !isDeleting && setIsEditingName(true)
                    }
                    className="text-4xl font-bold text-zinc-900 dark:text-white cursor-pointer hover:underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4 decoration-2 transition-all truncate"
                    title="Click to edit name"
                  >
                    {world.name}
                  </h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    disabled={isPending || isDeleting}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-blue-500 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    title="Edit Name"
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
                </div>
              )}
            </div>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div
                onClick={() => {
                  navigator.clipboard.writeText(world.id);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="inline-flex items-center gap-2 rounded-md bg-zinc-100 dark:bg-zinc-800/50 px-2.5 py-1 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer group select-none border border-zinc-200 dark:border-zinc-800"
                title="Click to copy ID"
              >
                <span className="font-mono text-xs">{world.id}</span>
                {isCopied ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-3.5 h-3.5 text-green-600 dark:text-green-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5"
                    />
                  </svg>
                )}
              </div>
              <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-900/20 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 border border-green-600/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Active
              </span>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <WorldConnectButton
              worldId={world.id}
              apiKey={apiKey}
              codeSnippet={codeSnippet}
              maskedCodeSnippet={maskedCodeSnippet}
              codeSnippetHtml={codeSnippetHtml}
              maskedCodeSnippetHtml={maskedCodeSnippetHtml}
            />
            <button
              onClick={handleDeleteClick}
              disabled={isPending || isDeleting}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium cursor-pointer border ${
                confirmDelete
                  ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-red-200 dark:hover:border-red-900/30 hover:text-red-600 dark:hover:text-red-400"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              <span>{confirmDelete ? "Confirm Delete?" : "Delete World"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="flex items-center space-x-3 mb-4 group">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Description
          </h2>
          {!isEditingDescription && (
            <button
              onClick={() => setIsEditingDescription(true)}
              disabled={isPending || isDeleting}
              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-blue-500 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              title="Edit Description"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </button>
          )}
        </div>
        {isEditingDescription ? (
          <div className="space-y-2 animate-in fade-in zoom-in duration-200">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              rows={4}
              placeholder="Enter description..."
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveDescription}
                disabled={isPending}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingDescription(false);
                  setDescription(world.description || "");
                }}
                disabled={isPending}
                className="text-sm text-zinc-600 dark:text-zinc-400 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p
            onClick={() =>
              !isPending && !isDeleting && setIsEditingDescription(true)
            }
            className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Click to edit description"
          >
            {world.description || (
              <span className="italic text-zinc-400">No description</span>
            )}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Status"
          value={
            <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/20 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
              Active
            </span>
          }
        />
        <StatCard label="Account ID" value={world.accountId} mono />
        <StatCard
          label="Created"
          value={new Date(world.createdAt).toLocaleString()}
        />
        <StatCard
          label="Last Updated"
          value={new Date(world.updatedAt).toLocaleString()}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
      <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
        {label}
      </dt>
      <dd
        className={`text-lg font-semibold text-zinc-900 dark:text-white ${
          mono ? "font-mono text-sm break-all" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
