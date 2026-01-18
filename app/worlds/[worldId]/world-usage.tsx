"use client";

import { useEffect, useState } from "react";
import type { UsageBucketRecord } from "@fartlabs/worlds";

interface WorldUsageProps {
  worldId: string;
  userId: string;
}

export function WorldUsage({ worldId, userId }: WorldUsageProps) {
  const [usage, setUsage] = useState<UsageBucketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/worlds/${worldId}/usage?account=${userId}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch usage: ${response.statusText}`);
        }
        const data = await response.json();
        setUsage(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load usage");
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, [worldId, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-stone-500 dark:text-stone-400">
          Loading usage statistics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (usage.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500 dark:text-stone-400">
          No usage data available yet.
        </p>
      </div>
    );
  }

  const totalRequests = usage.reduce(
    (sum, bucket) => sum + bucket.requestCount,
    0,
  );

  return (
    <div className="w-full">
      <div className="space-y-6">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-stone-900 dark:text-white">
              {totalRequests.toLocaleString()}
            </span>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              total requests
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
              Usage by Time Period
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800">
              <thead className="bg-stone-50 dark:bg-stone-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Account ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-stone-900 divide-y divide-stone-200 dark:divide-stone-800">
                {usage.map((bucket) => (
                  <tr key={bucket.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 dark:text-stone-100">
                      {new Date(bucket.bucketStartTs).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900 dark:text-stone-100">
                      {bucket.requestCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-stone-600 dark:text-stone-400 max-w-xs truncate">
                      {bucket.accountId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
