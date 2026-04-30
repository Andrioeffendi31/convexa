import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(
    ({ className, type = "text", ...props }, ref) => (
        <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-lg border border-border bg-bg-elevated/70 px-3 py-2 text-sm text-text shadow-inner-soft placeholder:text-text-subtle focus-visible:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
            ref={ref}
            {...props}
        />
    ),
);
Input.displayName = "Input";

export { Input };
