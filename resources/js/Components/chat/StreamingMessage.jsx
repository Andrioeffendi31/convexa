import { Sparkles } from "lucide-react";
import TypingDots from "./TypingDots";

export default function StreamingMessage({ label = "Convexa is thinking…" }) {
    return (
        <div className="flex gap-3 animate-fade-in-scale">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-accent text-white shadow-glow animate-pulse-glow">
                <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-1">
                <div className="text-[11px] uppercase tracking-[0.16em] text-text-subtle">
                    Convexa
                </div>
                <div className="inline-flex items-center gap-3 rounded-2xl border border-border/60 bg-bg-elevated/70 px-4 py-3 text-sm text-text-muted">
                    <TypingDots />
                    <span>{label}</span>
                </div>
            </div>
        </div>
    );
}
