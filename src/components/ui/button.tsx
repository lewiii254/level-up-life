import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90",
        outline: "border border-border bg-transparent hover:bg-muted hover:text-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/90",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        neon: "bg-primary/20 text-primary border border-primary/50 shadow-lg hover:bg-primary/30",
        "neon-purple": "bg-secondary/20 text-secondary border border-secondary/50 shadow-lg hover:bg-secondary/30",
        "neon-cyan": "bg-accent/20 text-accent border border-accent/50 shadow-lg hover:bg-accent/30",
        gaming: "bg-gradient-to-r from-primary to-secondary text-foreground font-semibold shadow-lg hover:scale-105 transition-transform",
        fire: "bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:from-orange-600 hover:to-red-600",
        success: "bg-green-500 text-white font-semibold shadow-lg hover:bg-green-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
