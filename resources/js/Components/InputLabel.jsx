export default function InputLabel({
    value,
    className = "",
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                "block text-xs font-medium uppercase tracking-[0.14em] text-text-muted " +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
