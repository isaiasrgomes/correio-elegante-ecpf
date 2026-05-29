import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-rose-200/70 bg-white/80 px-4 py-2 text-sm text-[#2a1a1f] shadow-sm backdrop-blur-sm transition-all placeholder:text-rose-300/80 focus-visible:border-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
