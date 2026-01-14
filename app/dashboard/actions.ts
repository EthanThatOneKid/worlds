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
  const { user } = await authkit.withAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const account = await sdk.accounts.get(user.id);
  if (!account?.apiKey) {
    throw new Error("No API key found for account");
  }

  const worlds = new Worlds({
    apiKey: account.apiKey,
    baseUrl: process.env.WORLDS_API_BASE_URL!,
  });

  const now = Date.now();
  await worlds.create({
    id: crypto.randomUUID(),
    accountId: account.id!, // Assuming account.id is present and the correct field
    name: "New World",
    description: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    isPublic: false,
  });

  revalidatePath("/dashboard");
}
