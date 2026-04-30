import { Link } from "@inertiajs/react";

export default function ResponsiveNavLink({
    active = false,
    className = "",
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-2 py-2 pe-4 ps-3 text-base font-medium transition focus:outline-none ${
                active
                    ? "border-accent bg-accent/10 text-text"
                    : "border-transparent text-text-muted hover:border-border-strong hover:bg-bg-elevated hover:text-text"
            } ${className}`}
        >
            {children}
        </Link>
    );
}
