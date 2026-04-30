import { useMemo } from "react";
import { Check, Sparkles } from "lucide-react";

const SECTION_PATTERNS = [
    { id: "hero", label: "Hero", regex: /<(?:section|header|div)[^>]*(?:id|class)\s*=\s*["'][^"']*hero[^"']*["']/i },
    { id: "features", label: "Features", regex: /<section[^>]*(?:id|class)\s*=\s*["'][^"']*(?:feature|benefit)[^"']*["']/i },
    { id: "pricing", label: "Pricing", regex: /<section[^>]*(?:id|class)\s*=\s*["'][^"']*(?:pricing|price)[^"']*["']/i },
    { id: "testimonial", label: "Testimonials", regex: /<section[^>]*(?:id|class)\s*=\s*["'][^"']*(?:testimonial|review|social)[^"']*["']/i },
    { id: "cta", label: "Call to action", regex: /<section[^>]*(?:id|class)\s*=\s*["'][^"']*(?:cta|call-to-action)[^"']*["']/i },
    { id: "faq", label: "FAQ", regex: /<section[^>]*(?:id|class)\s*=\s*["'][^"']*(?:faq|question)[^"']*["']/i },
    { id: "footer", label: "Footer", regex: /<footer/i },
];

export default function GenerationProgress({
    text = "",
    progress = 0,
    label = "Generating sales page",
}) {
    const stats = useMemo(() => {
        const lines = text.split("\n").length;
        const chars = text.length;
        const tokens = Math.ceil(chars / 4);
        return { lines, chars, tokens };
    }, [text]);

    const sectionsDetected = useMemo(() => {
        return SECTION_PATTERNS.map((s) => ({
            ...s,
            done: s.regex.test(text),
        }));
    }, [text]);

    const pct = Math.round(progress * 100);

    return (
        <div className="rounded-2xl border border-border/70 bg-bg-elevated/80 p-4 shadow-premium backdrop-blur-xl">
            <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent text-white shadow-glow animate-pulse-glow">
                    <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text">
                            {label}
                        </span>
                        <span className="font-mono text-xs text-text-muted">
                            {pct}%
                        </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-subtle">
                        <div
                            className="relative h-full rounded-full bg-gradient-accent transition-all"
                            style={{ width: `${pct}%` }}
                        >
                            <span className="absolute inset-0 shimmer-bg opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-subtle">
                <span className="font-mono">{stats.lines} lines</span>
                <span className="font-mono">{stats.chars} chars</span>
                <span className="font-mono">~{stats.tokens} tokens</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
                {sectionsDetected.map((s) => (
                    <span
                        key={s.id}
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition ${
                            s.done
                                ? "border-accent-2/40 bg-accent-2/10 text-accent-2"
                                : "border-border/60 bg-bg-subtle text-text-subtle"
                        }`}
                    >
                        {s.done ? (
                            <Check className="h-3 w-3" />
                        ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-text-subtle/50" />
                        )}
                        {s.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
