import { useEffect, useMemo, useRef, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { ChevronDown, Download, ExternalLink, FileCode2, History, Layers } from "lucide-react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";

import ChatMessage from "@/Components/chat/ChatMessage";
import ChatComposer from "@/Components/chat/ChatComposer";
import ChatEmptyState from "@/Components/chat/ChatEmptyState";
import StreamingMessage from "@/Components/chat/StreamingMessage";
import GenerationProgress from "@/Components/chat/GenerationProgress";
import PreviewSkeleton from "@/Components/chat/PreviewSkeleton";
import { useStreamingText } from "@/hooks/useStreamingText";

const listText = (items = []) => (items.length ? items.join(", ") : "-");

function formatDate(value) {
    if (!value) return "";
    return new Date(value).toLocaleString();
}

function truncateText(value, limit = 52) {
    if (!value) return "Untitled update";
    return value.length > limit ? `${value.slice(0, limit)}...` : value;
}

export default function Chat({ salesPage, messages, versions }) {
    const userName = usePage().props.auth.user?.name;
    const [chatMessages, setChatMessages] = useState(messages ?? []);
    const [versionList, setVersionList] = useState(versions ?? []);
    const [activeVersionId, setActiveVersionId] = useState(
        salesPage.active_version_id,
    );
    const [previewHtml, setPreviewHtml] = useState(salesPage.html_content ?? "");
    const [generationMeta, setGenerationMeta] = useState(
        salesPage.generation_meta ?? null,
    );
    const [prompt, setPrompt] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isRetryingInitial, setIsRetryingInitial] = useState(false);
    const [isSwitchingVersion, setIsSwitchingVersion] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [retryError, setRetryError] = useState("");
    const [autoRetried, setAutoRetried] = useState(false);
    const [leftPaneWidth, setLeftPaneWidth] = useState(40);
    const [isResizing, setIsResizing] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [viewMode, setViewMode] = useState("preview");
    const [draftHtml, setDraftHtml] = useState(salesPage.html_content ?? "");
    const [isSavingCode, setIsSavingCode] = useState(false);
    const [codeStatus, setCodeStatus] = useState("");
    const [codeError, setCodeError] = useState("");

    // Streaming animation state
    const [streamTarget, setStreamTarget] = useState("");

    const splitRef = useRef(null);
    const chatListRef = useRef(null);

    const shouldAutoGenerate =
        !generationMeta || generationMeta?.status === "failed";
    const isGenerating = isRetryingInitial || isSending;

    const { displayedText: streamedHtml, isStreaming, progress } =
        useStreamingText({
            targetText: streamTarget,
            enabled: !!streamTarget,
            durationMs: 6000,
            onDone: () => {
                setPreviewHtml(streamTarget);
                setDraftHtml(streamTarget);
                // Auto-switch to preview after streaming completes
                setTimeout(() => {
                    setViewMode("preview");
                    setStreamTarget("");
                }, 800);
            },
        });

    // While streaming, show progressive text in CodeMirror
    const codeMirrorValue = isStreaming ? streamedHtml : draftHtml;

    const activeVersionLabel = useMemo(
        () =>
            versionList.find((v) => Number(v.id) === Number(activeVersionId))
                ?.version_number ?? "?",
        [versionList, activeVersionId],
    );

    const startStream = (targetHtml) => {
        if (!targetHtml) return;
        setViewMode("code");
        setStreamTarget(targetHtml);
    };

    const sendMessage = async (messageText = null) => {
        const finalMessage = (messageText ?? prompt).trim();
        if (!finalMessage) return;

        setErrorMessage("");
        setIsSending(true);

        try {
            const response = await window.axios.post(
                route("sales-pages.chat.send", salesPage.id),
                {
                    message: finalMessage,
                    version_id: activeVersionId,
                },
            );

            const newMessages = response.data.messages ?? [];
            const version = response.data.version;

            if (newMessages.length > 0) {
                setChatMessages((state) => [...state, ...newMessages]);
            }

            if (version) {
                setActiveVersionId(version.id);
                setVersionList((state) => [version, ...state]);
                startStream(version.html_content ?? "");
            }

            setGenerationMeta(response.data.generation_meta ?? null);
            setPrompt("");
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message ??
                    "Failed to process chat message.",
            );
        } finally {
            setIsSending(false);
        }
    };

    const retryInitialGeneration = async () => {
        setRetryError("");
        setIsRetryingInitial(true);

        try {
            const response = await window.axios.post(
                route("sales-pages.retry-initial", salesPage.id),
            );

            const newMessages = response.data.messages ?? [];
            const version = response.data.version;

            if (newMessages.length > 0) {
                setChatMessages((state) => [...state, ...newMessages]);
            }

            if (version) {
                setActiveVersionId(version.id);
                setVersionList((state) => [version, ...state]);
                startStream(version.html_content ?? "");
            }

            setGenerationMeta(response.data.generation_meta ?? null);
        } catch (error) {
            setRetryError(
                error.response?.data?.message ??
                    "Failed to regenerate the initial draft.",
            );
        } finally {
            setIsRetryingInitial(false);
        }
    };

    const activateVersion = async (versionId) => {
        if (!versionId || Number(versionId) === Number(activeVersionId)) return;

        setIsSwitchingVersion(true);
        setErrorMessage("");

        try {
            const response = await window.axios.post(
                route("sales-pages.versions.activate", salesPage.id),
                {
                    version_id: Number(versionId),
                },
            );

            const version = response.data.version;
            if (version) {
                setPreviewHtml(version.html_content ?? "");
                setDraftHtml(version.html_content ?? "");
                setActiveVersionId(version.id);
                setGenerationMeta(version.generation_meta ?? null);
            }
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message ?? "Failed to switch version.",
            );
        } finally {
            setIsSwitchingVersion(false);
        }
    };

    const saveCodeVersion = async () => {
        const htmlContent = draftHtml.trim();
        if (!htmlContent) {
            setCodeError("HTML code cannot be empty.");
            return;
        }

        setCodeError("");
        setCodeStatus("");
        setIsSavingCode(true);

        try {
            const response = await window.axios.post(
                route("sales-pages.code-version", salesPage.id),
                {
                    html_content: draftHtml,
                    summary: "Manual HTML edit saved from code tab.",
                },
            );

            const newMessages = response.data.messages ?? [];
            const version = response.data.version;

            if (newMessages.length > 0) {
                setChatMessages((state) => [...state, ...newMessages]);
            }

            if (version) {
                setPreviewHtml(version.html_content ?? "");
                setDraftHtml(version.html_content ?? "");
                setActiveVersionId(version.id);
                setVersionList((state) => [version, ...state]);
            }

            setGenerationMeta(response.data.generation_meta ?? null);
            setCodeStatus("Code saved as a new version.");
        } catch (error) {
            setCodeError(
                error.response?.data?.message ??
                    "Failed to save HTML as a new version.",
            );
        } finally {
            setIsSavingCode(false);
        }
    };

    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        checkDesktop();
        window.addEventListener("resize", checkDesktop);
        return () => window.removeEventListener("resize", checkDesktop);
    }, []);

    useEffect(() => {
        if (!isResizing || !isDesktop) return;

        const handleMove = (event) => {
            if (!splitRef.current) return;
            const rect = splitRef.current.getBoundingClientRect();
            const nextWidth = ((event.clientX - rect.left) / rect.width) * 100;
            const clamped = Math.max(28, Math.min(72, nextWidth));
            setLeftPaneWidth(clamped);
        };

        const stopResizing = () => setIsResizing(false);

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", stopResizing);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, isDesktop]);

    useEffect(() => {
        if (!autoRetried && shouldAutoGenerate) {
            setAutoRetried(true);
            retryInitialGeneration();
        }
    }, [autoRetried, shouldAutoGenerate]);

    useEffect(() => {
        if (!chatListRef.current) return;
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }, [chatMessages, isSending, isRetryingInitial]);

    const showEmptyState =
        chatMessages.length === 0 && !isGenerating && !shouldAutoGenerate;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-subtle">
                            <Layers className="h-3 w-3" />
                            Workspace
                        </div>
                        <h2 className="mt-1 truncate text-2xl font-semibold text-text">
                            {salesPage.product_name || "AI Workspace"}
                        </h2>
                        <p className="mt-0.5 text-sm text-text-muted">
                            Brief-to-draft otomatis, iterasi tanpa batas via chat.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {salesPage.public_url && (
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={salesPage.public_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Public link
                                </a>
                            </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <Link
                                href={route("sales-pages.export", salesPage.id)}
                            >
                                <Download className="h-3.5 w-3.5" />
                                Export HTML
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Chat Workspace" />

            <div className="py-4 lg:py-6">
                <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
                    {(shouldAutoGenerate || retryError) && (
                        <div className="mb-4 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-accent-2/10 to-transparent p-5">
                            <div className="flex items-start gap-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-accent text-white shadow-glow animate-pulse-glow">
                                    <FileCode2 className="h-5 w-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base font-semibold text-text">
                                        {isRetryingInitial
                                            ? "Generating first draft…"
                                            : retryError
                                              ? "Initial generation needs retry"
                                              : "Preparing your first AI draft"}
                                    </h3>
                                    <p className="mt-1 text-sm text-text-muted">
                                        {retryError ||
                                            generationMeta?.error ||
                                            "AI sedang merancang halaman pertama dari product brief."}
                                    </p>
                                    <Button
                                        size="sm"
                                        className="mt-3"
                                        onClick={retryInitialGeneration}
                                        disabled={isRetryingInitial}
                                    >
                                        {isRetryingInitial
                                            ? "Generating…"
                                            : "Regenerate from Brief"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div
                        ref={splitRef}
                        className="relative overflow-hidden rounded-3xl border border-border/70 bg-bg-elevated/40 shadow-premium backdrop-blur-md"
                    >
                        <div className={isDesktop ? "flex min-h-[78vh]" : ""}>
                            {/* Left pane: chat */}
                            <section
                                className="flex flex-col border-b border-border/40 bg-bg/40 lg:border-b-0 lg:border-r"
                                style={
                                    isDesktop
                                        ? { width: `${leftPaneWidth}%` }
                                        : {}
                                }
                            >
                                {/* Brief collapsible */}
                                <details className="group border-b border-border/40 px-5 py-3">
                                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-text-muted transition hover:text-text">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                            Product brief
                                        </span>
                                        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                                    </summary>
                                    <div className="mt-3 space-y-2 text-xs text-text-muted">
                                        <p>
                                            <span className="text-text-subtle">Product:</span>{" "}
                                            <span className="text-text">{salesPage.product_name}</span>
                                        </p>
                                        <p>
                                            <span className="text-text-subtle">Description:</span>{" "}
                                            {salesPage.product_description}
                                        </p>
                                        <p>
                                            <span className="text-text-subtle">Key features:</span>{" "}
                                            {listText(salesPage.key_features)}
                                        </p>
                                        <p>
                                            <span className="text-text-subtle">Audience:</span>{" "}
                                            {salesPage.target_audience || "-"}
                                        </p>
                                        <p>
                                            <span className="text-text-subtle">Price:</span>{" "}
                                            {salesPage.price || "-"}
                                        </p>
                                        <p>
                                            <span className="text-text-subtle">USP:</span>{" "}
                                            {listText(salesPage.unique_selling_points)}
                                        </p>
                                    </div>
                                </details>

                                {/* Messages list */}
                                <div
                                    ref={chatListRef}
                                    className="flex-1 space-y-5 overflow-y-auto scrollbar-thin px-5 py-6"
                                >
                                    {showEmptyState ? (
                                        <ChatEmptyState
                                            onSuggestion={(p) => {
                                                setPrompt(p);
                                                sendMessage(p);
                                            }}
                                        />
                                    ) : (
                                        chatMessages.map((message, idx) => (
                                            <ChatMessage
                                                key={message.id ?? idx}
                                                message={message}
                                                userName={userName}
                                                showRegenerate={
                                                    !isGenerating &&
                                                    idx === chatMessages.length - 1
                                                }
                                                onRegenerate={() => {
                                                    const prevUser = [
                                                        ...chatMessages,
                                                    ]
                                                        .reverse()
                                                        .find(
                                                            (m) => m.role === "user",
                                                        );
                                                    if (prevUser?.content) {
                                                        sendMessage(
                                                            prevUser.content,
                                                        );
                                                    }
                                                }}
                                            />
                                        ))
                                    )}
                                    {isGenerating && (
                                        <StreamingMessage
                                            label={
                                                isRetryingInitial
                                                    ? "Generating first draft…"
                                                    : "Crafting your update…"
                                            }
                                        />
                                    )}
                                </div>

                                {/* Composer */}
                                <div className="border-t border-border/40 bg-bg/40 px-5 py-4">
                                    {errorMessage && (
                                        <p className="mb-2 text-xs text-red-400">
                                            {errorMessage}
                                        </p>
                                    )}
                                    <ChatComposer
                                        value={prompt}
                                        onChange={setPrompt}
                                        onSubmit={() => sendMessage()}
                                        isSending={isSending}
                                        disabled={isRetryingInitial}
                                    />
                                </div>
                            </section>

                            {isDesktop && (
                                <div
                                    role="separator"
                                    aria-orientation="vertical"
                                    onMouseDown={() => setIsResizing(true)}
                                    className="group relative w-2 cursor-col-resize bg-transparent"
                                >
                                    <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition group-hover:bg-accent" />
                                    <div className="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border-strong opacity-0 transition group-hover:opacity-100" />
                                </div>
                            )}

                            {/* Right pane: preview/code */}
                            <section className="relative flex min-w-0 flex-1 flex-col p-4 lg:p-5">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-subtle">
                                            Live Preview
                                        </h3>
                                    </div>
                                    <Badge variant="gradient">
                                        Version #{activeVersionLabel}
                                    </Badge>
                                </div>

                                <div className="mb-3 flex items-center gap-3">
                                    <Select
                                        value={String(activeVersionId)}
                                        onValueChange={activateVersion}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue className="truncate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {versionList.map((version) => (
                                                <SelectItem
                                                    key={version.id}
                                                    value={String(version.id)}
                                                >
                                                    <span className="block max-w-[240px] truncate sm:max-w-[360px]">
                                                        #{version.version_number} —{" "}
                                                        {truncateText(
                                                            version.summary,
                                                            60,
                                                        )}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {isSwitchingVersion && (
                                        <span className="text-xs text-text-subtle">
                                            Switching…
                                        </span>
                                    )}
                                </div>

                                <Tabs
                                    value={viewMode}
                                    onValueChange={setViewMode}
                                    className="flex flex-1 flex-col"
                                >
                                    <TabsList>
                                        <TabsTrigger value="preview">
                                            Preview
                                        </TabsTrigger>
                                        <TabsTrigger value="code">
                                            Code
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent
                                        value="preview"
                                        className="flex-1"
                                    >
                                        <div className="relative h-[calc(78vh-220px)] min-h-[480px] overflow-hidden rounded-2xl border border-border/70 bg-white">
                                            <iframe
                                                title="Landing page preview"
                                                srcDoc={previewHtml}
                                                className="h-full w-full"
                                                sandbox="allow-same-origin allow-scripts"
                                            />
                                            {(isGenerating || isStreaming) && (
                                                <div className="absolute inset-0 flex items-stretch bg-bg/95 backdrop-blur-sm">
                                                    <PreviewSkeleton
                                                        text={
                                                            isStreaming
                                                                ? streamedHtml
                                                                : ""
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent
                                        value="code"
                                        className="flex-1"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Button
                                                    onClick={saveCodeVersion}
                                                    disabled={
                                                        isSavingCode ||
                                                        isStreaming
                                                    }
                                                    size="sm"
                                                >
                                                    {isSavingCode
                                                        ? "Saving…"
                                                        : "Save as New Version"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setDraftHtml(previewHtml);
                                                        setCodeError("");
                                                        setCodeStatus(
                                                            "Code reset to active version.",
                                                        );
                                                    }}
                                                    disabled={isStreaming}
                                                >
                                                    Reset to Active
                                                </Button>
                                                {codeStatus && (
                                                    <span className="text-xs text-accent-2">
                                                        {codeStatus}
                                                    </span>
                                                )}
                                            </div>
                                            {codeError && (
                                                <p className="text-xs text-red-400">
                                                    {codeError}
                                                </p>
                                            )}
                                            {isStreaming && (
                                                <GenerationProgress
                                                    text={streamedHtml}
                                                    progress={progress}
                                                />
                                            )}
                                            <div
                                                className={`overflow-hidden rounded-2xl border bg-bg-subtle text-text transition ${
                                                    isStreaming
                                                        ? "border-accent/40 shadow-glow"
                                                        : "border-border/60"
                                                }`}
                                            >
                                                <CodeMirror
                                                    value={codeMirrorValue}
                                                    height="600px"
                                                    theme="dark"
                                                    readOnly={isStreaming}
                                                    basicSetup={{
                                                        lineNumbers: true,
                                                        foldGutter: true,
                                                        autocompletion: true,
                                                    }}
                                                    extensions={[html()]}
                                                    onChange={(value) => {
                                                        if (isStreaming) return;
                                                        setDraftHtml(value);
                                                        setPreviewHtml(value);
                                                        if (codeError) setCodeError("");
                                                        if (codeStatus) setCodeStatus("");
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {/* Version history */}
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-text-subtle">
                                        <History className="h-3 w-3" />
                                        Version history
                                    </div>
                                    <div className="max-h-[160px] space-y-1.5 overflow-y-auto scrollbar-thin pr-1">
                                        {versionList.map((version) => (
                                            <button
                                                key={version.id}
                                                type="button"
                                                onClick={() =>
                                                    activateVersion(
                                                        String(version.id),
                                                    )
                                                }
                                                className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition ${
                                                    Number(activeVersionId) ===
                                                    Number(version.id)
                                                        ? "border-accent/50 bg-accent/10"
                                                        : "border-border/60 hover:border-border-strong hover:bg-bg-elevated/60"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 font-mono text-text">
                                                    <span className="text-accent">
                                                        v{version.version_number}
                                                    </span>
                                                    <span className="truncate text-text-muted">
                                                        {truncateText(
                                                            version.summary,
                                                            48,
                                                        ) || "No summary"}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-[10px] text-text-subtle">
                                                    {formatDate(version.created_at)}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
