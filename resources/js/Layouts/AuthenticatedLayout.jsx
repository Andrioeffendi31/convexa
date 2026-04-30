import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Menu,
    Plus,
    Sparkles,
    X,
} from "lucide-react";

import ConversationList from "@/Components/sidebar/ConversationList";
import UserMenu from "@/Components/sidebar/UserMenu";

function Brand({ collapsed = false }) {
    return (
        <Link
            href={route("sales-pages.index")}
            className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}
        >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent shadow-glow">
                <Sparkles className="h-4 w-4 text-white" />
            </span>
            {!collapsed && (
                <span className="font-display text-lg font-bold tracking-tight text-text">
                    Convexa
                </span>
            )}
        </Link>
    );
}

function NewSalesPageButton({ collapsed = false, onNavigate }) {
    if (collapsed) {
        return (
            <Link
                href={route("sales-pages.create")}
                onClick={onNavigate}
                title="New sales page"
                className="flex h-10 w-full items-center justify-center rounded-lg bg-gradient-accent text-white shadow-glow transition hover:opacity-90"
            >
                <Plus className="h-4 w-4" />
            </Link>
        );
    }

    return (
        <Link
            href={route("sales-pages.create")}
            onClick={onNavigate}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-accent px-3 py-2.5 text-sm font-medium text-white shadow-glow transition hover:opacity-90"
        >
            <Plus className="h-4 w-4" />
            New Sales Page
        </Link>
    );
}

function SidebarBody({ collapsed = false, activeId, items, onNavigate }) {
    return (
        <div className="flex h-full flex-col">
            <div
                className={`border-b border-border/40 py-5 ${collapsed ? "px-3" : "px-4"}`}
            >
                <Brand collapsed={collapsed} />
            </div>

            <div className={`py-4 ${collapsed ? "px-2" : "px-3"}`}>
                <NewSalesPageButton
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                />
            </div>

            <div
                className={`flex-1 overflow-y-auto scrollbar-thin pb-4 ${collapsed ? "px-2" : "px-2"}`}
            >
                <ConversationList
                    items={items}
                    activeId={activeId}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                />
            </div>

            <div
                className={`border-t border-border/40 py-3 ${collapsed ? "px-2" : "px-3"}`}
            >
                <UserMenu
                    user={usePage().props.auth.user}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                />
            </div>
        </div>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const recentSalesPages = page.props.recentSalesPages ?? [];
    const activeId = page.props.salesPage?.id;

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = window.localStorage.getItem("convexa.sidebar.collapsed");
        if (stored === "1") setDesktopCollapsed(true);
    }, []);

    const toggleDesktopSidebar = () => {
        setDesktopCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== "undefined") {
                window.localStorage.setItem(
                    "convexa.sidebar.collapsed",
                    next ? "1" : "0",
                );
            }
            return next;
        });
    };

    return (
        <div className="relative min-h-screen bg-bg text-text">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-mesh opacity-50" />

            {/* Desktop sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 hidden border-r border-border/50 bg-bg/80 backdrop-blur-xl transition-all duration-200 lg:flex lg:flex-col ${
                    desktopCollapsed ? "w-20" : "w-72"
                }`}
            >
                <button
                    type="button"
                    onClick={toggleDesktopSidebar}
                    className="absolute -right-3 top-7 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-bg-elevated text-text-muted shadow-md transition hover:border-accent hover:text-accent"
                    aria-label={
                        desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"
                    }
                    title={
                        desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"
                    }
                >
                    {desktopCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                        <ChevronLeft className="h-3.5 w-3.5" />
                    )}
                </button>

                <SidebarBody
                    collapsed={desktopCollapsed}
                    activeId={activeId}
                    items={recentSalesPages}
                />
            </aside>

            {/* Mobile top bar */}
            <div className="sticky top-0 z-40 border-b border-border/40 bg-bg/80 px-4 py-3 backdrop-blur-xl lg:hidden">
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setMobileSidebarOpen(true)}
                        className="rounded-lg border border-border p-2 text-text-muted transition hover:bg-bg-elevated hover:text-text"
                        aria-label="Open sidebar"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <Brand />
                    <div className="w-9" />
                </div>
            </div>

            {/* Mobile sidebar overlay */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileSidebarOpen(false)}
                        aria-label="Close sidebar backdrop"
                    />
                    <div className="relative h-full w-72 max-w-[85vw] border-r border-border/60 bg-bg shadow-premium">
                        <button
                            type="button"
                            onClick={() => setMobileSidebarOpen(false)}
                            className="absolute right-3 top-4 rounded-lg border border-border p-2 text-text-muted hover:bg-bg-elevated hover:text-text"
                            aria-label="Close sidebar"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <SidebarBody
                            activeId={activeId}
                            items={recentSalesPages}
                            onNavigate={() => setMobileSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Main */}
            <div
                className={`transition-all duration-200 ${
                    desktopCollapsed ? "lg:pl-20" : "lg:pl-72"
                }`}
            >
                {header && (
                    <header className="border-b border-border/40 bg-bg/60 backdrop-blur-xl">
                        <div className="px-4 py-5 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}
                <main className="relative">{children}</main>
            </div>
        </div>
    );
}
