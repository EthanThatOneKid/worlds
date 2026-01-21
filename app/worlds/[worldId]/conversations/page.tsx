import { ComingSoonPlaceholder } from "@/components/coming-soon-placeholder";

export default function WorldConversationsPage() {
  return (
    <ComingSoonPlaceholder
      title="Conversations - Coming soon"
      description="A chat interface for your worlds is currently under development."
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-amber-600 dark:text-amber-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3h9m-9 3h3m-6.75 4.125a3 3 0 0 0 3 3h7.5a3 3 0 0 0 3-3V7.5a3 3 0 0 0-3-3h-7.5a3 3 0 0 0-3 3v10.625Z"
          />
        </svg>
      }
    />
  );
}
