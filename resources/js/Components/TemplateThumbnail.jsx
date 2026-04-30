const styles = {
    aurora: {
        frame: "border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-sky-100",
        badge: "bg-amber-100 text-amber-800",
        line: "bg-slate-300",
        block: "bg-white/90 border border-amber-100",
    },
    foundry: {
        frame: "border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-red-700",
        badge: "bg-red-500/20 text-red-100 border border-red-500/40",
        line: "bg-slate-500",
        block: "bg-slate-900/80 border border-slate-700",
    },
    studio: {
        frame: "border-rose-200/60 bg-gradient-to-br from-rose-50 via-white to-indigo-100",
        badge: "bg-violet-100 text-violet-700",
        line: "bg-slate-300",
        block: "bg-white/90 border border-rose-100",
    },
};

export default function TemplateThumbnail({
    templateKey,
    name,
    description,
    active,
    onClick,
}) {
    const style = styles[templateKey] ?? styles.aurora;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl border p-2 text-left transition ${
                active
                    ? "border-accent/60 ring-2 ring-accent/30 shadow-glow"
                    : "border-border hover:border-border-strong"
            }`}
        >
            <div
                className={`h-24 rounded-lg p-2 shadow-sm ${style.frame}`}
                aria-hidden="true"
            >
                <div
                    className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}
                >
                    {name}
                </div>
                <div className="mt-2 space-y-1.5">
                    <div className={`h-1.5 w-4/5 rounded ${style.line}`} />
                    <div className={`h-1.5 w-3/5 rounded ${style.line}`} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <div className={`h-6 rounded ${style.block}`} />
                    <div className={`h-6 rounded ${style.block}`} />
                </div>
            </div>
            <div className="mt-2 text-xs font-medium text-text">{name}</div>
            <div className="mt-0.5 line-clamp-2 text-[11px] text-text-muted">
                {description}
            </div>
        </button>
    );
}
