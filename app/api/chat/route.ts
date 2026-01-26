// import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import {
  createTools,
  formatPrompt,
  SourceOptions,
} from "@fartlabs/worlds/tools";
import { generateUserIri, generateAssistantIri } from "@/lib/ai-utils";
import * as authkit from "@workos-inc/authkit-nextjs";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Type for UIMessage with content property (exists at runtime but not in type definition)
type UIMessageWithContent = UIMessage & {
  content: string | Array<{ type: string; text?: string }>;
};

export async function POST(req: Request) {
  const {
    messages,
    sources,
    userIri,
    assistantIri,
  }: {
    messages: UIMessage[];
    sources?: SourceOptions[];
    userIri?: string;
    assistantIri?: string;
  } = await req.json();

  // Get authenticated user context
  const { user } = await authkit.withAuth();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const resolvedUserIri = userIri ?? generateUserIri(user.id);
  const resolvedAssistantIri = assistantIri ?? generateAssistantIri(user.id);

  // Options shared between formatPrompt and createTools.
  const sharedOptions = {
    userIri: resolvedUserIri,
    assistantIri: resolvedAssistantIri,
    sources,
  };

  // Format the user messages with additional context
  const formattedMessages = messages.map((msg) => {
    if (msg.role === "user") {
      // UIMessage content can be string or array of parts
      // Access content property that exists at runtime
      const msgWithContent = msg as UIMessageWithContent;
      const content = msgWithContent.content;
      let textContent = "";

      if (typeof content === "string") {
        textContent = content;
      } else if (Array.isArray(content)) {
        // Extract text from parts
        const textPart = content.find((part) => part.type === "text");
        textContent = textPart?.text || "";
      }

      return {
        ...msg,
        content: formatPrompt({
          content: textContent,
          date: new Date(),
          ...sharedOptions,
        }),
      } as UIMessageWithContent;
    }
    return msg;
  });

  // Convert messages for the model
  const modelMessages = await convertToModelMessages(formattedMessages);

  const system = [
    `You are a computational interface optimized for minimal mental overhead and
efficient context switching. Your interactions should be direct, adaptive, and
conducive to seamless workflow transitions. Operate with precision and brevity,
tailoring responses to the user's immediate computational needs without
unnecessary elaboration. Assist with questions and knowledge base management via
SPARQL queries. **You execute SPARQL queries on the user's behalf**—when you
generate and execute queries, you are acting as the user's agent.`,
    `Use the available tools (searchFacts, executeSparql, generateIri) to
manage the knowledge base. All SPARQL operations require user approval before execution.`,
    `General workflow pattern:
- Search first: Use searchFacts to check if entities already exist before creating new ones
- Research structure: Use executeSparql with queries (SELECT, ASK, CONSTRUCT, DESCRIBE) to understand existing data patterns
- Generate IRIs: For new entities, create an IRI using generateIri. However, for the user and the assistant, you MUST use the provided IRIs (${resolvedUserIri} and ${resolvedAssistantIri}) and must NOT generate new ones.
- Execute queries: Use executeSparql to query or modify the knowledge base (SELECT, ASK, CONSTRUCT, DESCRIBE, INSERT, UPDATE, DELETE)
- Iterate: Repeat tool calls as you discover more information, refining your approach until you have enough context`,
    "After almost every user message, use the tools to update the knowledge base with new information about the user's world. This includes facts, preferences, relationships, events, and any other information the user shares.",
    "Present results in human-readable form.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const result = streamText({
    model: anthropic("claude-haiku-4-5"),
    messages: modelMessages,
    system,
    tools: createTools({
      apiKey: process.env.WORLDS_API_KEY!,
      baseUrl: process.env.WORLDS_API_BASE_URL!,
      sources,
      write: true, // Always enable write - approval workflow handles user consent
    }),
    stopWhen: stepCountIs(5),
  });

  // consume the stream to ensure it runs to completion & triggers onFinish
  // even when the client response is aborted:
  result.consumeStream();

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
