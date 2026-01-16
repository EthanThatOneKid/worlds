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

  const account = await sdk.accounts.get(user.id);
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
  // @ts-expect-error TODO: Fix this type error
  await worlds.update(worldId, { description });
  revalidatePath("/dashboard");
}

export async function deleteWorld(worldId: string) {
  const worlds = await getUserWorldsSdk();
  await worlds.remove(worldId);
  revalidatePath("/dashboard");
}

export async function createWorld() {
  try {
    const { user } = await authkit.withAuth();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const account = await sdk.accounts.get(user.id);
    if (!account?.apiKey) {
      console.error("Create World: No API key found", { userId: user.id });
      throw new Error("No API key found for account");
    }

    const worlds = new Worlds({
      apiKey: account.apiKey,
      baseUrl: process.env.WORLDS_API_BASE_URL!,
    });

    const now = Date.now();
    const newWorldId = crypto.randomUUID();
    console.log("Creating new world...", { newWorldId, accountId: account.id });

    await worlds.create({
      id: newWorldId,
      accountId: account.id!,
      name: "New World",
      description: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      isPublic: false,
    });
    console.log("World created successfully:", newWorldId);

    // Artificial delay to allow for eventual consistency in DB
    await new Promise((resolve) => setTimeout(resolve, 1000));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to create world:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
