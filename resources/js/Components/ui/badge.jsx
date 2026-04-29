import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700",
    {
        variants: {
            variant: {
                default: "bg-slate-50",
                amber: "border-amber-200 bg-amber-50 text-amber-800",
                slate: "border-slate-200 bg-slate-100 text-slate-700",
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
