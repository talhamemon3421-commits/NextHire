import React from "react";
import { cn } from "@/shared/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-400/60 disabled:opacity-60 disabled:cursor-not-allowed",
        variant === "primary" &&
          "bg-sky-500 text-white hover:bg-sky-400 active:bg-sky-500/90",
        variant === "ghost" &&
          "bg-white/5 text-white/90 hover:bg-white/10",
        className
      )}
      {...props}
    />
  );
}

