import { InternalWorlds } from "@fartlabs/worlds";

export const sdk = new InternalWorlds({
  baseUrl: process.env.WORLDS_API_BASE_URL!,
  apiKey: process.env.WORLDS_API_KEY!,
});
