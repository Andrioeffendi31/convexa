export default function FeatureCard({ icon: Icon, title, description, accent = "violet" }) {
    const accentClass =
        accent === "cyan"
            ? "from-accent-2/30 to-transparent"
            : accent === "fuchsia"
            ? "from-fuchsia-500/30 to-transparent"
            : "from-accent/30 to-transparent";

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-bg-elevated/60 p-6 transition hover:border-accent/40 hover:shadow-glow">
            <div
                className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${accentClass} opacity-60 blur-2xl transition group-hover:opacity-100`}
            />
            <div className="relative flex flex-col gap-4">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-bg-subtle text-accent shadow-inner-soft">
                    {Icon ? <Icon className="h-5 w-5" /> : null}
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-text">{title}</h3>
                    <p className="text-sm leading-relaxed text-text-muted">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
