import { useEffect, useRef, useState } from "react";

/**
 * Simulates streaming/typing animation by progressively revealing target text.
 * Backend stays synchronous; this just animates an already-fetched string.
 */
export function useStreamingText({
    targetText,
    enabled = true,
    durationMs = 4000,
    onDone,
}) {
    const [displayedText, setDisplayedText] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const rafRef = useRef(null);
    const onDoneRef = useRef(onDone);

    useEffect(() => {
        onDoneRef.current = onDone;
    }, [onDone]);

    useEffect(() => {
        if (!enabled || !targetText) {
            setDisplayedText("");
            setIsStreaming(false);
            return;
        }

        const total = targetText.length;
        const start = performance.now();
        // Cap actual duration based on text length so very long HTML still feels fast.
        const adjustedDuration = Math.min(
            durationMs,
            Math.max(2000, Math.floor(total / 4)),
        );

        setIsStreaming(true);
        setDisplayedText("");

        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(1, elapsed / adjustedDuration);
            // Ease-out cubic for natural deceleration at the end
            const eased = 1 - Math.pow(1 - progress, 3);
            const charsToShow = Math.floor(eased * total);
            setDisplayedText(targetText.slice(0, charsToShow));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                setDisplayedText(targetText);
                setIsStreaming(false);
                if (typeof onDoneRef.current === "function") {
                    onDoneRef.current();
                }
            }
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [targetText, enabled, durationMs]);

    const progress = targetText
        ? Math.min(1, displayedText.length / targetText.length)
        : 0;

    return { displayedText, isStreaming, progress };
}
