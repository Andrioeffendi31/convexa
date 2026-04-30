import { useEffect, useRef } from "react";

export function useReveal(options = {}) {
    const ref = useRef(null);
    const { threshold = 0.15, rootMargin = "0px 0px -8% 0px", once = true } =
        options;

    useEffect(() => {
        const node = ref.current;
        if (!node || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        if (once) observer.unobserve(entry.target);
                    } else if (!once) {
                        entry.target.classList.remove("is-visible");
                    }
                });
            },
            { threshold, rootMargin },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [threshold, rootMargin, once]);

    return ref;
}
