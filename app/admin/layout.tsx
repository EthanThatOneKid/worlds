import * as authkit from "@workos-inc/authkit-nextjs";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await authkit.withAuth();

  if (!user || !user.metadata?.admin) {
    notFound();
  }

  const isAdmin = !!user.metadata?.admin;

  return (
    <>
      <PageHeader accountId={user.id} isAdmin={isAdmin} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </>
  );
}
