import { Link } from "@inertiajs/react";

export default function NavLink({
    active = false,
    className = "",
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition focus:outline-none " +
                (active
                    ? "border-accent text-text"
                    : "border-transparent text-text-muted hover:border-border-strong hover:text-text") +
                " " +
                className
            }
        >
            {children}
        </Link>
    );
}
