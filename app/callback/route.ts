import { randomUUID } from "crypto";
import { WorkOS } from "@workos-inc/node";
import * as authkit from "@workos-inc/authkit-nextjs";
import { sdk } from "@/lib/sdk";

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export const GET = authkit.handleAuth({
  returnPathname: "/",
  onSuccess: async (data) => {
    if (!data.user) {
      return;
    }

    // Skip if user already has an account.
    const existingAccount = await sdk.accounts.getAccount(data.user.id);
    if (!existingAccount) {
      return;
    }

    // Create the account in Worlds API
    await sdk.accounts.createAccount({
      id: data.user.id, // Associate WorkOS ID with account ID.
      planType: "",
      apiKey: randomUUID(),
      description: data.user.email || data.user.firstName || "No description",
      plan: "free_plan",
      accessControl: {
        worlds: [],
      },
    });
  },
});
