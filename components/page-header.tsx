import Link from "next/link";
import { ReactNode } from "react";
import { UserMenu } from "./user-menu";
import { signOutAction } from "@/app/actions";

export function PageHeader({
  email,
  children,
}: {
  email?: string | null;
  children?: ReactNode;
}) {
  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4">
      <div className="mx-auto max-w-5xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {children}
          <Link
            href="/"
            className="text-lg font-bold text-zinc-900 dark:text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            Worlds Console
          </Link>
        </div>
        <UserMenu email={email} onSignOut={signOutAction} />
      </div>
    </nav>
  );
}
