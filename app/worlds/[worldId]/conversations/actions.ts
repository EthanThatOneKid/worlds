"use server";

import { revalidatePath } from "next/cache";
import * as authkit from "@workos-inc/authkit-nextjs";
import { sdk } from "@/lib/sdk";

export async function createConversation(worldId: string) {
  const { user } = await authkit.withAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const conversation = await sdk.conversations.create(
      worldId,
      {},
      { accountId: user.id },
    );
    revalidatePath(`/worlds/${worldId}/conversations`);
    return { success: true, conversation };
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
