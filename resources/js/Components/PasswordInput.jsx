import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default forwardRef(function PasswordInput(
    { className = "", isFocused = false, ...props },
    ref,
) {
    const [visible, setVisible] = useState(false);
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <div className="relative">
            <input
                {...props}
                type={visible ? "text" : "password"}
                ref={localRef}
                className={
                    "h-11 w-full rounded-xl border border-border bg-bg-elevated/70 px-3.5 pr-11 text-sm text-text placeholder:text-text-subtle shadow-inner-soft transition focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 " +
                    className
                }
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                tabIndex={-1}
                aria-label={visible ? "Hide password" : "Show password"}
                title={visible ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-text-subtle transition hover:bg-bg-subtle hover:text-text"
            >
                {visible ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </button>
        </div>
    );
});
