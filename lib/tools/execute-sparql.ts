import type { Tool } from "ai";
import { tool } from "ai";
import { z } from "zod";
import { Worlds } from "@fartlabs/worlds";
import type { SparqlResult } from "@fartlabs/worlds";
import type { CreateToolsOptions } from "../types";
import { getDefaultSource, getSourceByWorldId } from "../ai-utils";
import { formatExecuteSparqlDescription } from "../format";

/**
 * createExecuteSparqlTool creates a tool that executes SPARQL queries and updates.
 * All queries require user approval before execution.
 */
export function createExecuteSparqlTool(options: CreateToolsOptions): Tool<
  {
    sparql: string;
    worldId?: string;
  },
  SparqlResult | null
> {
  const worlds = new Worlds(options);

  return tool({
    description: formatExecuteSparqlDescription(options),
    inputSchema: z.object({
      sparql: z
        .string()
        .describe(
          "The SPARQL query or update to execute. Supports both read operations (SELECT, ASK, CONSTRUCT, DESCRIBE) and write operations (INSERT, DELETE, UPDATE, etc.).",
        ),
      worldId: z
        .string()
        .optional()
        .describe(
          "The ID of the world to execute the query against. If omitted, uses the default source.",
        ),
    }),
    // Require user approval for all SPARQL operations
    needsApproval: true,
    execute: async ({ sparql, worldId }) => {
      const source = worldId
        ? getSourceByWorldId(options, worldId)
        : getDefaultSource(options.sources);
      if (!source?.worldId) {
        throw new Error(
          "World ID is required. All worlds are accessible, so you must specify which world to query.",
        );
      }

      return await worlds.sparql(source.worldId, sparql);
    },
  });
}
