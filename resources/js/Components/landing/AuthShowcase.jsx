import { Sparkles, Wand2, Layers, Zap, CheckCircle2 } from "lucide-react";

const TESTIMONIALS = [
    {
        quote:
            "Dari brief mentah ke landing page convert dalam 8 menit. Tim sales saya tidak percaya.",
        name: "Maya Santoso",
        role: "Head of Growth, Lumora",
    },
    {
        quote:
            "Convexa mengganti workflow 3 hari jadi satu chat session. Game changer.",
        name: "Reza Pratama",
        role: "Indie maker",
    },
];

const PERKS = [
    { icon: Wand2, label: "Smart brief parser" },
    { icon: Layers, label: "Section regeneration" },
    { icon: Zap, label: "One-click HTML export" },
];

export default function AuthShowcase({
    title = "Build landing pages yang convert dalam menit, bukan hari.",
    subtitle = "AI Sales Page Generator untuk founder, marketer, dan indie maker yang bergerak cepat.",
}) {
    return (
        <div className="relative flex h-full flex-col justify-between overflow-hidden p-10">
            <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-90" />
            <div
                className="pointer-events-none absolute inset-0 bg-grid mask-radial-fade opacity-30"
                aria-hidden
            />
            <div className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 animate-aurora rounded-full bg-accent/40 blur-[100px]" />
            <div className="pointer-events-none absolute -right-10 bottom-1/4 h-80 w-80 animate-aurora rounded-full bg-accent-2/30 blur-[100px] [animation-delay:-7s]" />

            <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    <Sparkles className="h-3 w-3" />
                    AI Sales Page Generator
                </div>
                <h2 className="mt-6 max-w-md text-balance font-display text-3xl font-semibold leading-tight text-text md:text-4xl">
                    {title.split(" ").map((word, i) =>
                        ["convert", "menit", "premium"].includes(word.toLowerCase().replace(/[.,]/g, "")) ? (
                            <span key={i} className="text-gradient">
                                {word}{" "}
                            </span>
                        ) : (
                            <span key={i}>{word} </span>
                        ),
                    )}
                </h2>
                <p className="mt-4 max-w-md text-balance text-sm leading-relaxed text-text-muted">
                    {subtitle}
                </p>

                <ul className="mt-8 space-y-3">
                    {PERKS.map((perk) => (
                        <li
                            key={perk.label}
                            className="flex items-center gap-3 text-sm text-text-muted"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-bg-elevated/60 text-accent shadow-inner-soft">
                                <perk.icon className="h-3.5 w-3.5" />
                            </span>
                            {perk.label}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="relative space-y-4">
                {TESTIMONIALS.map((t) => (
                    <figure
                        key={t.name}
                        className="rounded-2xl border border-border/70 bg-bg-elevated/60 p-4 backdrop-blur-md"
                    >
                        <blockquote className="text-sm leading-relaxed text-text">
                            "{t.quote}"
                        </blockquote>
                        <figcaption className="mt-3 flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-accent text-xs font-semibold text-white shadow-glow">
                                {t.name
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((w) => w[0])
                                    .join("")}
                            </span>
                            <div className="text-xs">
                                <div className="font-medium text-text">
                                    {t.name}
                                </div>
                                <div className="text-text-subtle">{t.role}</div>
                            </div>
                        </figcaption>
                    </figure>
                ))}
                <div className="flex items-center gap-2 text-[11px] text-text-subtle">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent-2" />
                    Trusted by 1,200+ teams shipping landing pages this month
                </div>
            </div>
        </div>
    );
}
