"use server";

import { sdk } from "@/lib/sdk";
import { revalidatePath } from "next/cache";

import { customAlphabet } from "nanoid";

export async function createInviteAction() {
  let attempts = 0;
  while (attempts < 3) {
    try {
      const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 4);
      await sdk.invites.create({ code: nanoid() });
      revalidatePath("/invites");
      return { success: true };
    } catch (error) {
      console.error(`Attempt ${attempts + 1} failed:`, error);
      attempts++;
    }
  }
  return {
    success: false,
    error: "Failed to create unique invite code after multiple attempts",
  };
}

export async function deleteInviteAction(id: string) {
  try {
    await sdk.invites.delete(id);
    revalidatePath("/invites");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete invite:", error);
    return { success: false, error: "Failed to delete invite" };
  }
}
