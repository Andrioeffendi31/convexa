import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

import TypingDots from "./TypingDots";

const QUICK_PROMPTS = [
    "Improve hero copy",
    "Make it more premium",
    "Stronger CTA",
    "Add testimonials",
];

const QUICK_PROMPT_FULL = {
    "Improve hero copy":
        "Improve hero copy and visual hierarchy for enterprise buyers.",
    "Make it more premium":
        "Make this look more premium with better typography and spacing.",
    "Stronger CTA":
        "Strengthen pricing section and make CTA more conversion-focused.",
    "Add testimonials": "Add modern social proof block with testimonial cards.",
};

export default function ChatComposer({
    value,
    onChange,
    onSubmit,
    isSending,
    disabled = false,
}) {
    const textareaRef = useRef(null);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "0px";
        const max = 200;
        const next = Math.min(max, el.scrollHeight);
        el.style.height = `${Math.max(56, next)}px`;
    }, [value]);

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            if (!isSending && value.trim()) onSubmit();
        }
    };

    const handleQuickPrompt = (key) => {
        onChange(QUICK_PROMPT_FULL[key] ?? key);
        textareaRef.current?.focus();
    };

    const showQuickPrompts = !value.trim() && !isSending;

    return (
        <div className="space-y-2">
            {showQuickPrompts && (
                <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => handleQuickPrompt(p)}
                            className="rounded-full border border-border/60 bg-bg-elevated/60 px-3 py-1 text-xs text-text-muted transition hover:border-accent/40 hover:text-text"
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            <div className="group relative rounded-2xl border border-border bg-bg-elevated/70 backdrop-blur-md transition focus-within:border-accent/60 focus-within:shadow-glow">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder="Contoh: Buat hero lebih premium, tambahkan social proof card, dan optimasi pricing section."
                    rows={2}
                    className="block w-full resize-none rounded-2xl border-none bg-transparent px-4 py-3.5 pr-14 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-0 disabled:opacity-50"
                />
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={disabled || isSending || !value.trim()}
                    className="absolute bottom-2.5 right-2.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-accent text-white shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Send message"
                    title="Send (⌘/Ctrl + Enter)"
                >
                    {isSending ? (
                        <TypingDots className="text-white" />
                    ) : (
                        <ArrowUp className="h-4 w-4" />
                    )}
                </button>
            </div>

            <div className="flex items-center justify-between px-1 text-[11px] text-text-subtle">
                <span>Press ⌘/Ctrl + Enter to send</span>
                <span>{value.length} chars</span>
            </div>
        </div>
    );
}
