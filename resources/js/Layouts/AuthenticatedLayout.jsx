import { Link, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";

function SidebarLink({ href, active, children, onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                active
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
        >
            {children}
        </Link>
    );
}

function UserPanel({ user, onNavigate }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="truncate text-sm font-semibold text-slate-800">
                {user.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
                {user.email}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                    href={route("profile.edit")}
                    onClick={onNavigate}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                    Profile
                </Link>
                <Link
                    href={route("logout")}
                    method="post"
                    as="button"
                    onClick={onNavigate}
                    className="rounded-lg border border-slate-200 bg-red-500 px-3 py-2 text-center text-xs font-medium text-white hover:bg-red-600"
                >
                    Log Out
                </Link>
            </div>
        </div>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const navItems = useMemo(
        () => [
            {
                href: route("sales-pages.index"),
                label: "Sales Pages",
                active:
                    route().current("sales-pages.index") ||
                    route().current("sales-pages.show"),
            },
            {
                href: route("sales-pages.create"),
                label: "New Workspace",
                active: route().current("sales-pages.create"),
            },
        ],
        [],
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-gradient-to-b from-white to-slate-50 lg:flex lg:flex-col">
                <div className="border-b border-slate-100 px-5 py-5">
                    <Link
                        href={route("sales-pages.index")}
                        className="flex items-center gap-2"
                    >
                        <div className="flex items-center justify-center rounded-md bg-amber-600 h-8 w-8">
                            <p className="text-sm font-bold tracking-tight text-white">
                                C
                            </p>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">
                            Convexa
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 space-y-2 px-4 py-4">
                    {navItems.map((item) => (
                        <SidebarLink
                            key={item.href}
                            href={item.href}
                            active={item.active}
                        >
                            {item.label}
                        </SidebarLink>
                    ))}
                </nav>

                <div className="border-t border-slate-100 px-4 py-4">
                    <UserPanel user={user} />
                </div>
            </aside>

            <div className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setMobileSidebarOpen(true)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600"
                        aria-label="Open sidebar"
                    >
                        <svg
                            className="h-5 w-5"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    <Link href={route("sales-pages.index")}>
                        <span className="text-lg font-semibold tracking-tight text-slate-900">
                            Convexa
                        </span>
                    </Link>
                    <div className="w-9" />
                </div>
            </div>

            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-900/45"
                        onClick={() => setMobileSidebarOpen(false)}
                        aria-label="Close sidebar backdrop"
                    />
                    <div className="relative h-full w-72 max-w-[85vw] bg-gradient-to-b from-white to-slate-50 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                            <Link
                                href={route("sales-pages.index")}
                                onClick={() => setMobileSidebarOpen(false)}
                            >
                                <span className="text-lg font-semibold tracking-tight text-slate-900">
                                    Convexa
                                </span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => setMobileSidebarOpen(false)}
                                className="rounded-lg border border-slate-200 p-2 text-slate-500"
                                aria-label="Close sidebar"
                            >
                                <svg
                                    className="h-5 w-5"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <nav className="space-y-2 px-4 py-4">
                            {navItems.map((item) => (
                                <SidebarLink
                                    key={item.href}
                                    href={item.href}
                                    active={item.active}
                                    onClick={() => setMobileSidebarOpen(false)}
                                >
                                    {item.label}
                                </SidebarLink>
                            ))}
                        </nav>

                        <div className="absolute inset-x-0 bottom-0 border-t border-slate-100 px-4 py-4">
                            <UserPanel
                                user={user}
                                onNavigate={() => setMobileSidebarOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="lg:pl-72">
                {header && (
                    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
                        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main>{children}</main>
            </div>
        </div>
    );
}
