import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/25 hover:scale-[1.03] hover:shadow-xl hover:shadow-rose-500/35 active:scale-[0.98]",
        secondary:
          "border border-rose-200/80 bg-white/70 text-rose-700 backdrop-blur-md hover:bg-white hover:scale-[1.02] hover:shadow-md",
        ghost:
          "text-rose-700 hover:bg-rose-50/80 hover:text-rose-800",
        outline:
          "border border-rose-300/60 bg-transparent text-rose-700 hover:bg-rose-50/60",
        destructive: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 rounded-full px-4 text-xs",
        lg: "h-14 rounded-full px-8 text-base",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
