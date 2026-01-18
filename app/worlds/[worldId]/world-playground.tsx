"use client";

import { useState } from "react";

interface WorldPlaygroundProps {
  worldId: string;
  userId: string;
}

const SAMPLE_QUERIES = {
  "List all triples": `SELECT ?subject ?predicate ?object
WHERE {
  ?subject ?predicate ?object .
}
LIMIT 100`,
  "Count all triples": `SELECT (COUNT(*) as ?count)
WHERE {
  ?subject ?predicate ?object .
}`,
  "Insert example data": `PREFIX ex: <http://example.org/>

INSERT DATA {
  ex:alice a ex:Person ;
    ex:name "Alice" ;
    ex:age 30 .
}`,
};

export function WorldPlayground({ worldId, userId }: WorldPlaygroundProps) {
  const [query, setQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [queryType, setQueryType] = useState<"query" | "update">("query");

  const executeQuery = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const contentType =
        queryType === "query"
          ? "application/sparql-query"
          : "application/sparql-update";

      const response = await fetch(
        `/api/worlds/${worldId}/sparql?account=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": contentType,
            ...(queryType === "query" && {
              Accept: "application/sparql-results+json",
            }),
          },
          body: query,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      if (queryType === "query") {
        const data = await response.json();
        setResults(data);
      } else {
        setResults({ message: "Update executed successfully" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-6">
        {/* Query Type Selector */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Query Type:
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setQueryType("query")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                queryType === "query"
                  ? "bg-amber-600 text-white"
                  : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600"
              }`}
            >
              SELECT Query
            </button>
            <button
              onClick={() => setQueryType("update")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                queryType === "update"
                  ? "bg-amber-600 text-white"
                  : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600"
              }`}
            >
              INSERT/DELETE Update
            </button>
          </div>
        </div>

        {/* Sample Queries */}
        <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-white mb-3">
            Sample Queries
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SAMPLE_QUERIES).map(([name, sampleQuery]) => (
              <button
                key={name}
                onClick={() => setQuery(sampleQuery)}
                className="px-3 py-1.5 text-sm bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-md hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Query Input */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
              SPARQL {queryType === "query" ? "Query" : "Update"}
            </h3>
            <button
              onClick={executeQuery}
              disabled={loading || !query.trim()}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer font-medium"
            >
              {loading ? "Executing..." : "Execute"}
            </button>
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Enter your SPARQL ${queryType === "query" ? "query" : "update"} here...`}
            className="w-full p-4 font-mono text-sm bg-stone-950 text-stone-100 border-0 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[500px] resize-vertical"
            spellCheck={false}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
              Error
            </h4>
            <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono">
              {error}
            </pre>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
                Results
              </h3>
            </div>
            <div className="p-4 bg-stone-950 overflow-auto">
              <pre className="text-sm text-stone-100 font-mono">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
