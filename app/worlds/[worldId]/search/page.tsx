import * as authkit from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { WorldSearch } from "../world-search";

type Params = { worldId: string };

export default async function WorldSearchPage(props: {
  params: Promise<Params>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { worldId } = await props.params;
  const { user } = await authkit.withAuth();
  if (!user) {
    const signInUrl = await authkit.getSignInUrl();
    redirect(signInUrl);
  }

  return <WorldSearch worldId={worldId} userId={user.id} />;
}
