import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage, stepCountIs } from "ai";
import { createTools } from "@fartlabs/worlds/tools";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(
  req: Request,
  props: { params: Promise<{ worldId: string }> },
) {
  const { worldId } = await props.params;
  const {
    messages,
    model,
  }: {
    messages: UIMessage[];
    model?: string;
  } = await req.json();

  // Convert messages for the model
  const modelMessages = await convertToModelMessages(messages);

  // Clean up model ID to ensure it's a valid Google model
  const modelId = model?.startsWith("google/")
    ? model.replace("google/", "")
    : "gemini-2.5-flash";

  const result = streamText({
    model: google(modelId),
    messages: modelMessages,
    system:
      "You are a helpful assistant that can answer questions and help with tasks",
    tools: createTools({
      apiKey: process.env.WORLDS_API_KEY!,
      baseUrl: process.env.WORLDS_API_BASE_URL!,
      worldId,
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
