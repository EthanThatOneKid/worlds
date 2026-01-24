import * as authkit from "@workos-inc/authkit-nextjs";
import { notFound } from "next/navigation";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await authkit.withAuth();

  let currentUser = user;
  if (currentUser) {
    const workos = authkit.getWorkOS();
    currentUser = await workos.userManagement.getUser(currentUser.id);
  }

  if (!currentUser || !currentUser.metadata?.admin) {
    notFound();
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </>
  );
}
