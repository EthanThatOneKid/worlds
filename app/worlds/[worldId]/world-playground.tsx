"use client";

import { useState } from "react";
import type { SparqlResults } from "@fartlabs/worlds";
import dynamic from "next/dynamic";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: false },
);
import { SparqlResultsDisplay } from "./sparql-results-display";

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
  "Delete all triples": `DELETE WHERE {
  ?s ?p ?o .
}`,
};

export function WorldPlayground({ worldId, userId }: WorldPlaygroundProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    SparqlResults | { message: string } | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isResultsCopied, setIsResultsCopied] = useState(false);

  const executeQuery = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const response = await fetch(
        `/api/worlds/${worldId}/sparql?account=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/sparql-query",
            Accept: "application/sparql-results+json",
          },
          body: query,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const data = (await response.json()) as SparqlResults | null;
      if (data === null) {
        setResults({ message: "Update executed successfully" });
      } else {
        setResults(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
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

      <div className="space-y-6">
        {/* Query Input */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
              SPARQL Editor
            </h3>
            <button
              onClick={executeQuery}
              disabled={loading || !query.trim()}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer font-medium"
            >
              {loading ? "Executing..." : "Execute"}
            </button>
          </div>
          <div className="flex-grow overflow-auto bg-stone-950">
            <CodeEditor
              value={query}
              language="sparql"
              placeholder="Enter your SPARQL query or update here..."
              onChange={(e) => setQuery(e.target.value)}
              padding={16}
              data-color-mode="dark"
              style={{
                fontSize: 14,
                backgroundColor: "#0c0a09",
                fontFamily:
                  "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                minHeight: "100%",
              }}
            />
          </div>
        </div>

        {/* Results/Error Display */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden flex flex-col min-h-[300px]">
          <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
              {error ? "Error" : "Results"}
              {!error && results && "boolean" in results
                ? " (Boolean)"
                : !error && results && "results" in results
                  ? " (Select)"
                  : !error && results && "message" in results
                    ? " (Update)"
                    : ""}
            </h3>
            {!error && results && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(results, null, 2),
                  );
                  setIsResultsCopied(true);
                  setTimeout(() => setIsResultsCopied(false), 2000);
                }}
                className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-md transition-colors cursor-pointer"
                title="Copy results"
              >
                {isResultsCopied ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 text-green-600 dark:text-green-500"
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
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
          <div className="flex-grow bg-stone-950 overflow-hidden relative">
            {error ? (
              <div className="p-4 overflow-auto h-full">
                <pre className="text-sm text-red-400 whitespace-pre-wrap font-mono">
                  {error}
                </pre>
              </div>
            ) : (
              <div className="h-full overflow-hidden bg-white dark:bg-stone-950">
                <SparqlResultsDisplay results={results} loading={loading} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
