import * as authkit from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { WorldPlayground } from "../world-playground";

type Params = { worldId: string };

export default async function WorldPlaygroundPage(props: {
  params: Promise<Params>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { worldId } = await props.params;
  const { user } = await authkit.withAuth();
  if (!user) {
    const signInUrl = await authkit.getSignInUrl();
    redirect(signInUrl);
  }

  return <WorldPlayground worldId={worldId} userId={user.id} />;
}
