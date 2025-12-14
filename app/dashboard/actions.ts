"use server";

import { revalidatePath } from "next/cache";
import { Worlds } from "@fartlabs/worlds";
import * as authkit from "@workos-inc/authkit-nextjs";
import { sdk } from "@/lib/sdk";

async function getUserWorldsSdk() {
  const { user } = await authkit.withAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const account = await sdk.getAccount(user.id);
  if (!account?.apiKey) {
    throw new Error("No API key found for account");
  }

  return new Worlds({
    apiKey: account.apiKey,
    baseUrl: process.env.WORLDS_API_BASE_URL!,
  });
}

export async function updateWorldDescription(
  worldId: string,
  description: string,
) {
  const worlds = await getUserWorldsSdk();
  await worlds.updateWorldDescription(worldId, description);
  revalidatePath("/dashboard");
}

export async function deleteWorld(worldId: string) {
  const worlds = await getUserWorldsSdk();
  await worlds.removeWorld(worldId);
  revalidatePath("/dashboard");
}
