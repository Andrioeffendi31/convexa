import { Link } from "@inertiajs/react";
import { Sparkles } from "lucide-react";

import AuthShowcase from "@/Components/landing/AuthShowcase";

export default function GuestLayout({ children, eyebrow, title, subtitle }) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-bg text-text">
            {/* Aurora background (mobile only) */}
            <div className="pointer-events-none fixed inset-0 -z-10 lg:hidden">
                <div className="absolute inset-0 bg-gradient-mesh opacity-70" />
                <div className="absolute -top-32 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-accent/30 blur-[120px]" />
            </div>

            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Left: form area */}
                <div className="relative flex flex-col px-6 py-8 sm:px-10 lg:px-12">
                    <header className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm font-bold tracking-[0.2em]"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent shadow-glow">
                                <Sparkles className="h-4 w-4 text-white" />
                            </span>
                            <span className="text-gradient">CONVEXA</span>
                        </Link>
                        <Link
                            href="/"
                            className="text-xs text-text-muted transition hover:text-text"
                        >
                            ← Back to home
                        </Link>
                    </header>

                    <main className="flex flex-1 items-center justify-center py-10">
                        <div className="w-full max-w-md">
                            {(eyebrow || title || subtitle) && (
                                <div className="mb-8 animate-fade-up">
                                    {eyebrow && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                                            <Sparkles className="h-3 w-3" />
                                            {eyebrow}
                                        </span>
                                    )}
                                    {title && (
                                        <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-text md:text-4xl">
                                            {title}
                                        </h1>
                                    )}
                                    {subtitle && (
                                        <p className="mt-3 text-sm leading-relaxed text-text-muted">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="animate-fade-up [animation-delay:80ms]">
                                {children}
                            </div>
                        </div>
                    </main>

                    <footer className="flex items-center justify-between text-[11px] text-text-subtle">
                        <span>
                            © {new Date().getFullYear()} Convexa
                        </span>
                        <div className="flex items-center gap-4">
                            <a
                                href="#"
                                className="transition hover:text-text-muted"
                            >
                                Privacy
                            </a>
                            <a
                                href="#"
                                className="transition hover:text-text-muted"
                            >
                                Terms
                            </a>
                        </div>
                    </footer>
                </div>

                {/* Right: showcase (desktop only) */}
                <div className="relative hidden border-l border-border/40 bg-bg-elevated/30 lg:block">
                    <AuthShowcase />
                </div>
            </div>
        </div>
    );
}
