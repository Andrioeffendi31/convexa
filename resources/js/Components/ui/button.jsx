import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-accent text-white shadow-[0_8px_24px_-12px_hsl(var(--accent)/0.6)] hover:shadow-glow active:translate-y-px",
                secondary:
                    "bg-bg-elevated text-text border border-border hover:bg-bg-subtle hover:border-border-strong",
                ghost: "text-text-muted hover:bg-bg-elevated hover:text-text",
                outline:
                    "border border-border bg-transparent text-text hover:bg-bg-elevated hover:border-border-strong",
                destructive:
                    "bg-red-600 text-white hover:bg-red-500 active:bg-red-700",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 px-3 text-xs",
                lg: "h-11 px-6",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

const Button = React.forwardRef(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    },
);
Button.displayName = "Button";

export { Button, buttonVariants };
