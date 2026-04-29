import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";

export default function FoundryTemplate({ input, sections }) {
    const benefits = sections?.benefits ?? [];
    const features = sections?.features ?? [];
    const pricing = sections?.pricing ?? {};
    const cta = sections?.cta ?? {};
    const keyFeatures = input?.key_features ?? [];

    return (
        <div className="rounded-3xl bg-slate-950 p-8 text-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.4)]">
            <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Badge className="border-red-500/30 bg-red-500/20 text-red-100">
                        {input.product_name || "Your product"}
                    </Badge>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        Foundry edition
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <a href="#benefits" className="rounded-full px-3 py-1 hover:bg-slate-800">
                        Benefits
                    </a>
                    <a href="#features" className="rounded-full px-3 py-1 hover:bg-slate-800">
                        Features
                    </a>
                    <a href="#pricing" className="rounded-full px-3 py-1 hover:bg-slate-800">
                        Pricing
                    </a>
                    <a href="#cta" className="rounded-full px-3 py-1 hover:bg-slate-800">
                        Contact
                    </a>
                </div>
            </nav>

            <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div>
                    <h1 className="text-3xl font-semibold text-white md:text-4xl">
                        {sections?.headline || "Forged for outcomes"}
                    </h1>
                    <p className="mt-3 text-lg text-slate-300">
                        {sections?.subheadline ||
                            "Position the offer with confidence and urgency."}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-slate-400">
                        {sections?.description ||
                            "Use clear positioning, proof, and execution detail to create decision momentum."}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Button size="lg" className="bg-red-500 hover:bg-red-600">
                            {cta.primary || "Start the build"}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-slate-700 text-slate-200 hover:bg-slate-900"
                        >
                            {cta.secondary || "Book a strategy call"}
                        </Button>
                    </div>
                </div>

                <div id="pricing" className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {pricing.label || "Pricing"}
                    </div>
                    <div className="mt-3 text-3xl font-semibold text-white">
                        {pricing.value || "Custom pricing"}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">
                        {pricing.note || "Built for teams that need predictable growth."}
                    </div>
                    <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
                        Structured rollout, measurable outcomes, executive-ready reporting.
                    </div>
                </div>
            </section>

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Product overview
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {sections?.description ||
                        "Summarize the operating model, core differentiator, and expected business impact."}
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300">
                        <span className="font-semibold text-white">Ideal for:</span>{" "}
                        {input?.target_audience || "Teams scaling revenue operations."}
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300">
                        <span className="font-semibold text-white">Core value:</span>{" "}
                        Higher output with tighter operational control.
                    </div>
                </div>
            </section>

            <section id="benefits" className="mt-8">
                <div className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-500">
                    Benefits
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    {(benefits.length
                        ? benefits
                        : [
                              "Clear decision narrative for buyers",
                              "Operational speed with lower risk",
                              "Executive visibility over key metrics",
                          ]
                    )
                        .slice(0, 3)
                        .map((benefit, index) => (
                            <article
                                key={index}
                                className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4 text-sm text-slate-200"
                            >
                                {benefit}
                            </article>
                        ))}
                </div>
            </section>

            <section id="features" className="mt-8">
                <div className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-500">
                    Feature breakdown
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {(features.length
                        ? features
                        : [
                              { title: "Feature title", description: "Feature detail" },
                              { title: "Feature title", description: "Feature detail" },
                              { title: "Feature title", description: "Feature detail" },
                          ]
                    )
                        .slice(0, 3)
                        .map((feature, index) => (
                            <article
                                key={index}
                                className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
                            >
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    Feature {index + 1}
                                </div>
                                <h3 className="mt-2 text-sm font-semibold text-white">
                                    {feature.title || "Feature title"}
                                </h3>
                                <p className="mt-2 text-sm text-slate-400">
                                    {feature.description || "Feature detail"}
                                </p>
                            </article>
                        ))}
                </div>
            </section>

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Social proof placeholder
                </div>
                <p className="mt-3 text-sm text-slate-300">
                    {sections?.socialProof ||
                        "Add one customer quote or KPI that proves this offer works in production."}
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center text-sm text-slate-300">
                        <div className="text-lg font-semibold text-white">+42%</div>
                        Conversion lift
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center text-sm text-slate-300">
                        <div className="text-lg font-semibold text-white">9 days</div>
                        Time to value
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center text-sm text-slate-300">
                        <div className="text-lg font-semibold text-white">98%</div>
                        Retention on launch cohort
                    </div>
                </div>
            </section>

            <section id="cta" className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                <h3 className="text-xl font-semibold text-white">
                    Build your next growth sprint with {input.product_name || "this solution"}.
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                    {cta.supporting ||
                        "Align your team on priorities, move faster, and report impact with confidence."}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                    <Button className="bg-red-500 hover:bg-red-600">{cta.primary || "Start now"}</Button>
                    <Button
                        variant="outline"
                        className="border-slate-700 text-slate-200 hover:bg-slate-900"
                    >
                        {cta.secondary || "Contact sales"}
                    </Button>
                </div>
            </section>

            <footer className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-400">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>{input.product_name || "Your product"} · Built for high-performance teams</span>
                    <span>{new Date().getFullYear()} · All rights reserved.</span>
                </div>
                {keyFeatures.length > 0 && (
                    <p className="mt-2 text-[11px] text-slate-500">
                        Core capabilities: {keyFeatures.slice(0, 4).join(" • ")}
                    </p>
                )}
            </footer>
        </div>
    );
}
