import { useEffect, useMemo, useRef, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";

const listText = (items = []) => (items.length ? items.join(", ") : "-");

const quickPrompts = [
    "Improve hero copy and visual hierarchy for enterprise buyers.",
    "Make this look more premium with better typography and spacing.",
    "Strengthen pricing section and make CTA more conversion-focused.",
    "Add modern social proof block with testimonial cards.",
];

function formatDate(value) {
    if (!value) return "";
    return new Date(value).toLocaleString();
}

function truncateText(value, limit = 52) {
    if (!value) return "Untitled update";
    return value.length > limit ? `${value.slice(0, limit)}...` : value;
}

function TypingDots() {
    return (
        <div className="flex items-center gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
        </div>
    );
}

export default function Chat({ salesPage, messages, versions }) {
    const [chatMessages, setChatMessages] = useState(messages ?? []);
    const [versionList, setVersionList] = useState(versions ?? []);
    const [activeVersionId, setActiveVersionId] = useState(
        salesPage.active_version_id,
    );
    const [previewHtml, setPreviewHtml] = useState(
        salesPage.html_content ?? "",
    );
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
    const [leftPaneWidth, setLeftPaneWidth] = useState(38);
    const [isResizing, setIsResizing] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [viewMode, setViewMode] = useState("preview");
    const [draftHtml, setDraftHtml] = useState(salesPage.html_content ?? "");
    const [isSavingCode, setIsSavingCode] = useState(false);
    const [codeStatus, setCodeStatus] = useState("");
    const [codeError, setCodeError] = useState("");

    const splitRef = useRef(null);
    const chatListRef = useRef(null);

    const shouldAutoGenerate =
        !generationMeta || generationMeta?.status === "failed";
    const isGenerating = isRetryingInitial || isSending;

    const activeVersionLabel = useMemo(
        () =>
            versionList.find((v) => Number(v.id) === Number(activeVersionId))
                ?.version_number ?? "?",
        [versionList, activeVersionId],
    );

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
                setPreviewHtml(version.html_content ?? "");
                setDraftHtml(version.html_content ?? "");
                setActiveVersionId(version.id);
                setVersionList((state) => [version, ...state]);
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
                setPreviewHtml(version.html_content ?? "");
                setDraftHtml(version.html_content ?? "");
                setActiveVersionId(version.id);
                setVersionList((state) => [version, ...state]);
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
    }, [chatMessages, isSending]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">
                            AI Workspace
                        </h2>
                        <p className="text-sm text-slate-500">
                            Brief-to-draft otomatis, lalu iterasi tanpa batas di
                            chat.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {salesPage.public_url && (
                            <Button variant="outline" asChild>
                                <a
                                    href={salesPage.public_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Public link
                                </a>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link
                                href={route("sales-pages.export", salesPage.id)}
                            >
                                Export HTML
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Chat Workspace" />

            <div className="py-6">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
                    {(shouldAutoGenerate || retryError) && (
                        <Card className="mb-4 overflow-hidden border-sky-200 bg-gradient-to-r from-sky-50 via-cyan-50 to-indigo-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {isRetryingInitial ? (
                                        <>
                                            <TypingDots />
                                            Generating first draft...
                                        </>
                                    ) : retryError ? (
                                        "Initial generation needs retry"
                                    ) : (
                                        "Preparing your first AI draft"
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {retryError ||
                                        generationMeta?.error ||
                                        "AI is generating your first landing page draft based on product brief."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                <Button
                                    onClick={retryInitialGeneration}
                                    disabled={isRetryingInitial}
                                >
                                    {isRetryingInitial
                                        ? "Generating..."
                                        : "Regenerate from Brief"}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <div
                        ref={splitRef}
                        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_-40px_rgba(15,23,42,0.45)]"
                    >
                        <div className={isDesktop ? "flex min-h-[760px]" : ""}>
                            <section
                                className="bg-slate-50/80 p-4 lg:p-5"
                                style={
                                    isDesktop
                                        ? { width: `${leftPaneWidth}%` }
                                        : {}
                                }
                            >
                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">
                                                Product Brief
                                            </CardTitle>
                                            <CardDescription>
                                                Context awal untuk AI.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm text-slate-600">
                                            <p>
                                                <strong className="text-slate-900">
                                                    Product:
                                                </strong>{" "}
                                                {salesPage.product_name}
                                            </p>
                                            <p>
                                                <strong className="text-slate-900">
                                                    Description:
                                                </strong>{" "}
                                                {salesPage.product_description}
                                            </p>
                                            <p>
                                                <strong className="text-slate-900">
                                                    Key features:
                                                </strong>{" "}
                                                {listText(
                                                    salesPage.key_features,
                                                )}
                                            </p>
                                            <p>
                                                <strong className="text-slate-900">
                                                    Audience:
                                                </strong>{" "}
                                                {salesPage.target_audience ||
                                                    "-"}
                                            </p>
                                            <p>
                                                <strong className="text-slate-900">
                                                    Price:
                                                </strong>{" "}
                                                {salesPage.price || "-"}
                                            </p>
                                            <p>
                                                <strong className="text-slate-900">
                                                    USP:
                                                </strong>{" "}
                                                {listText(
                                                    salesPage.unique_selling_points,
                                                )}
                                            </p>
                                            {salesPage.brief_meta
                                                ?.problem_statement && (
                                                <p>
                                                    <strong className="text-slate-900">
                                                        Customer pain:
                                                    </strong>{" "}
                                                    {
                                                        salesPage.brief_meta
                                                            .problem_statement
                                                    }
                                                </p>
                                            )}
                                            {salesPage.brief_meta
                                                ?.desired_outcome && (
                                                <p>
                                                    <strong className="text-slate-900">
                                                        Desired outcome:
                                                    </strong>{" "}
                                                    {
                                                        salesPage.brief_meta
                                                            .desired_outcome
                                                    }
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">
                                                Chat
                                            </CardTitle>
                                            <CardDescription>
                                                Minta perubahan desain, copy,
                                                layout.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div
                                                ref={chatListRef}
                                                className="max-h-[340px] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3"
                                            >
                                                {chatMessages.map((message) => (
                                                    <div
                                                        key={message.id}
                                                        className={`rounded-xl p-3 text-sm ${
                                                            message.role ===
                                                            "user"
                                                                ? "ml-7 bg-slate-900 text-white"
                                                                : "mr-7 border border-slate-200 bg-slate-50 text-slate-700"
                                                        }`}
                                                    >
                                                        <div className="mb-1 text-[11px] uppercase tracking-[0.18em] opacity-70">
                                                            {message.role}
                                                        </div>
                                                        <p className="whitespace-pre-wrap">
                                                            {message.content}
                                                        </p>
                                                    </div>
                                                ))}
                                                {isSending && (
                                                    <div className="mr-7 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                                                        <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                                            assistant
                                                        </div>
                                                        <TypingDots />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {quickPrompts.map((item) => (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() =>
                                                            setPrompt(item)
                                                        }
                                                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>

                                            <Textarea
                                                value={prompt}
                                                onChange={(event) =>
                                                    setPrompt(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: Buat hero lebih premium, tambahkan social proof card, dan optimasi pricing section."
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === "Enter" &&
                                                        (event.metaKey ||
                                                            event.ctrlKey)
                                                    ) {
                                                        event.preventDefault();
                                                        sendMessage();
                                                    }
                                                }}
                                            />
                                            <p className="text-xs text-slate-400">
                                                Tip: tekan Cmd/Ctrl + Enter
                                                untuk kirim cepat.
                                            </p>
                                            {errorMessage && (
                                                <p className="text-sm text-red-600">
                                                    {errorMessage}
                                                </p>
                                            )}
                                            <Button
                                                onClick={() => sendMessage()}
                                                disabled={isSending}
                                            >
                                                {isSending ? (
                                                    <span className="inline-flex items-center gap-2">
                                                        <TypingDots />
                                                        Generating...
                                                    </span>
                                                ) : (
                                                    "Send Prompt"
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </section>

                            {isDesktop && (
                                <div
                                    role="separator"
                                    aria-orientation="vertical"
                                    onMouseDown={() => setIsResizing(true)}
                                    className="group relative w-3 cursor-col-resize bg-slate-100"
                                >
                                    <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-slate-200 transition group-hover:bg-slate-400" />
                                </div>
                            )}

                            <section className="relative min-w-0 flex-1 p-4 lg:p-5">
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">
                                            Live Preview
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            Real-time HTML output, siap export.
                                        </p>
                                    </div>
                                    <Badge variant="slate">
                                        Version #{activeVersionLabel}
                                    </Badge>
                                </div>

                                <div className="mb-4 flex items-center">
                                    <div className="space-y-2">
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
                                                        value={String(
                                                            version.id,
                                                        )}
                                                    >
                                                        <span className="block max-w-[240px] truncate sm:max-w-[360px]">
                                                            #
                                                            {
                                                                version.version_number
                                                            }{" "}
                                                            -{" "}
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
                                            <p className="text-xs text-slate-500">
                                                Switching version...
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <Tabs
                                    value={viewMode}
                                    onValueChange={setViewMode}
                                    className="space-y-3"
                                >
                                    <TabsList className="justify-start">
                                        <TabsTrigger value="preview">
                                            Preview
                                        </TabsTrigger>
                                        <TabsTrigger value="code">
                                            Code
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="preview">
                                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                            <iframe
                                                title="Landing page preview"
                                                srcDoc={previewHtml}
                                                className="h-[700px] w-full"
                                                sandbox="allow-same-origin allow-scripts"
                                            />
                                            {isGenerating && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                                                    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-md">
                                                        <p className="mb-2 text-sm font-medium text-slate-700">
                                                            AI is crafting your
                                                            update...
                                                        </p>
                                                        <div className="h-2 w-56 overflow-hidden rounded-full bg-slate-100">
                                                            <div className="h-full w-1/2 animate-pulse rounded-full bg-slate-700" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="code">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Button
                                                    onClick={saveCodeVersion}
                                                    disabled={isSavingCode}
                                                >
                                                    {isSavingCode
                                                        ? "Saving..."
                                                        : "Save as New Version"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setDraftHtml(
                                                            previewHtml,
                                                        );
                                                        setCodeError("");
                                                        setCodeStatus(
                                                            "Code reset to active version.",
                                                        );
                                                    }}
                                                >
                                                    Reset to Active Version
                                                </Button>
                                                {codeStatus && (
                                                    <p className="text-xs text-emerald-600">
                                                        {codeStatus}
                                                    </p>
                                                )}
                                            </div>
                                            {codeError && (
                                                <p className="text-sm text-red-600">
                                                    {codeError}
                                                </p>
                                            )}
                                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-slate-100">
                                                <CodeMirror
                                                    value={draftHtml}
                                                    height="700px"
                                                    theme="dark"
                                                    basicSetup={{
                                                        lineNumbers: true,
                                                        foldGutter: true,
                                                        autocompletion: true,
                                                    }}
                                                    extensions={[html()]}
                                                    onChange={(value) => {
                                                        setDraftHtml(value);
                                                        setPreviewHtml(value);
                                                        if (codeError) {
                                                            setCodeError("");
                                                        }
                                                        if (codeStatus) {
                                                            setCodeStatus("");
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="mt-4 space-y-2">
                                    <h4 className="text-sm font-semibold text-slate-900">
                                        Version History
                                    </h4>
                                    <div className="max-h-[180px] space-y-2 overflow-y-auto pr-1">
                                        {versionList.map((version) => (
                                            <button
                                                key={version.id}
                                                type="button"
                                                onClick={() =>
                                                    activateVersion(
                                                        String(version.id),
                                                    )
                                                }
                                                className={`w-full rounded-xl border p-3 text-left transition ${
                                                    Number(activeVersionId) ===
                                                    Number(version.id)
                                                        ? "border-slate-900 bg-slate-50"
                                                        : "border-slate-200 hover:border-slate-300"
                                                }`}
                                            >
                                                <div className="text-sm font-semibold text-slate-900">
                                                    Version #
                                                    {version.version_number}
                                                </div>
                                                <p className="mt-1 truncate text-xs text-slate-600">
                                                    {version.summary ||
                                                        "No summary"}
                                                </p>
                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    {formatDate(
                                                        version.created_at,
                                                    )}
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
