"use client";

import { useQueryState, parseAsStringLiteral } from "nuqs";
import { WorldDetails } from "./world-details";
import { WorldUsage } from "./world-usage";
import { WorldPlayground } from "./world-playground";
import type { WorldRecord } from "@fartlabs/worlds";

const tabs = ["overview", "usage", "playground"] as const;

interface WorldTabsProps {
  world: WorldRecord;
  userId: string;
  apiKey: string;
  codeSnippet: string;
  maskedCodeSnippet: string;
  codeSnippetHtml: string;
  maskedCodeSnippetHtml: string;
}

export function WorldTabs({
  world,
  userId,
  apiKey,
  codeSnippet,
  maskedCodeSnippet,
  codeSnippetHtml,
  maskedCodeSnippetHtml,
}: WorldTabsProps) {
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(tabs).withDefault("overview"),
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("usage")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === "usage"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            Usage
          </button>
          <button
            onClick={() => setActiveTab("playground")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === "playground"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            Playground
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && (
          <WorldDetails
            world={world}
            userId={userId}
            apiKey={apiKey}
            codeSnippet={codeSnippet}
            maskedCodeSnippet={maskedCodeSnippet}
            codeSnippetHtml={codeSnippetHtml}
            maskedCodeSnippetHtml={maskedCodeSnippetHtml}
          />
        )}
        {activeTab === "usage" && (
          <WorldUsage worldId={world.id} userId={userId} />
        )}
        {activeTab === "playground" && (
          <WorldPlayground worldId={world.id} userId={userId} />
        )}
      </div>
    </div>
  );
}
