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
        <UserMenu
          email={email}
          accountId={accountId}
          onSignOut={signOutAction}
        />
      </div>
    </nav>
  );
}
