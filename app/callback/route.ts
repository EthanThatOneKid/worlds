import * as authkit from "@workos-inc/authkit-nextjs";

export const GET = authkit.handleAuth({
  returnPathname: "/",
});
