import { Sparkles, Wand2, Layers, MessageSquare, Zap } from "lucide-react";

const SUGGESTIONS = [
    {
        icon: Wand2,
        title: "Improve hero copy",
        prompt: "Improve hero copy and visual hierarchy for enterprise buyers.",
    },
    {
        icon: Layers,
        title: "Premium look",
        prompt: "Make this look more premium with better typography and spacing.",
    },
    {
        icon: Zap,
        title: "Stronger CTA",
        prompt: "Strengthen pricing section and make CTA more conversion-focused.",
    },
    {
        icon: MessageSquare,
        title: "Add social proof",
        prompt: "Add modern social proof block with testimonial cards.",
    },
];

export default function ChatEmptyState({ onSuggestion }) {
    return (
        <div className="relative flex flex-col items-center justify-center px-6 py-12 text-center">
            <div
                className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-50"
                aria-hidden
            />
            <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-accent shadow-glow animate-float">
                    <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-balance text-2xl font-semibold text-text">
                    Welcome ke{" "}
                    <span className="text-gradient">Convexa Workspace</span>
                </h2>
                <p className="mx-auto mt-3 max-w-md text-balance text-sm text-text-muted">
                    AI siap merancang sales page Anda. Mulai dari saran di bawah
                    atau ketik instruksi langsung.
                </p>
                <div className="mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
                    {SUGGESTIONS.map((s) => (
                        <button
                            key={s.title}
                            type="button"
                            onClick={() => onSuggestion?.(s.prompt)}
                            className="group flex items-start gap-3 rounded-xl border border-border/60 bg-bg-elevated/60 p-3 text-left text-sm transition hover:border-accent/50 hover:shadow-glow"
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-subtle text-accent transition group-hover:bg-accent/10">
                                <s.icon className="h-4 w-4" />
                            </span>
                            <span className="flex-1">
                                <span className="block text-xs font-semibold text-text">
                                    {s.title}
                                </span>
                                <span className="mt-0.5 block text-xs leading-snug text-text-muted">
                                    {s.prompt}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
