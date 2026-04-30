import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
    <textarea
        className={cn(
            "min-h-[96px] w-full rounded-xl border border-border bg-bg-elevated/70 px-3 py-2 text-sm text-text placeholder:text-text-subtle shadow-inner-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50",
            className,
        )}
        ref={ref}
        {...props}
    />
));
Textarea.displayName = "Textarea";

export { Textarea };
