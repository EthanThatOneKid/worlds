import * as authkit from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export default async function Home() {
  const { user } = await authkit.withAuth();

  if (user) {
    redirect("/dashboard");
  }

  const signInUrl = await authkit.getSignInUrl();
  redirect(signInUrl);
}

