import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";

export default function StudioTemplate({ input, sections }) {
    const benefits = sections?.benefits ?? [];
    const features = sections?.features ?? [];
    const pricing = sections?.pricing ?? {};
    const cta = sections?.cta ?? {};
    const keyFeatures = input?.key_features ?? [];

    return (
        <div className="rounded-[32px] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-indigo-50 p-8 shadow-lg">
            <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-white/85 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Badge className="border-violet-200 bg-violet-50 text-violet-700">
                        {input.product_name || "Your product"}
                    </Badge>
                    <span className="text-xs uppercase tracking-[0.3em] text-violet-400">
                        Studio
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <a href="#benefits" className="rounded-full px-3 py-1 hover:bg-violet-50">
                        Benefits
                    </a>
                    <a href="#features" className="rounded-full px-3 py-1 hover:bg-violet-50">
                        Features
                    </a>
                    <a href="#pricing" className="rounded-full px-3 py-1 hover:bg-violet-50">
                        Pricing
                    </a>
                    <a href="#cta" className="rounded-full px-3 py-1 hover:bg-violet-50">
                        Contact
                    </a>
                </div>
            </nav>

            <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                        {sections?.headline || "Design-led persuasion"}
                    </h1>
                    <p className="mt-3 text-lg text-slate-600">
                        {sections?.subheadline ||
                            "Premium positioning with practical business value."}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-slate-500">
                        {sections?.description ||
                            "Present the product clearly, prove the value, and guide the buyer to a confident next step."}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
                            {cta.primary || "Reserve your spot"}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-violet-200 text-violet-700 hover:bg-violet-50"
                        >
                            {cta.secondary || "View the deck"}
                        </Button>
                    </div>
                </div>

                <div id="pricing" className="rounded-2xl border border-violet-100 bg-white/90 p-6">
                    <div className="text-xs uppercase tracking-[0.3em] text-violet-400">
                        {pricing.label || "Pricing"}
                    </div>
                    <div className="mt-3 text-3xl font-semibold text-slate-900">
                        {pricing.value || "Premium tiers"}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                        {pricing.note || "Designed for growing teams that value execution quality."}
                    </div>
                    <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50/70 p-4 text-sm text-violet-700">
                        White-glove onboarding, strategic guidance, and launch-ready assets.
                    </div>
                </div>
            </section>

            <section className="mt-8 rounded-2xl border border-rose-100 bg-white p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-violet-400">
                    Product overview
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {sections?.description ||
                        "Explain what the product changes, how teams adopt it, and the business outcomes expected."}
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Ideal for:</span>{" "}
                        {input?.target_audience || "Teams shaping premium buyer experiences."}
                    </div>
                    <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Core value:</span>{" "}
                        Better positioning with clearer conversion paths.
                    </div>
                </div>
            </section>

            <section id="benefits" className="mt-8">
                <div className="mb-3 text-xs uppercase tracking-[0.3em] text-violet-400">
                    Benefits
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    {(benefits.length
                        ? benefits
                        : [
                              "Professional messaging that feels brand-ready",
                              "Faster go-to-market with strong narrative",
                              "Higher trust through clear structure and proof",
                          ]
                    )
                        .slice(0, 3)
                        .map((benefit, index) => (
                            <article
                                key={index}
                                className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm text-rose-900"
                            >
                                {benefit}
                            </article>
                        ))}
                </div>
            </section>

            <section id="features" className="mt-8">
                <div className="mb-3 text-xs uppercase tracking-[0.3em] text-violet-400">
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
                                className="rounded-2xl border border-rose-100 bg-white p-4"
                            >
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                                    Feature {index + 1}
                                </div>
                                <h3 className="mt-2 text-sm font-semibold text-slate-900">
                                    {feature.title || "Feature title"}
                                </h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    {feature.description || "Feature detail"}
                                </p>
                            </article>
                        ))}
                </div>
            </section>

            <section className="mt-8 rounded-2xl border border-rose-100 bg-white p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-violet-400">
                    Social proof placeholder
                </div>
                <p className="mt-3 text-sm text-slate-600">
                    {sections?.socialProof ||
                        "Insert a testimonial, benchmark, or quote that confirms the promised outcome."}
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-center text-sm text-slate-600">
                        <div className="text-lg font-semibold text-slate-900">4.9/5</div>
                        Product satisfaction
                    </div>
                    <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-center text-sm text-slate-600">
                        <div className="text-lg font-semibold text-slate-900">2.4x</div>
                        Pipeline efficiency
                    </div>
                    <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-center text-sm text-slate-600">
                        <div className="text-lg font-semibold text-slate-900">14 days</div>
                        Average onboarding
                    </div>
                </div>
            </section>

            <section id="cta" className="mt-8 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-100 to-rose-100 p-6">
                <h3 className="text-xl font-semibold text-slate-900">
                    Start your next launch with {input.product_name || "a stronger landing page"}.
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                    {cta.supporting ||
                        "Bring strategy, narrative, and execution into one focused conversion experience."}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                    <Button className="bg-violet-600 hover:bg-violet-700">{cta.primary || "Start now"}</Button>
                    <Button variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50">
                        {cta.secondary || "Talk to advisor"}
                    </Button>
                </div>
            </section>

            <footer className="mt-8 border-t border-rose-100 pt-4 text-xs text-slate-500">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>{input.product_name || "Your product"} · Premium landing experience</span>
                    <span>{new Date().getFullYear()} · All rights reserved.</span>
                </div>
                {keyFeatures.length > 0 && (
                    <p className="mt-2 text-[11px] text-slate-400">
                        Signature capabilities: {keyFeatures.slice(0, 4).join(" • ")}
                    </p>
                )}
            </footer>
        </div>
    );
}
