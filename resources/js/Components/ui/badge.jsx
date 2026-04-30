import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
    {
        variants: {
            variant: {
                default:
                    "border-border bg-bg-elevated text-text-muted",
                amber: "border-accent/30 bg-accent/10 text-accent",
                slate: "border-border bg-bg-subtle text-text-muted",
                gradient:
                    "border-transparent bg-gradient-accent text-white shadow-[0_4px_16px_-8px_hsl(var(--accent)/0.6)]",
                outline:
                    "border-border-strong bg-transparent text-text-muted",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

function Badge({ className, variant, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant, className }))} {...props} />
    );
}

export { Badge, badgeVariants };
