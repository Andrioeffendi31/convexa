import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy, RefreshCcw, Sparkles } from "lucide-react";

function Avatar({ role, userName }) {
    if (role === "assistant") {
        return (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-accent text-white shadow-glow">
                <Sparkles className="h-4 w-4" />
            </div>
        );
    }
    const initials = (userName ?? "U")
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");
    return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-elevated text-xs font-semibold text-text-muted">
            {initials || "U"}
        </div>
    );
}

const markdownComponents = {
    p: ({ node, ...props }) => (
        <p className="mb-3 leading-relaxed last:mb-0" {...props} />
    ),
    ul: ({ node, ...props }) => (
        <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0" {...props} />
    ),
    ol: ({ node, ...props }) => (
        <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0" {...props} />
    ),
    li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
    a: ({ node, ...props }) => (
        <a
            className="text-gradient underline decoration-accent/40 underline-offset-2 transition hover:decoration-accent"
            target="_blank"
            rel="noreferrer"
            {...props}
        />
    ),
    code: ({ node, inline, className, children, ...props }) => {
        if (inline) {
            return (
                <code
                    className="rounded bg-bg-subtle px-1.5 py-0.5 font-mono text-[0.85em] text-accent-2"
                    {...props}
                >
                    {children}
                </code>
            );
        }
        return (
            <code className={`${className ?? ""} block`} {...props}>
                {children}
            </code>
        );
    },
    pre: ({ node, ...props }) => (
        <pre
            className="mb-3 overflow-x-auto rounded-xl border border-border bg-bg-subtle p-4 text-xs leading-relaxed scrollbar-thin last:mb-0"
            {...props}
        />
    ),
    blockquote: ({ node, ...props }) => (
        <blockquote
            className="mb-3 border-l-2 border-accent/40 pl-3 italic text-text-muted last:mb-0"
            {...props}
        />
    ),
    h1: ({ node, ...props }) => (
        <h1 className="mb-2 mt-3 text-lg font-semibold text-text" {...props} />
    ),
    h2: ({ node, ...props }) => (
        <h2 className="mb-2 mt-3 text-base font-semibold text-text" {...props} />
    ),
    h3: ({ node, ...props }) => (
        <h3 className="mb-2 mt-3 text-sm font-semibold text-text" {...props} />
    ),
    table: ({ node, ...props }) => (
        <div className="mb-3 overflow-x-auto last:mb-0">
            <table
                className="w-full border-collapse text-xs"
                {...props}
            />
        </div>
    ),
    th: ({ node, ...props }) => (
        <th
            className="border border-border bg-bg-subtle px-2 py-1 text-left font-semibold"
            {...props}
        />
    ),
    td: ({ node, ...props }) => (
        <td className="border border-border px-2 py-1" {...props} />
    ),
};

export default function ChatMessage({
    message,
    userName,
    onRegenerate,
    showRegenerate = false,
}) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === "user";

    const copyContent = async () => {
        try {
            await navigator.clipboard.writeText(message.content ?? "");
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            // ignore
        }
    };

    return (
        <div
            className={`group flex gap-3 animate-fade-in-scale ${
                isUser ? "flex-row-reverse" : ""
            }`}
        >
            <Avatar role={message.role} userName={userName} />
            <div
                className={`relative flex max-w-[88%] flex-col gap-1 ${
                    isUser ? "items-end" : "items-start"
                }`}
            >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-text-subtle">
                    <span>{isUser ? userName ?? "You" : "Convexa"}</span>
                </div>
                <div
                    className={`relative rounded-2xl px-4 py-3 text-sm ${
                        isUser
                            ? "bg-gradient-to-br from-accent/20 to-accent-2/10 text-text border border-accent/20"
                            : "border border-border/60 bg-bg-elevated/70 text-text"
                    }`}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">
                            {message.content}
                        </p>
                    ) : (
                        <div className="prose-chat">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                                components={markdownComponents}
                            >
                                {message.content ?? ""}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
                <div
                    className={`flex items-center gap-1 opacity-0 transition group-hover:opacity-100 ${
                        isUser ? "self-end" : "self-start"
                    }`}
                >
                    <button
                        type="button"
                        onClick={copyContent}
                        className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-bg-elevated px-2 py-1 text-[11px] text-text-muted transition hover:border-border-strong hover:text-text"
                        title="Copy message"
                    >
                        {copied ? (
                            <>
                                <Check className="h-3 w-3" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-3 w-3" />
                                Copy
                            </>
                        )}
                    </button>
                    {showRegenerate && !isUser && onRegenerate && (
                        <button
                            type="button"
                            onClick={onRegenerate}
                            className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-bg-elevated px-2 py-1 text-[11px] text-text-muted transition hover:border-accent/50 hover:text-accent"
                            title="Regenerate"
                        >
                            <RefreshCcw className="h-3 w-3" />
                            Regenerate
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
