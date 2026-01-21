import * as authkit from "@workos-inc/authkit-nextjs";
import { redirect, notFound } from "next/navigation";
import { sdk } from "@/lib/sdk";
import { WorldSettings } from "../world-settings";

type Params = { worldId: string };

export default async function WorldSettingsPage(props: {
  params: Promise<Params>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { worldId } = await props.params;
  const { user } = await authkit.withAuth();
  if (!user) {
    const signInUrl = await authkit.getSignInUrl();
    redirect(signInUrl);
  }

  // Fetch world data for settings
  let world;
  try {
    world = await sdk.worlds.get(worldId, { accountId: user.id });
  } catch (error) {
    console.error("Failed to fetch world:", error);
    return null;
  }

  if (!world) {
    notFound();
  }

  return <WorldSettings world={world} />;
}
