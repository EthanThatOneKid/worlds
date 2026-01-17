import Link from "next/link";
import { ReactNode } from "react";
import Image from "next/image";
import { UserMenu } from "./user-menu";
import { signOutAction } from "@/app/actions";

export function PageHeader({
  email,
  accountId,
  children,
}: {
  email?: string | null;
  accountId?: string | null;
  children?: ReactNode;
}) {
  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4">
      <div className="mx-auto max-w-5xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {children}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="https://wazoo.tech/wazoo.svg"
              alt="Wazoo Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full logo-image"
            />
            <span className="text-lg font-bold text-zinc-900 dark:text-white hover:opacity-80 transition-opacity cursor-pointer">
              Worlds Console
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {accountId && (
            <Link
              href={`/accounts/${accountId}#api-keys`}
              className="text-sm font-medium px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            >
              API Keys
            </Link>
          )}
          <UserMenu
            email={email}
            accountId={accountId}
            onSignOut={signOutAction}
          />
        </div>
      </div>
    </nav>
  );
}
