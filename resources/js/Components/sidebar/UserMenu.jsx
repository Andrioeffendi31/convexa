import { Link } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { ChevronUp, LogOut, User } from "lucide-react";

export default function UserMenu({ user, collapsed = false, onNavigate }) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const initials = (user?.name ?? "U")
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");

    if (collapsed) {
        return (
            <div ref={wrapperRef} className="relative">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="flex h-10 w-full items-center justify-center rounded-lg bg-gradient-accent text-sm font-semibold text-white shadow-glow"
                    title={user?.name}
                >
                    {initials || "U"}
                </button>
                {open && (
                    <div className="absolute bottom-full left-0 mb-2 w-44 overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-premium">
                        <MenuItems user={user} onNavigate={onNavigate} />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center gap-3 rounded-xl border border-border/70 bg-bg-elevated/60 p-2.5 text-left transition hover:border-border-strong hover:bg-bg-subtle"
            >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-accent text-sm font-semibold text-white shadow-glow">
                    {initials || "U"}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-text">
                        {user?.name}
                    </span>
                    <span className="block truncate text-xs text-text-subtle">
                        {user?.email}
                    </span>
                </span>
                <ChevronUp
                    className={`h-4 w-4 text-text-muted transition ${
                        open ? "rotate-0" : "rotate-180"
                    }`}
                />
            </button>
            {open && (
                <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-premium">
                    <MenuItems user={user} onNavigate={onNavigate} />
                </div>
            )}
        </div>
    );
}

function MenuItems({ user, onNavigate }) {
    return (
        <div className="p-1">
            <Link
                href={route("profile.edit")}
                onClick={onNavigate}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-muted transition hover:bg-bg-subtle hover:text-text"
            >
                <User className="h-4 w-4" />
                Profile
            </Link>
            <Link
                href={route("logout")}
                method="post"
                as="button"
                onClick={onNavigate}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
            >
                <LogOut className="h-4 w-4" />
                Log out
            </Link>
        </div>
    );
}
