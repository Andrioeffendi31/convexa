import { useMemo } from "react";

import ConversationItem from "./ConversationItem";

function getBucket(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const ts = new Date(date).getTime();
    const diff = today - ts;

    if (ts >= today) return "Today";
    if (ts >= today - 86400000) return "Yesterday";
    if (ts >= today - 7 * 86400000) return "Last 7 days";
    if (ts >= today - 30 * 86400000) return "Last 30 days";
    return "Older";
}

const BUCKET_ORDER = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "Older"];

export default function ConversationList({
    items = [],
    activeId,
    collapsed = false,
    onNavigate,
}) {
    const grouped = useMemo(() => {
        const map = new Map();
        items.forEach((item) => {
            const bucket = getBucket(item.updated_at ?? new Date());
            if (!map.has(bucket)) map.set(bucket, []);
            map.get(bucket).push(item);
        });
        return BUCKET_ORDER.filter((b) => map.has(b)).map((b) => ({
            label: b,
            items: map.get(b),
        }));
    }, [items]);

    if (collapsed) {
        return (
            <div className="space-y-1.5">
                {items.slice(0, 12).map((item) => (
                    <ConversationItem
                        key={item.id}
                        salesPage={item}
                        active={Number(activeId) === Number(item.id)}
                        collapsed
                        onNavigate={onNavigate}
                    />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-xs text-text-subtle">
                Belum ada sales page. Klik{" "}
                <span className="text-text">+ New</span> untuk memulai.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {grouped.map((group) => (
                <div key={group.label} className="space-y-1">
                    <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-subtle">
                        {group.label}
                    </div>
                    <div className="space-y-0.5">
                        {group.items.map((item) => (
                            <ConversationItem
                                key={item.id}
                                salesPage={item}
                                active={Number(activeId) === Number(item.id)}
                                onNavigate={onNavigate}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
