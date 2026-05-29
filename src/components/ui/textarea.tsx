import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[140px] w-full rounded-2xl border border-rose-200/70 bg-white/80 px-4 py-3 text-sm text-[#2a1a1f] shadow-sm backdrop-blur-sm transition-all placeholder:text-rose-300/80 focus-visible:border-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/40 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
