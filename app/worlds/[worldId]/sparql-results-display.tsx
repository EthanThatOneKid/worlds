import { SparqlResults } from "@fartlabs/worlds";

interface SparqlResultsDisplayProps {
  results: SparqlResults | { message: string } | null;
  loading?: boolean;
}

export function SparqlResultsDisplay({
  results,
  loading,
}: SparqlResultsDisplayProps) {
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-stone-500">
        <div className="w-8 h-8 mb-4">
          <svg
            className="animate-spin w-full h-full text-amber-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p className="text-sm font-medium text-stone-600 dark:text-stone-400 animate-pulse">
          Executing query...
        </p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="h-full flex items-center justify-center text-stone-500 text-sm">
        Execute a query to see results
      </div>
    );
  }

  // Handle Update/Message
  if ("message" in results) {
    const message = (results as { message: string }).message;
    return (
      <div className="p-4 text-stone-900 dark:text-stone-100">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200 font-medium">
            {message}
          </p>
        </div>
      </div>
    );
  }

  // Handle Boolean (ASK)
  if ("boolean" in results) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <span
            className={`text-4xl font-bold ${results.boolean ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {results.boolean ? "TRUE" : "FALSE"}
          </span>
          <p className="text-stone-500 mt-2 text-sm uppercase tracking-wider font-semibold">
            Boolean Result
          </p>
        </div>
      </div>
    );
  }

  // Handle Select
  if ("results" in results && "head" in results) {
    const vars = results.head.vars || [];
    const bindings = results.results.bindings || [];

    if (bindings.length === 0) {
      return <div className="p-4 text-stone-500 italic">No results found.</div>;
    }

    return (
      <div className="overflow-auto h-full">
        <table className="w-full text-left font-mono text-sm">
          <thead className="bg-stone-100 dark:bg-stone-800 sticky top-0 z-10">
            <tr>
              {vars.map((v) => (
                <th
                  key={v}
                  className="px-4 py-2 border-b border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold whitespace-nowrap"
                >
                  ?{v}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {bindings.map((binding, i) => (
              <tr
                key={i}
                className="hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors"
              >
                {vars.map((v) => {
                  const cell = binding[v];
                  return (
                    <td
                      key={v}
                      className="px-4 py-2 text-stone-900 dark:text-stone-100 whitespace-nowrap max-w-xs truncate"
                      title={cell?.value || ""}
                    >
                      {cell ? (
                        cell.type === "uri" ? (
                          <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                            {cell.value}
                          </span>
                        ) : (
                          <span>{cell.value}</span>
                        )
                      ) : (
                        <span className="text-stone-400 opacity-50">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Fallback
  return (
    <pre className="text-sm p-4 text-stone-900 dark:text-stone-100 font-mono">
      {JSON.stringify(results, null, 2)}
    </pre>
  );
}
