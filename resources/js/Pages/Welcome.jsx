import { Head, Link } from "@inertiajs/react";
import {
    Sparkles,
    Wand2,
    Layers,
    Download,
    MessageSquare,
    Code2,
    Eye,
    ArrowRight,
    CheckCircle2,
    Zap,
} from "lucide-react";

import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import LandingHeroDemo from "@/Components/landing/LandingHeroDemo";
import FeatureCard from "@/Components/landing/FeatureCard";
import SectionHeader from "@/Components/landing/SectionHeader";
import { useReveal } from "@/hooks/useReveal";

function Reveal({ as: Tag = "div", children, className = "", delay = 0 }) {
    const ref = useReveal();
    return (
        <Tag
            ref={ref}
            className={`reveal ${className}`}
            style={delay ? { transitionDelay: `${delay}ms` } : undefined}
        >
            {children}
        </Tag>
    );
}

const FEATURES = [
    {
        icon: Wand2,
        title: "Smart Brief Parser",
        description:
            "Tempel product notes mentah—Convexa otomatis ekstrak USP, audience, dan tone. Tidak perlu template kaku.",
        accent: "violet",
    },
    {
        icon: Layers,
        title: "Section Regeneration",
        description:
            "Re-generate hanya hero, pricing, atau testimonial. Sisa halaman tetap, momentum tidak hilang.",
        accent: "cyan",
    },
    {
        icon: MessageSquare,
        title: "Chat Iteration",
        description:
            "Refine via natural language. \"Buat lebih premium\", \"tambah social proof\"—AI paham konteks brief.",
        accent: "fuchsia",
    },
    {
        icon: Code2,
        title: "Editable HTML",
        description:
            "CodeMirror built-in dengan syntax highlight. Tweak HTML mentah kalau mau kontrol penuh.",
        accent: "violet",
    },
    {
        icon: Eye,
        title: "Live Preview",
        description:
            "Iframe sandboxed update real-time. Lihat hasilnya persis seperti yang akan visitor lihat.",
        accent: "cyan",
    },
    {
        icon: Download,
        title: "One-click Export",
        description:
            "Download HTML siap deploy ke Vercel, Netlify, atau hosting apa pun. Zero lock-in.",
        accent: "fuchsia",
    },
];

const STEPS = [
    {
        number: "01",
        title: "Drop your brief",
        description:
            "Product name, deskripsi, key features, audience. Convexa parsing dalam hitungan detik.",
    },
    {
        number: "02",
        title: "AI generates",
        description:
            "Hero, features, pricing, testimonials, CTA—seluruh struktur landing page dirakit AI dalam satu draft.",
    },
    {
        number: "03",
        title: "Refine & ship",
        description:
            "Iterasi via chat, tweak code langsung, atau export HTML. Live di hosting Anda dalam menit.",
    },
];

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Convexa — AI Sales Page Generator" />

            <div className="relative min-h-screen overflow-hidden bg-bg text-text">
                {/* Aurora background */}
                <div className="pointer-events-none fixed inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-mesh" />
                    <div className="absolute inset-0 bg-grid mask-radial-fade opacity-40" />
                    <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] animate-aurora rounded-full bg-accent/30 blur-[120px]" />
                    <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] animate-aurora rounded-full bg-accent-2/25 blur-[120px] [animation-delay:-6s]" />
                    <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] animate-aurora rounded-full bg-fuchsia-500/20 blur-[120px] [animation-delay:-12s]" />
                </div>

                {/* Sticky Nav */}
                <header className="sticky top-0 z-40 border-b border-border/40 bg-bg/60 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm font-bold tracking-[0.2em]"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent shadow-glow">
                                <Sparkles className="h-4 w-4 text-white" />
                            </span>
                            <span className="text-gradient">CONVEXA</span>
                        </Link>
                        <nav className="hidden items-center gap-8 md:flex">
                            <a
                                href="#features"
                                className="text-sm text-text-muted transition hover:text-text"
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                className="text-sm text-text-muted transition hover:text-text"
                            >
                                How it works
                            </a>
                            <a
                                href="#showcase"
                                className="text-sm text-text-muted transition hover:text-text"
                            >
                                Showcase
                            </a>
                        </nav>
                        <div className="flex items-center gap-3">
                            {auth?.user ? (
                                <Button asChild size="sm">
                                    <Link href={route("sales-pages.index")}>
                                        Open Dashboard
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={route("login")}>Log in</Link>
                                    </Button>
                                    <Button size="sm" asChild>
                                        <Link href={route("register")}>
                                            Get started
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="relative">
                    <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 lg:pt-24">
                        <div className="animate-fade-up">
                            <Badge
                                variant="amber"
                                className="border-accent/30 bg-accent/10 text-accent"
                            >
                                <Sparkles className="h-3 w-3" />
                                AI Sales Page Generator
                            </Badge>
                            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] text-text md:text-6xl">
                                Ubah catatan produk jadi{" "}
                                <span className="text-gradient">landing page</span>{" "}
                                premium dalam hitungan menit.
                            </h1>
                            <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-text-muted md:text-lg">
                                Convexa pakai AI untuk parse brief, generate
                                struktur lengkap, dan biarkan Anda iterasi via
                                chat. Hasil: HTML siap deploy, tanpa template
                                kaku.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Button size="lg" asChild>
                                    <Link href={route("register")}>
                                        Build my first page
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    asChild
                                >
                                    <Link href={route("login")}>
                                        View demo flow
                                    </Link>
                                </Button>
                            </div>
                            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-text-subtle">
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-accent-2" />
                                    No credit card required
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-accent-2" />
                                    HTML export included
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-accent-2" />
                                    Cancel anytime
                                </span>
                            </div>
                        </div>

                        <div className="animate-fade-up [animation-delay:120ms]">
                            <LandingHeroDemo />
                        </div>
                    </div>
                </section>

                {/* Trust bar */}
                <Reveal className="border-y border-border/40 bg-bg-elevated/30">
                    <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-10 lg:flex-row lg:justify-between">
                        <p className="text-xs uppercase tracking-[0.3em] text-text-subtle">
                            Trusted workflow for ambitious teams
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 opacity-60">
                            {[
                                "Stripe",
                                "Vercel",
                                "Linear",
                                "Notion",
                                "Framer",
                            ].map((name) => (
                                <span
                                    key={name}
                                    className="font-display text-base font-semibold tracking-tight text-text-muted"
                                >
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                </Reveal>

                {/* Features */}
                <section id="features" className="relative py-24">
                    <div className="mx-auto max-w-7xl px-6">
                        <Reveal>
                            <SectionHeader
                                eyebrow="Features"
                                title="Semua yang Anda butuhkan untuk kirim landing page yang convert."
                                description="Dari parsing brief sampai export HTML—Convexa menggantikan workflow copywriter, designer, dan developer dengan satu chat AI."
                            />
                        </Reveal>
                        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {FEATURES.map((feature, idx) => (
                                <Reveal key={feature.title} delay={idx * 80}>
                                    <FeatureCard {...feature} />
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section
                    id="how-it-works"
                    className="relative border-t border-border/40 py-24"
                >
                    <div className="mx-auto max-w-7xl px-6">
                        <Reveal>
                            <SectionHeader
                                eyebrow="How it works"
                                title="Tiga langkah dari brief ke deploy."
                                description="Tidak perlu setup project, tidak perlu pilih template. Mulai langsung dari kepala Anda."
                            />
                        </Reveal>
                        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
                            <div
                                className="absolute left-[12%] right-[12%] top-12 hidden h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent md:block"
                                aria-hidden
                            />
                            {STEPS.map((step, idx) => (
                                <Reveal key={step.number} delay={idx * 120}>
                                    <div className="relative rounded-2xl border border-border/70 bg-bg-elevated/60 p-6 backdrop-blur-md transition hover:border-accent/40">
                                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-gradient-accent font-mono text-sm font-semibold text-white shadow-glow">
                                            {step.number}
                                        </div>
                                        <h3 className="text-lg font-semibold text-text">
                                            {step.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-text-muted">
                                            {step.description}
                                        </p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Showcase */}
                <section
                    id="showcase"
                    className="relative border-t border-border/40 py-24"
                >
                    <div className="mx-auto max-w-7xl px-6">
                        <Reveal>
                            <SectionHeader
                                eyebrow="Live workspace"
                                title="Chat di kiri, hasil di kanan."
                                description="Setiap perubahan tersimpan sebagai version. Bisa rollback kapan pun, atau cabang ke variasi A/B."
                                align="center"
                            />
                        </Reveal>
                        <Reveal delay={150} className="mt-16">
                            <div className="overflow-hidden rounded-3xl border border-border/70 bg-bg-elevated/60 shadow-premium">
                                <div className="grid gap-0 lg:grid-cols-[0.4fr_0.6fr]">
                                    <div className="border-b border-border/60 bg-bg-subtle/40 p-6 lg:border-b-0 lg:border-r">
                                        <div className="space-y-3">
                                            <div className="flex gap-3">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-accent text-white shadow-glow">
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="rounded-2xl border border-border/60 bg-bg-elevated/60 px-3.5 py-2 text-xs text-text-muted">
                                                    First draft generated. Hero,
                                                    pricing, dan FAQ siap dilihat.
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <div className="rounded-2xl bg-bg-subtle px-3.5 py-2 text-xs text-text">
                                                    Buat hero lebih premium dengan
                                                    gradient accent.
                                                </div>
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-bg-elevated text-[11px] font-semibold text-text-muted">
                                                    You
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-accent text-white shadow-glow">
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="rounded-2xl border border-border/60 bg-bg-elevated/60 px-3.5 py-2 text-xs text-text-muted">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Zap className="h-3 w-3 text-accent-2" />
                                                        Regenerating hero only…
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative bg-bg p-6">
                                        <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-bg-elevated via-bg to-bg-subtle">
                                            <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                                                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-accent">
                                                    Live Preview
                                                </span>
                                                <h3 className="text-balance text-2xl font-semibold text-text md:text-3xl">
                                                    Ship insights{" "}
                                                    <span className="text-gradient">
                                                        10× faster
                                                    </span>
                                                </h3>
                                                <p className="max-w-md text-xs text-text-muted">
                                                    Real-time analytics platform
                                                    untuk product team yang
                                                    bergerak cepat.
                                                </p>
                                                <div className="flex gap-2">
                                                    <span className="rounded-md bg-gradient-accent px-3 py-1.5 text-xs font-medium text-white shadow-glow">
                                                        Get started →
                                                    </span>
                                                    <span className="rounded-md border border-border bg-bg-elevated px-3 py-1.5 text-xs text-text-muted">
                                                        Watch demo
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* CTA */}
                <section className="relative border-t border-border/40 py-24">
                    <div className="mx-auto max-w-5xl px-6">
                        <Reveal>
                            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-bg-elevated/60 p-10 text-center shadow-premium md:p-16">
                                <div
                                    className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-60"
                                    aria-hidden
                                />
                                <div className="relative">
                                    <Badge
                                        variant="gradient"
                                        className="mx-auto"
                                    >
                                        <Sparkles className="h-3 w-3" />
                                        Ready when you are
                                    </Badge>
                                    <h2 className="mx-auto mt-6 max-w-2xl text-balance text-3xl font-semibold leading-tight text-text md:text-5xl">
                                        Halaman pertama Anda hanya{" "}
                                        <span className="text-gradient">
                                            satu chat
                                        </span>{" "}
                                        jauhnya.
                                    </h2>
                                    <p className="mx-auto mt-4 max-w-xl text-balance text-base text-text-muted">
                                        Gratis untuk dicoba. Upgrade hanya kalau
                                        Anda perlu lebih banyak pages dan
                                        kolaborator.
                                    </p>
                                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                        <Button size="lg" asChild>
                                            <Link href={route("register")}>
                                                Start building free
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link href={route("login")}>
                                                I already have an account
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border/40 py-10">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-text-subtle">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-accent">
                                <Sparkles className="h-3 w-3 text-white" />
                            </span>
                            <span className="text-gradient">CONVEXA</span>
                        </div>
                        <p className="text-xs text-text-subtle">
                            © {new Date().getFullYear()} Convexa. Built with AI,
                            shipped by humans.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
