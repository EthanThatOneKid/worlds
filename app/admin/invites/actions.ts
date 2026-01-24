"use server";

import { sdk } from "@/lib/sdk";
import { revalidatePath } from "next/cache";

export async function createInviteAction() {
  try {
    await sdk.invites.create({});
    revalidatePath("/admin/invites");
    return { success: true };
  } catch (error) {
    console.error("Failed to create invite:", error);
    return { success: false, error: "Failed to create invite" };
  }
}

export async function deleteInviteAction(id: string) {
  try {
    await sdk.invites.delete(id);
    revalidatePath("/admin/invites");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete invite:", error);
    return { success: false, error: "Failed to delete invite" };
  }
}
