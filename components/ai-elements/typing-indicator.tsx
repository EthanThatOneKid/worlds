"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type TypingIndicatorProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * The text to display alongside the typing indicator
   * @default "AI is thinking..."
   */
  label?: string;
  /**
   * Size of the typing dots
   * @default 1.5 (in rem units, which translates to size-1.5 in Tailwind)
   */
  dotSize?: number;
  /**
   * Color variant for the typing indicator
   * @default "amber"
   */
  variant?: "amber" | "blue" | "emerald" | "purple" | "stone";
};

const variantColors = {
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  purple: "bg-purple-500",
  stone: "bg-stone-500",
};

export const TypingIndicator = ({
  className,
  label = "AI is thinking...",
  dotSize = 1.5,
  variant = "amber",
  ...props
}: TypingIndicatorProps) => {
  const dotColor = variantColors[variant];
  const sizeInRem = dotSize;
  const sizeStyle = {
    width: `${sizeInRem * 0.25}rem`,
    height: `${sizeInRem * 0.25}rem`,
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 text-xs font-medium text-stone-500 dark:text-stone-400 tracking-wide",
        className,
      )}
      {...props}
    >
      <div className="flex gap-1">
        <span
          className={cn(
            "rounded-full animate-bounce",
            dotColor,
            "[animation-delay:-0.3s]",
          )}
          style={sizeStyle}
        />
        <span
          className={cn(
            "rounded-full animate-bounce",
            dotColor,
            "[animation-delay:-0.15s]",
          )}
          style={sizeStyle}
        />
        <span
          className={cn("rounded-full animate-bounce", dotColor)}
          style={sizeStyle}
        />
      </div>
      {label && <span>{label}</span>}
    </div>
  );
};
