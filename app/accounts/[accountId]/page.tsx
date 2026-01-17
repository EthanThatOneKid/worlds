import * as authkit from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { DeleteAccountSection } from "@/components/delete-account-section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
};

export default async function AccountPage() {
  const { user } = await authkit.withAuth();

  if (!user) {
    const signInUrl = await authkit.getSignInUrl();
    redirect(signInUrl);
  }

  return (
    <>
      <PageHeader accountId={user.id} />

      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-6 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          <span>My Worlds</span>
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
          Account
        </h1>

        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
              Profile Information
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Your account details.
            </p>
          </div>
          <dl className="divide-y divide-zinc-200 dark:divide-zinc-800">
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Email
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 sm:mt-0 sm:col-span-2">
                {user.email}
              </dd>
            </div>
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                User ID
              </dt>
              <dd className="mt-1 text-sm font-mono text-zinc-900 dark:text-zinc-100 sm:mt-0 sm:col-span-2 break-all">
                {user.id}
              </dd>
            </div>
            {user.firstName && (
              <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  First Name
                </dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 sm:mt-0 sm:col-span-2">
                  {user.firstName}
                </dd>
              </div>
            )}
            {user.lastName && (
              <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Last Name
                </dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 sm:mt-0 sm:col-span-2">
                  {user.lastName}
                </dd>
              </div>
            )}
          </dl>
        </div>
        <DeleteAccountSection userEmail={user.email} />
      </div>
    </>
  );
}
