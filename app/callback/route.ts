import * as authkit from "@workos-inc/authkit-nextjs";
import { sdk } from "@/lib/sdk";

export const GET = authkit.handleAuth({
  returnPathname: "/",
  onSuccess: async (data) => {
    if (!data.user) {
      return;
    }

    try {
      // Skip if user already has an account.
      const existingAccount = await sdk.accounts.get(data.user.id);
      if (existingAccount) {
        return;
      }

      // Create the account in Worlds API.
      await sdk.accounts.create({
        id: data.user.id, // Associate WorkOS ID with account ID.
      });
    } catch (error) {
      console.error("Error in callback route:", error);
      throw error; // Re-throw to trigger AuthKit error handling.
    }
  },
});
