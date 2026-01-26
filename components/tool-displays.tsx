"use client";

import { CheckIcon, XIcon, Maximize2 } from "lucide-react";
import { CodeBlock } from "@/components/ai-elements/code-block";
import { Loader } from "@/components/ai-elements/loader";
import { TypingIndicator } from "@/components/ai-elements/typing-indicator";
import {
  Confirmation,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
} from "@/components/ai-elements/confirmation";
import { SparqlResultsDisplay } from "@/components/sparql-results-display";
import type { SparqlResult } from "@fartlabs/worlds";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ToolState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied";

type ToolApproval = {
  id: string;
  approved?: boolean;
  reason?: string;
};

interface ExecuteSparqlToolProps {
  input?: { sparql?: string; worldId?: string };
  output?: SparqlResult | null;
  state: ToolState;
  approval?: ToolApproval;
  onApprove?: () => void;
  onReject?: () => void;
}

interface SearchFactsToolProps {
  input?: { query?: string; limit?: number };
  output?: Array<{
    score: number;
    value: {
      worldId?: string;
      world?: string;
      subject: string;
      predicate: string;
      object: string;
    };
  }>;
  state: ToolState;
}

interface GenerateIriToolProps {
  input?: { entityText?: string };
  output?: { iri?: string };
  state: ToolState;
}

interface GenericToolProps {
  toolName: string;
  input?: unknown;
  output?: unknown;
  state: ToolState;
}

/**
 * ExecuteSparqlTool - Displays SPARQL queries with syntax highlighting
 */
export function ExecuteSparqlTool({
  input,
  output,
  state,
  approval,
  onApprove,
  onReject,
}: ExecuteSparqlToolProps) {
  const sparql = input?.sparql || "";
  const worldId = input?.worldId;

  // Render confirmation UI when approval exists (Confirmation component handles state checking)
  const confirmationUI = approval ? (
    <div className="mt-2 overflow-hidden">
      <Confirmation
        approval={approval as Parameters<typeof Confirmation>[0]["approval"]}
        state={state}
      >
        <ConfirmationRequest>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm text-stone-700 dark:text-stone-300">
                Execute SPARQL Query?
              </div>
              {worldId && (
                <span className="text-xs text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                  {worldId}
                </span>
              )}
            </div>
            <CodeBlock code={sparql} language="sparql" />
          </div>
        </ConfirmationRequest>
        <ConfirmationAccepted>
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm">
            <CheckIcon className="size-4" />
            <span>Query approved and executed</span>
          </div>
        </ConfirmationAccepted>
        <ConfirmationRejected>
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm">
            <XIcon className="size-4" />
            <span>Query rejected</span>
          </div>
        </ConfirmationRejected>
        <ConfirmationActions>
          <ConfirmationAction variant="outline" onClick={onReject}>
            Reject
          </ConfirmationAction>
          <ConfirmationAction variant="default" onClick={onApprove}>
            Approve
          </ConfirmationAction>
        </ConfirmationActions>
      </Confirmation>
    </div>
  ) : null;

  // Completed state - show results
  if (state === "output-available" || state === "output-error") {
    return (
      <div className="mt-2 space-y-2">
        {confirmationUI}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-auto py-2 px-3"
            >
              <div
                className={`size-2 rounded-full shrink-0 ${state === "output-error" ? "bg-red-500" : "bg-green-500"}`}
              />
              <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                executeSparql
              </span>
              {worldId && (
                <span className="text-xs text-stone-400 bg-stone-200 dark:bg-stone-700 px-1.5 py-0.5 rounded">
                  {worldId}
                </span>
              )}
              <Maximize2 className="size-3 ml-auto text-stone-400" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div
                  className={`size-2 rounded-full ${state === "output-error" ? "bg-red-500" : "bg-green-500"}`}
                />
                <span>SPARQL Query Execution</span>
                {worldId && (
                  <span className="text-xs font-normal text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                    {worldId}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-stone-400 mb-2 px-1">
                  Query
                </div>
                <CodeBlock code={sparql} language="sparql" />
              </div>
              {output !== undefined && output !== null && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-stone-400 mb-2 px-1">
                    Result
                  </div>
                  <div className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-auto p-2">
                      <SparqlResultsDisplay results={output} compact />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Show confirmation UI for approval states (requested, responded, denied)
  if (confirmationUI) {
    return confirmationUI;
  }

  // In-progress state - show typing indicator for streaming, loader for execution
  if (state === "input-streaming") {
    return (
      <div className="mt-2 p-3 bg-stone-50/50 dark:bg-stone-900/50 rounded-lg border border-stone-200 dark:border-stone-700">
        <TypingIndicator variant="amber" label="Preparing SPARQL query..." />
      </div>
    );
  }

  return (
    <div className="mt-2 p-3 bg-stone-50/50 dark:bg-stone-900/50 rounded-lg border border-stone-200 dark:border-stone-700">
      <div className="text-amber-500 flex items-center gap-2 text-sm">
        <Loader size={16} />
        <span>Executing SPARQL query...</span>
      </div>
    </div>
  );
}

/**
 * SearchFactsTool - Displays search results in a clean list format
 */
export function SearchFactsTool({
  input,
  output,
  state,
}: SearchFactsToolProps) {
  const query = input?.query || "";
  const limit = input?.limit;

  // Completed state
  if (state === "output-available" || state === "output-error") {
    const results = output || [];

    return (
      <div className="mt-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-auto py-2 px-3"
            >
              <div
                className={`size-2 rounded-full shrink-0 ${state === "output-error" ? "bg-red-500" : "bg-blue-500"}`}
              />
              <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                searchFacts
              </span>
              <span className="text-xs text-stone-400">
                &quot;{query}&quot; → {results.length} result
                {results.length !== 1 ? "s" : ""}
              </span>
              <Maximize2 className="size-3 ml-auto text-stone-400" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div
                  className={`size-2 rounded-full ${state === "output-error" ? "bg-red-500" : "bg-blue-500"}`}
                />
                <span>Search Facts Results</span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              {results.length === 0 ? (
                <div className="p-6 text-center text-sm text-stone-500 italic">
                  No results found for &quot;{query}&quot;
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-stone-400 mb-3 px-1">
                    Found {results.length} result
                    {results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
                    {limit && ` (limit: ${limit})`}
                  </div>
                  <div className="divide-y divide-stone-200 dark:divide-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
                    {results.map((fact, idx) => (
                      <div
                        key={idx}
                        className="p-3 text-xs font-mono hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-stone-400 w-6 text-right shrink-0 font-sans">
                            {idx + 1}.
                          </span>
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div
                              className="text-blue-600 dark:text-blue-400 break-all"
                              title={fact.value?.subject}
                            >
                              <span className="text-stone-500 text-[10px] uppercase tracking-wider">
                                Subject:
                              </span>{" "}
                              {fact.value?.subject}
                            </div>
                            <div
                              className="text-purple-600 dark:text-purple-400 break-all"
                              title={fact.value?.predicate}
                            >
                              <span className="text-stone-500 text-[10px] uppercase tracking-wider">
                                Predicate:
                              </span>{" "}
                              {fact.value?.predicate}
                            </div>
                            <div
                              className="text-green-600 dark:text-green-400 break-all"
                              title={fact.value?.object}
                            >
                              <span className="text-stone-500 text-[10px] uppercase tracking-wider">
                                Object:
                              </span>{" "}
                              {fact.value?.object}
                            </div>
                            {(fact.value?.worldId ||
                              fact.value?.world ||
                              fact.score !== undefined) && (
                              <div className="text-stone-400 text-[10px] pt-1 border-t border-stone-200 dark:border-stone-700">
                                {fact.value?.worldId || fact.value?.world ? (
                                  <>
                                    World:{" "}
                                    {fact.value?.worldId || fact.value?.world}
                                  </>
                                ) : null}
                                {fact.score !== undefined && (
                                  <>
                                    {fact.value?.worldId || fact.value?.world
                                      ? " • "
                                      : ""}
                                    Score: {fact.score.toFixed(3)}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // In-progress state - show typing indicator for streaming, loader for execution
  if (state === "input-streaming") {
    return (
      <div className="mt-2 p-3 bg-stone-50/50 dark:bg-stone-900/50 rounded-lg border border-stone-200 dark:border-stone-700">
        <TypingIndicator
          variant="blue"
          label={`Preparing search for "${query}"${limit ? ` (limit: ${limit})` : ""}...`}
        />
      </div>
    );
  }

  return (
    <div className="mt-2 p-3 bg-stone-50/50 dark:bg-stone-900/50 rounded-lg border border-stone-200 dark:border-stone-700">
      <div className="text-blue-500 flex items-center gap-2 text-sm">
        <Loader size={16} />
        <span>
          Searching for &quot;{query}&quot;{limit ? ` (limit: ${limit})` : ""}
          ...
        </span>
      </div>
    </div>
  );
}

/**
 * GenerateIriTool - Shows generated IRI with copy functionality
 */
export function GenerateIriTool({
  input,
  output,
  state,
}: GenerateIriToolProps) {
  const entityText = input?.entityText;
  const iri = output?.iri;

  // Completed state
  if (state === "output-available") {
    return (
      <div className="mt-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-auto py-2 px-3"
            >
              <div className="size-2 rounded-full shrink-0 bg-emerald-500" />
              <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                generateIri
              </span>
              {entityText && (
                <span className="text-xs text-stone-400">
                  for &quot;{entityText}&quot;
                </span>
              )}
              <Maximize2 className="size-3 ml-auto text-stone-400" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500" />
                <span>Generated IRI</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {entityText && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-stone-400 mb-2 px-1">
                    Entity Text
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
                    <span className="text-sm text-stone-700 dark:text-stone-300">
                      &quot;{entityText}&quot;
                    </span>
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs uppercase tracking-wider text-stone-400 mb-2 px-1">
                  Generated IRI
                </div>
                <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
                  <code className="text-emerald-600 dark:text-emerald-400 font-mono text-sm break-all">
                    {iri}
                  </code>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // In-progress state - show typing indicator for streaming, loader for execution
  if (state === "input-streaming") {
    return (
      <div className="mt-2 p-3 bg-stone-50/50 dark:bg-stone-900/50 rounded-lg border border-stone-200 dark:border-stone-700">
        <TypingIndicator
          variant="emerald"
          label={`Preparing IRI generation${entityText ? ` for "${entityText}"` : ""}...`}
        />
      </div>
    );
  }

  return (
    <div className="mt-2 p-3 bg-stone-50/50 dark:bg-stone-900/50 rounded-lg border border-stone-200 dark:border-stone-700">
      <div className="text-emerald-500 flex items-center gap-2 text-sm">
        <Loader size={16} />
        <span>Generating IRI{entityText ? ` for "${entityText}"` : ""}...</span>
      </div>
    </div>
  );
}

/**
 * GenericTool - Fallback for unknown tools
 */
export function GenericTool({
  toolName,
  input,
  output,
  state,
}: GenericToolProps) {
  if (state === "output-available" || state === "output-error") {
    return (
      <div className="mt-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-auto py-2 px-3"
            >
              <div
                className={`size-2 rounded-full shrink-0 ${state === "output-error" ? "bg-red-500" : "bg-green-500"}`}
              />
              <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                {toolName}
              </span>
              <Maximize2 className="size-3 ml-auto text-stone-400" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div
                  className={`size-2 rounded-full ${state === "output-error" ? "bg-red-500" : "bg-green-500"}`}
                />
                <span>{toolName}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-stone-400 mb-2 px-1">
                  Input
                </div>
                <CodeBlock
                  code={JSON.stringify(input, null, 2)}
                  language="json"
                />
              </div>
              {output !== undefined && output !== null && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-stone-400 mb-2 px-1">
                    Output
                  </div>
                  <CodeBlock
                    code={JSON.stringify(output, null, 2)}
                    language="json"
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // In-progress state - show typing indicator for streaming, loader for execution
  if (state === "input-streaming") {
    return (
      <div className="mt-2 p-3 bg-stone-50/50 dark:bg-stone-900/50 rounded-lg border border-stone-200 dark:border-stone-700">
        <TypingIndicator variant="amber" label={`Preparing ${toolName}...`} />
      </div>
    );
  }

  return (
    <div className="mt-2 p-3 bg-stone-50/50 dark:bg-stone-900/50 rounded-lg border border-stone-200 dark:border-stone-700">
      <div className="text-amber-500 flex items-center gap-2 text-sm">
        <Loader size={16} />
        <span>{toolName}...</span>
      </div>
    </div>
  );
}
