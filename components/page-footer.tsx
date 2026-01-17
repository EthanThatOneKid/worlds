import Link from "next/link";

export function PageFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-8 mt-auto">
      <div className="mx-auto max-w-5xl flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} Worlds Console. All rights reserved.
        </p>
        <div className="flex items-center space-x-6">
          <Link
            href="https://github.com/fartlabs/worlds"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="https://github.com/fartlabs/worlds"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            Documentation
          </Link>
        </div>
      </div>
    </footer>
  );
}
