export default function Checkbox({ className = "", ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                "h-4 w-4 rounded border-border bg-bg-elevated text-accent shadow-inner-soft focus:ring-2 focus:ring-accent/40 focus:ring-offset-0 " +
                className
            }
        />
    );
}
