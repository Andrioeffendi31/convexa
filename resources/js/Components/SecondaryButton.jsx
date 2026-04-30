export default function SecondaryButton({
    type = "button",
    className = "",
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            disabled={disabled}
            className={
                `inline-flex h-11 items-center justify-center rounded-xl border border-border bg-bg-elevated/70 px-4 text-sm font-medium text-text transition hover:border-border-strong hover:bg-bg-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50 ` +
                className
            }
        >
            {children}
        </button>
    );
}
