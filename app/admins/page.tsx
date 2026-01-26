import * as authkit from "@workos-inc/authkit-nextjs";
import { AdminList } from "./admin-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Admins",
};

export default async function AdminsPage() {
  const { user } = await authkit.withAuth();

  if (!user) {
    return null;
  }

  const workos = authkit.getWorkOS();

  // List all users
  type WorkOSUser = Awaited<ReturnType<typeof workos.userManagement.getUser>>;
  let allUsers: WorkOSUser[] = [];
  try {
    // WorkOS listUsers returns paginated results
    let cursor: string | undefined;
    do {
      const response = await workos.userManagement.listUsers({
        limit: 100,
        ...(cursor ? { after: cursor } : {}),
      });

      // Fetch full user details to get metadata
      const usersWithMetadata = await Promise.all(
        response.data.map(async (u) => {
          const fullUser = await workos.userManagement.getUser(u.id);
          return fullUser;
        }),
      );

      allUsers = [...allUsers, ...usersWithMetadata];
      cursor = response.listMetadata?.after;
    } while (cursor);
  } catch (e) {
    console.error("Failed to list users", e);
  }

  // Sort users by email
  allUsers = allUsers.sort((a, b) => {
    const emailA = a.email?.toLowerCase() || "";
    const emailB = b.email?.toLowerCase() || "";
    return emailA.localeCompare(emailB);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
          User Management
        </h1>
      </div>
      <p className="text-stone-500 dark:text-stone-400">
        Manage admin status for all users in the system.
      </p>
      <AdminList users={allUsers} />
    </div>
  );
}
