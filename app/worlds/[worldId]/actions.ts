"use server";

import { revalidatePath } from "next/cache";
import * as authkit from "@workos-inc/authkit-nextjs";
import { sdk } from "@/lib/sdk";

export async function updateWorldName(worldId: string, name: string) {
  const { user } = await authkit.withAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  await sdk.worlds.update(worldId, { name }, { accountId: user.id });
  revalidatePath(`/worlds/${worldId}`);
  revalidatePath("/dashboard");
}

export async function updateWorldDescription(
  worldId: string,
  description: string,
) {
  const { user } = await authkit.withAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  await sdk.worlds.update(worldId, { description }, { accountId: user.id });
  revalidatePath(`/worlds/${worldId}`);
  revalidatePath("/");
}

export async function deleteWorld(worldId: string) {
  const { user } = await authkit.withAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  await sdk.worlds.remove(worldId, { accountId: user.id });
  revalidatePath("/");
}
