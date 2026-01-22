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

export async function deleteConversation(
  worldId: string,
  conversationId: string,
) {
  const { user } = await authkit.withAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    await sdk.conversations.delete(worldId, conversationId, {
      accountId: user.id,
    });
    revalidatePath(`/worlds/${worldId}/conversations`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteConversations(
  worldId: string,
  conversationIds: string[],
) {
  const { user } = await authkit.withAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    await Promise.all(
      conversationIds.map((id) =>
        sdk.conversations.delete(worldId, id, {
          accountId: user.id,
        }),
      ),
    );
    revalidatePath(`/worlds/${worldId}/conversations`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete conversations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateConversationLabel(
  worldId: string,
  conversationId: string,
  label: string,
) {
  const { user } = await authkit.withAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    await sdk.conversations.update(
      worldId,
      conversationId,
      { label },
      { accountId: user.id },
    );
    revalidatePath(`/worlds/${worldId}/conversations`);
    revalidatePath(`/worlds/${worldId}/conversations/${conversationId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update conversation label:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
