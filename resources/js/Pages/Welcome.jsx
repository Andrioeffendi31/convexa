import { Head, Link } from "@inertiajs/react";

import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="AI Sales Page Generator" />
            <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
                <div className="absolute -left-40 top-[-120px] h-[420px] w-[420px] rounded-full bg-amber-200/40 blur-3xl" />
                <div className="absolute right-[-140px] top-[120px] h-[360px] w-[360px] rounded-full bg-sky-200/50 blur-3xl" />
                <div className="absolute bottom-[-120px] left-[20%] h-[300px] w-[300px] rounded-full bg-rose-200/40 blur-3xl" />

                <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
                    <header className="flex items-center justify-between">
                        <div className="text-sm font-semibold tracking-[0.3em] text-slate-400">
                            CONVEXA
                        </div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={route("sales-pages.index")}>
                                        Dashboard
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="outline" asChild>
                                        <Link href={route("login")}>
                                            Log in
                                        </Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href={route("register")}>
                                            Get started
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </header>

                    <main className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] animate-fade-up">
                        <div>
                            <Badge variant="amber">
                                AI Sales Page Generator
                            </Badge>
                            <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                                Turn raw product notes into a persuasive landing
                                page in minutes.
                            </h1>
                            <p className="mt-4 text-lg text-slate-600">
                                Feed Convexa your product brief, then refine
                                each section with targeted AI regeneration.
                                Export a polished HTML page when it is ready to
                                ship.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Button size="lg" asChild>
                                    <Link href={route("register")}>
                                        Build my first page
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href={route("login")}>
                                        View demo flow
                                    </Link>
                                </Button>
                            </div>
                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                {[
                                    "Structured sections with CTA, pricing, and social proof",
                                    "Three visual templates built for different brand tones",
                                    "Section-by-section regeneration to tune the copy",
                                    "One-click HTML export ready for deployment",
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="rounded-xl bg-white/80 p-4 text-sm text-slate-600 shadow-sm"
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-amber-100 bg-white/90">
                                <CardHeader>
                                    <CardTitle>Live preview ready</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm text-slate-600">
                                        <p>
                                            Create and review the entire landing
                                            page without leaving the builder.
                                            Templates are live, editable, and
                                            export-ready.
                                        </p>
                                        <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                                            "The headline finally matches our
                                            positioning." - Customer quote
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200 bg-white/90">
                                <CardHeader>
                                    <CardTitle>Built for iteration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600">
                                        Re-generate only the CTA, rewrite the
                                        pricing block, or keep the rest of the
                                        page intact. Every change is saved in
                                        your library.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
