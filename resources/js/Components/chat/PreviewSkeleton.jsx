import { useMemo } from "react";

const SECTIONS = [
    { id: "hero", label: "Hero", regex: /<(?:section|header|div)[^>]*(?:id|class)\s*=\s*["'][^"']*hero[^"']*["']/i, height: "h-32" },
    { id: "features", label: "Features", regex: /<section[^>]*(?:id|class)\s*=\s*["'][^"']*(?:feature|benefit)[^"']*["']/i, height: "h-28" },
    { id: "pricing", label: "Pricing", regex: /<section[^>]*(?:id|class)\s*=\s*["'][^"']*(?:pricing|price)[^"']*["']/i, height: "h-24" },
    { id: "testimonial", label: "Testimonials", regex: /<section[^>]*(?:id|class)\s*=\s*["'][^"']*(?:testimonial|review|social)[^"']*["']/i, height: "h-24" },
    { id: "cta", label: "Call to action", regex: /<section[^>]*(?:id|class)\s*=\s*["'][^"']*(?:cta|call-to-action)[^"']*["']/i, height: "h-20" },
];

export default function PreviewSkeleton({ text = "" }) {
    const sections = useMemo(
        () =>
            SECTIONS.map((s) => ({ ...s, done: s.regex.test(text) })),
        [text],
    );
    const active = sections.find((s) => !s.done) ?? null;

    return (
        <div className="space-y-3 p-6">
            {sections.map((s) => (
                <div
                    key={s.id}
                    className={`relative overflow-hidden rounded-xl border transition ${
                        s.done
                            ? "border-accent-2/30 bg-accent-2/5"
                            : active && active.id === s.id
                              ? "border-accent/40 bg-accent/5 animate-pulse-glow"
                              : "border-border/50 bg-bg-elevated/40"
                    } ${s.height}`}
                >
                    <div className="absolute left-3 top-2 text-[10px] font-medium uppercase tracking-widest text-text-subtle">
                        {s.label}
                    </div>
                    {!s.done && active?.id === s.id && (
                        <div className="absolute inset-0 shimmer-bg opacity-30" />
                    )}
                </div>
            ))}
        </div>
    );
}
