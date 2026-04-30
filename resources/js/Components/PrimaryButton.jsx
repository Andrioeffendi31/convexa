export default function PrimaryButton({
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
                `inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-accent px-5 text-sm font-medium text-white shadow-[0_8px_24px_-12px_hsl(var(--accent)/0.6)] transition hover:shadow-glow active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ` +
                className
            }
        >
            {children}
        </button>
    );
}
