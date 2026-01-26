"use client";

import { CheckIcon, XIcon } from "lucide-react";
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
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { SparqlResultsDisplay } from "@/components/sparql-results-display";
import type { SparqlResult } from "@fartlabs/worlds";
import type { ToolUIPart } from "ai";
import type React from "react";

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

  // Debug: Log approval and state (always log in dev)
  console.log("🔍 ExecuteSparqlTool Debug:", {
    approval,
    approvalExists: !!approval,
    approvalId: approval?.id,
    approvalApproved: approval?.approved,
    state,
    input,
    output,
    onApprove: !!onApprove,
    onReject: !!onReject,
  });

  // Create custom output component for SPARQL results
  const sparqlOutput =
    output !== undefined && output !== null ? (
      <div className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden p-2">
        <div className="max-h-96 overflow-auto">
          <SparqlResultsDisplay results={output} compact />
        </div>
      </div>
    ) : null;

  // Loading indicator for streaming/execution states
  const loadingIndicator =
    state === "input-streaming" ? (
      <TypingIndicator variant="amber" label="Preparing SPARQL query..." />
    ) : state === "input-available" ? (
      <div className="text-amber-500 flex items-center gap-2 text-sm">
        <Loader size={16} />
        <span>Executing SPARQL query...</span>
      </div>
    ) : null;

  return (
    <Tool
      defaultOpen={
        state === "output-available" ||
        state === "output-error" ||
        state === "approval-requested"
      }
      className="mb-0 border-0 rounded-none"
    >
      <ToolHeader type="tool-executeSparql" state={state} />
      <ToolContent>
        {approval && (
          <div>
            <Confirmation
              approval={
                approval as Parameters<typeof Confirmation>[0]["approval"]
              }
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
            {/* Direct approval UI fallback - show if approval exists but ConfirmationRequest didn't render */}
            {approval &&
              state !== "output-available" &&
              state !== "output-error" &&
              state !== "output-denied" &&
              approval.approved === undefined && (
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
                  <div className="flex items-center justify-end gap-2">
                    <ConfirmationAction variant="outline" onClick={onReject}>
                      Reject
                    </ConfirmationAction>
                    <ConfirmationAction variant="default" onClick={onApprove}>
                      Approve
                    </ConfirmationAction>
                  </div>
                </div>
              )}
          </div>
        )}
        {input && (
          <div className="space-y-2 overflow-hidden">
            <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Parameters
            </h4>
            <div className="space-y-3">
              {input.sparql && (
                <div className="rounded-md bg-muted/50 overflow-hidden">
                  <CodeBlock code={input.sparql} language="sparql" />
                </div>
              )}
              {input.worldId && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">World ID:</span>{" "}
                  <code className="px-1.5 py-0.5 bg-muted rounded text-foreground">
                    {input.worldId}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}
        {loadingIndicator ? (
          <div>{loadingIndicator}</div>
        ) : (
          <ToolOutput
            output={sparqlOutput || undefined}
            errorText={undefined}
          />
        )}
      </ToolContent>
    </Tool>
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
  const results = output || [];

  // Create custom output component for search results
  const searchOutput =
    results.length === 0 ? (
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
              className="p-4 text-xs font-mono hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors"
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
                        <>World: {fact.value?.worldId || fact.value?.world}</>
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
    );

  // Loading indicator for streaming/execution states
  const loadingIndicator =
    state === "input-streaming" ? (
      <TypingIndicator
        variant="blue"
        label={`Preparing search for "${query}"${limit ? ` (limit: ${limit})` : ""}...`}
      />
    ) : state === "input-available" ? (
      <div className="text-blue-500 flex items-center gap-2 text-sm">
        <Loader size={16} />
        <span>
          Searching for &quot;{query}&quot;{limit ? ` (limit: ${limit})` : ""}
          ...
        </span>
      </div>
    ) : null;

  return (
    <Tool
      defaultOpen={state === "output-available" || state === "output-error"}
      className="mb-0 border-0 rounded-none"
    >
      <ToolHeader type="tool-searchFacts" state={state} />
      <ToolContent>
        {input && (
          <div className="space-y-2 overflow-hidden">
            <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Parameters
            </h4>
            <div className="space-y-2">
              {input.query && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Query:</span>{" "}
                  <span className="font-medium text-foreground">
                    &quot;{input.query}&quot;
                  </span>
                </div>
              )}
              {input.limit !== undefined && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Limit:</span>{" "}
                  <span className="font-medium text-foreground">
                    {input.limit}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        {loadingIndicator ? (
          <div>{loadingIndicator}</div>
        ) : (
          <ToolOutput output={searchOutput} errorText={undefined} />
        )}
      </ToolContent>
    </Tool>
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

  // Loading indicator for streaming/execution states
  const loadingIndicator =
    state === "input-streaming" ? (
      <TypingIndicator
        variant="emerald"
        label={`Preparing IRI generation${entityText ? ` for "${entityText}"` : ""}...`}
      />
    ) : state === "input-available" ? (
      <div className="text-emerald-500 flex items-center gap-2 text-sm">
        <Loader size={16} />
        <span>Generating IRI{entityText ? ` for "${entityText}"` : ""}...</span>
      </div>
    ) : null;

  return (
    <Tool
      defaultOpen={state === "output-available"}
      className="mb-0 border-0 rounded-none"
    >
      <ToolHeader type="tool-generateIri" state={state} />
      <ToolContent>
        {input && (
          <div className="space-y-2 overflow-hidden">
            <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Parameters
            </h4>
            <div className="text-sm">
              {input.entityText ? (
                <>
                  <span className="text-muted-foreground">Entity Text:</span>{" "}
                  <span className="font-medium text-foreground">
                    &quot;{input.entityText}&quot;
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground italic">
                  No entity text provided
                </span>
              )}
            </div>
          </div>
        )}
        {loadingIndicator ? (
          <div>{loadingIndicator}</div>
        ) : (
          <ToolOutput output={output} errorText={undefined} />
        )}
      </ToolContent>
    </Tool>
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
  // Loading indicator for streaming/execution states
  const loadingIndicator =
    state === "input-streaming" ? (
      <TypingIndicator variant="amber" label={`Preparing ${toolName}...`} />
    ) : state === "input-available" ? (
      <div className="text-amber-500 flex items-center gap-2 text-sm">
        <Loader size={16} />
        <span>{toolName}...</span>
      </div>
    ) : null;

  return (
    <Tool
      defaultOpen={state === "output-available" || state === "output-error"}
      className="mb-0 border-0 rounded-none"
    >
      <ToolHeader
        type={`tool-${toolName}` as ToolUIPart["type"]}
        state={state}
      />
      <ToolContent>
        {input !== undefined && input !== null && (
          <ToolInput input={input as ToolUIPart["input"]} />
        )}
        {loadingIndicator ? (
          <div>{loadingIndicator}</div>
        ) : (
          <ToolOutput
            output={output as React.ReactNode}
            errorText={
              state === "output-error" ? "An error occurred" : undefined
            }
          />
        )}
      </ToolContent>
    </Tool>
  );
}
