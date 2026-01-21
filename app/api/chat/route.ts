import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
  }: { 
    messages: UIMessage[]; 
    model: string; 
    webSearch: boolean;
  } = await req.json();

  let selectedModel: any;
  
  if (webSearch) {
    // If webSearch is enabled, we use perplexity/sonar via openai provider
    // This assumes the user has set OPENAI_API_KEY to a perplexity key or similar,
    // or we can use a custom provider. For this demo, let's use a standard model.
    selectedModel = openai('gpt-4o'); 
  } else {
    if (model.startsWith('openai/')) {
       selectedModel = openai(model.replace('openai/', ''));
    } else if (model.startsWith('google/')) {
       selectedModel = google(model.replace('google/', ''));
    } else if (model.startsWith('deepseek/')) {
       // Deepseek can often be used via openai provider with a different base URL,
       // but for simplicity in this demo we'll fallback to gpt-4o if not configured.
       selectedModel = openai('gpt-4o');
    } else {
       selectedModel = google('gemini-1.5-flash');
    }
  }

  const result = streamText({
    model: selectedModel,
    messages: await convertToModelMessages(messages),
    system:
      'You are a helpful assistant that can answer questions and help with tasks',
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
