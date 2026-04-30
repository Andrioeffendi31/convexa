import { useEffect, useRef, useState } from "react";
import { Sparkles, Code2, Eye } from "lucide-react";

const SCRIPT = [
    {
        role: "user",
        text: "Buat hero section premium untuk SaaS analytics dengan CTA menonjol.",
    },
    {
        role: "assistant",
        text: "Generating hero with gradient background, bold headline, dual CTA buttons, and trust badges...",
    },
];

const CODE_LINES = [
    { tag: "<section", className: "text-accent" },
    { tag: " class=", className: "text-text-muted" },
    { tag: '"hero relative overflow-hidden"', className: "text-emerald-300" },
    { tag: ">", className: "text-accent" },
    { tag: "\n  ", className: "" },
    { tag: "<div", className: "text-accent" },
    { tag: " class=", className: "text-text-muted" },
    { tag: '"aurora-bg"', className: "text-emerald-300" },
    { tag: "/>", className: "text-accent" },
    { tag: "\n  ", className: "" },
    { tag: "<h1>", className: "text-accent" },
    { tag: "Ship insights ", className: "text-text" },
    { tag: "10×", className: "text-accent-2 font-semibold" },
    { tag: " faster", className: "text-text" },
    { tag: "</h1>", className: "text-accent" },
    { tag: "\n  ", className: "" },
    { tag: "<button", className: "text-accent" },
    { tag: " class=", className: "text-text-muted" },
    { tag: '"btn-primary"', className: "text-emerald-300" },
    { tag: ">", className: "text-accent" },
    { tag: "Get started →", className: "text-text" },
    { tag: "</button>", className: "text-accent" },
    { tag: "\n", className: "" },
    { tag: "</section>", className: "text-accent" },
];

const FULL_TEXT = CODE_LINES.map((c) => c.tag).join("");

export default function LandingHeroDemo() {
    const [typed, setTyped] = useState("");
    const [phase, setPhase] = useState("typing"); // "typing" | "pause" | "reset"
    const rafRef = useRef(null);
    const startRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        const tick = (ts) => {
            if (cancelled) return;
            if (!startRef.current) startRef.current = ts;
            const elapsed = ts - startRef.current;

            if (phase === "typing") {
                // ~16 chars per 100ms -> total ~1.5s for FULL_TEXT
                const target = Math.min(
                    FULL_TEXT.length,
                    Math.floor((elapsed / 1000) * (FULL_TEXT.length / 4)),
                );
                setTyped(FULL_TEXT.slice(0, target));
                if (target >= FULL_TEXT.length) {
                    setPhase("pause");
                    startRef.current = null;
                    return;
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        if (phase === "typing") {
            rafRef.current = requestAnimationFrame(tick);
        } else if (phase === "pause") {
            const t = setTimeout(() => {
                setTyped("");
                startRef.current = null;
                setPhase("typing");
            }, 3500);
            return () => clearTimeout(t);
        }

        return () => {
            cancelled = true;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [phase]);

    // render typed substring with class spans by walking CODE_LINES
    const renderColored = () => {
        let remaining = typed.length;
        const out = [];
        for (let i = 0; i < CODE_LINES.length; i++) {
            const seg = CODE_LINES[i];
            if (remaining <= 0) break;
            const take = Math.min(remaining, seg.tag.length);
            const slice = seg.tag.slice(0, take);
            out.push(
                <span key={i} className={seg.className}>
                    {slice}
                </span>,
            );
            remaining -= take;
        }
        return out;
    };

    return (
        <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-accent opacity-20 blur-xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-bg-elevated/80 shadow-premium backdrop-blur-xl">
                {/* Window chrome */}
                <div className="flex items-center gap-2 border-b border-border/60 bg-bg-subtle/60 px-4 py-3">
                    <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <div className="ml-3 flex items-center gap-2 text-xs text-text-subtle">
                        <Sparkles className="h-3.5 w-3.5 text-accent" />
                        <span className="font-mono">convexa / hero.html</span>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                            Generating
                        </span>
                    </div>
                </div>

                {/* Chat snippet */}
                <div className="space-y-3 border-b border-border/60 px-5 py-4">
                    {SCRIPT.map((m, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
                        >
                            {m.role === "assistant" && (
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-accent text-white shadow-glow">
                                    <Sparkles className="h-3.5 w-3.5" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                                    m.role === "user"
                                        ? "bg-bg-subtle text-text"
                                        : "border border-border/60 bg-bg/40 text-text-muted"
                                }`}
                            >
                                {m.text}
                            </div>
                            {m.role === "user" && (
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-subtle text-[11px] font-semibold text-text-muted">
                                    You
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Code panel */}
                <div className="grid grid-cols-[auto_1fr] gap-0">
                    <div className="select-none border-r border-border/60 bg-bg-subtle/40 px-3 py-4 text-right font-mono text-[11px] leading-6 text-text-subtle">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i}>{i + 1}</div>
                        ))}
                    </div>
                    <pre className="overflow-hidden px-4 py-4 font-mono text-[12px] leading-6 text-text">
                        <code className="whitespace-pre-wrap">
                            {renderColored()}
                            <span className="ml-0.5 inline-block h-3.5 w-1.5 -translate-y-px animate-caret-blink bg-accent align-middle" />
                        </code>
                    </pre>
                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between border-t border-border/60 bg-bg-subtle/40 px-4 py-2.5 text-[11px] text-text-subtle">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5">
                            <Code2 className="h-3 w-3 text-accent" />
                            HTML
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Eye className="h-3 w-3 text-accent-2" />
                            Live preview
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-24 overflow-hidden rounded-full bg-bg">
                            <div
                                className="h-full bg-gradient-accent transition-all"
                                style={{
                                    width: `${Math.min(100, (typed.length / FULL_TEXT.length) * 100)}%`,
                                }}
                            />
                        </div>
                        <span className="font-mono">
                            {Math.round((typed.length / FULL_TEXT.length) * 100)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
