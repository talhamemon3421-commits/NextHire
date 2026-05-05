import React from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ className, label, hint, error, ...props }: Props) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-1 text-xs font-semibold tracking-wide text-white/70">
          {label}
        </div>
      ) : null}
      <input
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition",
          "focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20",
          error ? "border-rose-400/60 focus:border-rose-300/80" : "",
          className
        )}
        {...props}
      />
      {error ? (
        <div className="mt-1 text-xs text-rose-300">{error}</div>
      ) : hint ? (
        <div className="mt-1 text-xs text-white/45">{hint}</div>
      ) : null}
    </label>
  );
}

