export default function DangerButton({
    className = "",
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={
                `inline-flex h-11 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/15 px-4 text-sm font-medium text-red-300 transition hover:bg-red-500/25 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-50 ` +
                className
            }
        >
            {children}
        </button>
    );
}
