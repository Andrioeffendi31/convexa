import { Link } from "@inertiajs/react";
import { MoreHorizontal } from "lucide-react";

export default function ConversationItem({
    salesPage,
    active = false,
    collapsed = false,
    onNavigate,
}) {
    const initials = (salesPage.product_name ?? "S")
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("") || "S";

    if (collapsed) {
        return (
            <Link
                href={route("sales-pages.show", salesPage.id)}
                onClick={onNavigate}
                title={salesPage.product_name}
                className={`flex h-10 w-full items-center justify-center rounded-lg text-xs font-semibold transition ${
                    active
                        ? "bg-gradient-accent text-white shadow-glow"
                        : "border border-border/60 bg-bg-elevated/50 text-text-muted hover:border-border-strong hover:text-text"
                }`}
            >
                {initials}
            </Link>
        );
    }

    return (
        <div className="group relative">
            <Link
                href={route("sales-pages.show", salesPage.id)}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active
                        ? "bg-gradient-to-r from-accent/15 to-transparent text-text"
                        : "text-text-muted hover:bg-bg-elevated/60 hover:text-text"
                }`}
            >
                {active && (
                    <span
                        className="absolute left-0 top-1/2 h-5 -translate-y-1/2 w-0.5 rounded-r-full bg-gradient-accent"
                        aria-hidden
                    />
                )}
                <span className="flex-1 truncate">
                    {salesPage.product_name || "Untitled page"}
                </span>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    className="hidden h-6 w-6 items-center justify-center rounded-md text-text-subtle transition hover:bg-bg-subtle hover:text-text group-hover:flex"
                    aria-label="Conversation actions"
                    title="More actions"
                >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
            </Link>
        </div>
    );
}
