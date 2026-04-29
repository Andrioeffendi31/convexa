import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";

export default function AuroraTemplate({ input, sections }) {
    const benefits = sections?.benefits ?? [];
    const features = sections?.features ?? [];
    const pricing = sections?.pricing ?? {};
    const cta = sections?.cta ?? {};
    const keyFeatures = input?.key_features ?? [];

    return (
        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-8 shadow-sm">
            <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-white/80 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Badge variant="amber">
                        {input.product_name || "Your product"}
                    </Badge>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        Professional landing page
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <a href="#benefits" className="rounded-full px-3 py-1 hover:bg-slate-100">
                        Benefits
                    </a>
                    <a href="#features" className="rounded-full px-3 py-1 hover:bg-slate-100">
                        Features
                    </a>
                    <a href="#pricing" className="rounded-full px-3 py-1 hover:bg-slate-100">
                        Pricing
                    </a>
                    <a href="#cta" className="rounded-full px-3 py-1 hover:bg-slate-100">
                        Contact
                    </a>
                </div>
            </nav>

            <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                        {sections?.headline || "Your headline goes here"}
                    </h1>
                    <p className="mt-3 text-lg text-slate-600">
                        {sections?.subheadline ||
                            "A clear, confident subheadline."}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-slate-500">
                        {sections?.description ||
                            "Use the generator to craft a compelling product description."}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Button size="lg">{cta.primary || "Get started"}</Button>
                        <Button variant="outline" size="lg">
                            {cta.secondary || "Book a demo"}
                        </Button>
                    </div>
                </div>

                <div id="pricing" className="rounded-2xl border border-amber-100 bg-white/90 p-6">
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {pricing.label || "Pricing"}
                    </div>
                    <div className="mt-3 text-3xl font-semibold text-slate-900">
                        {pricing.value || "Contact us"}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                        {pricing.note || "Flexible plans tailored to your growth stage."}
                    </div>
                    <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-900">
                        Clear scope, fast onboarding, measurable business outcomes.
                    </div>
                </div>
            </section>

            <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Product overview
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {sections?.description ||
                        "Summarize the core value proposition and why this product is a strategic fit for the customer."}
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Ideal for:</span>{" "}
                        {input?.target_audience || "Teams focused on predictable growth."}
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Core value:</span>{" "}
                        Faster execution with less operational friction.
                    </div>
                </div>
            </section>

            <section id="benefits" className="mt-8">
                <div className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                    Benefits
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    {(benefits.length ? benefits : [
                        "Stronger conversion from clearer messaging",
                        "Faster launch with reusable structure",
                        "Professional brand presentation by default",
                    ]).slice(0, 3).map((benefit, index) => (
                        <article
                            key={index}
                            className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm text-amber-900"
                        >
                            {benefit}
                        </article>
                    ))}
                </div>
            </section>

            <section id="features" className="mt-8">
                <div className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-400">
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
                                className="rounded-2xl border border-slate-100 bg-white p-4"
                            >
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
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

            <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Social proof placeholder
                </div>
                <p className="mt-3 text-sm text-slate-600">
                    {sections?.socialProof ||
                        "Add one testimonial or KPI that validates the promise above."}
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center text-sm text-slate-600">
                        <div className="text-lg font-semibold text-slate-900">+37%</div>
                        Pipeline velocity
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center text-sm text-slate-600">
                        <div className="text-lg font-semibold text-slate-900">12 days</div>
                        Average onboarding
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center text-sm text-slate-600">
                        <div className="text-lg font-semibold text-slate-900">4.8/5</div>
                        Customer satisfaction
                    </div>
                </div>
            </section>

            <section id="cta" className="mt-8 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-100 to-sky-100 p-6">
                <h3 className="text-xl font-semibold text-slate-900">
                    Ready to move faster with {input.product_name || "your team"}?
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                    {cta.supporting ||
                        "Start with a focused implementation plan and ship your first wins quickly."}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                    <Button>{cta.primary || "Start now"}</Button>
                    <Button variant="outline">{cta.secondary || "Talk to sales"}</Button>
                </div>
            </section>

            <footer className="mt-8 border-t border-amber-100 pt-4 text-xs text-slate-500">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                        {input.product_name || "Your product"} · Professional sales page
                    </span>
                    <span>{new Date().getFullYear()} · All rights reserved.</span>
                </div>
                {keyFeatures.length > 0 && (
                    <p className="mt-2 text-[11px] text-slate-400">
                        Key capabilities: {keyFeatures.slice(0, 4).join(" • ")}
                    </p>
                )}
            </footer>
        </div>
    );
}
