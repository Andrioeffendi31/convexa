import { useEffect, useMemo, useRef, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SalesPagePreview from "@/Components/SalesPagePreview";
import TemplateThumbnail from "@/Components/TemplateThumbnail";
import { useSalesPageStore } from "@/stores/useSalesPageStore";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";

const sectionTabs = [
    { key: "headline", label: "Headline" },
    { key: "subheadline", label: "Subheadline" },
    { key: "description", label: "Description" },
    { key: "benefits", label: "Benefits" },
    { key: "features", label: "Features" },
    { key: "socialProof", label: "Social proof" },
    { key: "pricing", label: "Pricing" },
    { key: "cta", label: "CTA" },
];

const listToText = (items) => (items?.length ? items.join(", ") : "");
const textToList = (value) =>
    value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

export default function Builder({ mode, templates, salesPage }) {
    const hydrated = useRef(false);
    const { errors } = usePage().props;
    const {
        input,
        templateKey,
        sections,
        generationMeta,
        setInput,
        setTemplateKey,
        setSections,
        setGenerationMeta,
        reset,
        hydrate,
        updateSection,
        updateBenefit,
        addBenefit,
        removeBenefit,
        updateFeature,
        addFeature,
        removeFeature,
        updatePricing,
        updateCta,
    } = useSalesPageStore();

    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [regeneratingSection, setRegeneratingSection] = useState("");
    const [message, setMessage] = useState("");
    const [shareMessage, setShareMessage] = useState("");

    useEffect(() => {
        if (hydrated.current) return;

        if (mode === "edit" && salesPage) {
            hydrate({
                input: {
                    product_name: salesPage.product_name,
                    product_description: salesPage.product_description,
                    key_features: salesPage.key_features ?? [],
                    target_audience: salesPage.target_audience ?? "",
                    price: salesPage.price ?? "",
                    unique_selling_points:
                        salesPage.unique_selling_points ?? [],
                },
                templateKey: salesPage.template_key,
                sections: salesPage.sections ?? null,
                generationMeta: salesPage.generation_meta ?? null,
            });
        } else {
            reset();
        }

        hydrated.current = true;
    }, [mode, salesPage, hydrate, reset]);

    const featureText = useMemo(
        () => listToText(input.key_features),
        [input.key_features],
    );
    const uspText = useMemo(
        () => listToText(input.unique_selling_points),
        [input.unique_selling_points],
    );

    const templateLabel = useMemo(
        () => templates.find((template) => template.key === templateKey)?.name,
        [templates, templateKey],
    );

    const handleGenerate = async (section = null) => {
        setMessage("");
        if (!input.product_name || !input.product_description) {
            setMessage("Please fill out product name and description first.");
            return;
        }

        if (section) {
            setRegeneratingSection(section);
        } else {
            setIsGenerating(true);
        }

        try {
            const isExistingRegeneration =
                Boolean(section) && mode === "edit" && Boolean(salesPage);
            const payloadSections = section ? sections : null;
            const endpoint = isExistingRegeneration
                ? route("sales-pages.regenerate", salesPage.id)
                : route("sales-pages.generate");
            const response = await window.axios.post(
                endpoint,
                {
                    ...input,
                    template_key: templateKey,
                    section,
                    sections: payloadSections,
                },
            );
            setSections(response.data.sections);
            setGenerationMeta(response.data.generation_meta ?? null);
        } catch (error) {
            setMessage(error.response?.data?.message ?? "Generation failed.");
        } finally {
            setIsGenerating(false);
            setRegeneratingSection("");
        }
    };

    const handleSave = () => {
        if (!sections) {
            setMessage("Generate the page before saving.");
            return;
        }

        setIsSaving(true);
        setMessage("");

        const payload = {
            ...input,
            template_key: templateKey,
            sections,
            generation_meta: generationMeta,
        };

        if (mode === "edit" && salesPage) {
            router.put(route("sales-pages.update", salesPage.id), payload, {
                onFinish: () => setIsSaving(false),
            });
            return;
        }

        router.post(route("sales-pages.store"), payload, {
            onFinish: () => setIsSaving(false),
        });
    };

    const handleDelete = () => {
        if (!salesPage) return;
        if (!window.confirm("Delete this sales page? This cannot be undone.")) {
            return;
        }
        router.delete(route("sales-pages.destroy", salesPage.id));
    };

    const handleCopyShareLink = async () => {
        if (!salesPage?.public_url) return;

        try {
            await navigator.clipboard.writeText(salesPage.public_url);
            setShareMessage("Share link copied.");
        } catch {
            setShareMessage("Unable to copy automatically. Copy it manually.");
        }
    };

    const benefits = sections?.benefits ?? [];
    const features = sections?.features ?? [];
    const pricing = sections?.pricing ?? {};
    const cta = sections?.cta ?? {};

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-semibold text-slate-900">
                                {mode === "edit"
                                    ? "Edit sales page"
                                    : "Create sales page"}
                            </h2>
                            <Badge variant="slate">
                                {templateLabel ?? templateKey}
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                            Generate, refine, and export a conversion-ready
                            landing page.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {mode === "edit" && salesPage?.public_url && (
                            <>
                                <Button variant="outline" asChild>
                                    <a
                                        href={salesPage.public_url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Open public link
                                    </a>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleCopyShareLink}
                                >
                                    Copy public link
                                </Button>
                            </>
                        )}
                        {mode === "edit" && salesPage && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={route(
                                        "sales-pages.export",
                                        salesPage.id,
                                    )}
                                >
                                    Export HTML
                                </Link>
                            </Button>
                        )}
                        {mode === "edit" && (
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !sections}
                        >
                            {isSaving
                                ? "Saving..."
                                : mode === "edit"
                                  ? "Update page"
                                  : "Save page"}
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Sales Page Builder" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
                        <div className="space-y-6">
                            {mode === "edit" && salesPage?.public_url && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Public share link</CardTitle>
                                        <CardDescription>
                                            Anyone with this URL can open the
                                            landing page without logging in.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 break-all">
                                            {salesPage.public_url}
                                        </div>
                                        {shareMessage && (
                                            <p className="text-xs text-slate-500">
                                                {shareMessage}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Product brief</CardTitle>
                                    <CardDescription>
                                        Give the AI enough context to write with
                                        precision.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Product name</Label>
                                        <Input
                                            value={input.product_name}
                                            onChange={(event) =>
                                                setInput(
                                                    "product_name",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Nimbus CRM"
                                        />
                                        {errors?.product_name && (
                                            <p className="text-xs text-red-500">
                                                {errors.product_name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={input.product_description}
                                            onChange={(event) =>
                                                setInput(
                                                    "product_description",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="What does it do and why does it matter?"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            Key features (comma-separated)
                                        </Label>
                                        <Input
                                            value={featureText}
                                            onChange={(event) =>
                                                setInput(
                                                    "key_features",
                                                    textToList(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="Pipeline automation, AI summaries, live dashboards"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Target audience</Label>
                                        <Input
                                            value={input.target_audience}
                                            onChange={(event) =>
                                                setInput(
                                                    "target_audience",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Growth-stage SaaS teams"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Price</Label>
                                        <Input
                                            value={input.price}
                                            onChange={(event) =>
                                                setInput(
                                                    "price",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="$99 per month"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            Unique selling points
                                            (comma-separated)
                                        </Label>
                                        <Input
                                            value={uspText}
                                            onChange={(event) =>
                                                setInput(
                                                    "unique_selling_points",
                                                    textToList(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="Onboarding in 7 days, 3x pipeline coverage"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Template style</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {templates.map((template) => {
                                                const active =
                                                    template.key ===
                                                    templateKey;

                                                return (
                                                    <TemplateThumbnail
                                                        key={
                                                            template.key
                                                        }
                                                        templateKey={
                                                            template.key
                                                        }
                                                        name={template.name}
                                                        description={
                                                            template.description
                                                        }
                                                        active={active}
                                                        onClick={() =>
                                                            setTemplateKey(
                                                                template.key,
                                                            )
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>
                                        <Select
                                            value={templateKey}
                                            onValueChange={(value) =>
                                                setTemplateKey(value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a template" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {templates.map((template) => (
                                                    <SelectItem
                                                        key={template.key}
                                                        value={template.key}
                                                    >
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>AI generation</CardTitle>
                                    <CardDescription>
                                        Generate a full page, then refine each
                                        section as needed.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button
                                        onClick={() => handleGenerate()}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating
                                            ? "Generating..."
                                            : "Generate full page"}
                                    </Button>
                                    {message && (
                                        <p className="text-sm text-amber-600">
                                            {message}
                                        </p>
                                    )}
                                    {generationMeta && (
                                        <p className="text-xs text-slate-500">
                                            Last AI response:{" "}
                                            {generationMeta.model ??
                                                "Unknown model"}
                                            {generationMeta.generated_at
                                                ? ` at ${new Date(
                                                      generationMeta.generated_at,
                                                  ).toLocaleString()}`
                                                : ""}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Generated copy</CardTitle>
                                    <CardDescription>
                                        Edit sections before saving or
                                        regenerate a specific section.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!sections ? (
                                        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                                            Generate a page to unlock section
                                            editing.
                                        </div>
                                    ) : (
                                        <Tabs
                                            defaultValue="headline"
                                            className="space-y-4"
                                        >
                                            <TabsList className="flex flex-wrap">
                                                {sectionTabs.map((tab) => (
                                                    <TabsTrigger
                                                        key={tab.key}
                                                        value={tab.key}
                                                    >
                                                        {tab.label}
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>

                                            <TabsContent
                                                value="headline"
                                                className="space-y-3"
                                            >
                                                <Label>Headline</Label>
                                                <Input
                                                    value={sections.headline}
                                                    onChange={(event) =>
                                                        updateSection(
                                                            "headline",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleGenerate(
                                                            "headline",
                                                        )
                                                    }
                                                    disabled={
                                                        regeneratingSection ===
                                                        "headline"
                                                    }
                                                >
                                                    {regeneratingSection ===
                                                    "headline"
                                                        ? "Regenerating..."
                                                        : "Regenerate headline"}
                                                </Button>
                                            </TabsContent>

                                            <TabsContent
                                                value="subheadline"
                                                className="space-y-3"
                                            >
                                                <Label>Subheadline</Label>
                                                <Textarea
                                                    value={sections.subheadline}
                                                    onChange={(event) =>
                                                        updateSection(
                                                            "subheadline",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleGenerate(
                                                            "subheadline",
                                                        )
                                                    }
                                                    disabled={
                                                        regeneratingSection ===
                                                        "subheadline"
                                                    }
                                                >
                                                    {regeneratingSection ===
                                                    "subheadline"
                                                        ? "Regenerating..."
                                                        : "Regenerate subheadline"}
                                                </Button>
                                            </TabsContent>

                                            <TabsContent
                                                value="description"
                                                className="space-y-3"
                                            >
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={sections.description}
                                                    onChange={(event) =>
                                                        updateSection(
                                                            "description",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleGenerate(
                                                            "description",
                                                        )
                                                    }
                                                    disabled={
                                                        regeneratingSection ===
                                                        "description"
                                                    }
                                                >
                                                    {regeneratingSection ===
                                                    "description"
                                                        ? "Regenerating..."
                                                        : "Regenerate description"}
                                                </Button>
                                            </TabsContent>

                                            <TabsContent
                                                value="benefits"
                                                className="space-y-3"
                                            >
                                                <div className="space-y-2">
                                                    {benefits.map(
                                                        (benefit, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex gap-2"
                                                            >
                                                                <Input
                                                                    value={
                                                                        benefit
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateBenefit(
                                                                            index,
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        removeBenefit(
                                                                            index,
                                                                        )
                                                                    }
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        onClick={addBenefit}
                                                    >
                                                        Add benefit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleGenerate(
                                                                "benefits",
                                                            )
                                                        }
                                                        disabled={
                                                            regeneratingSection ===
                                                            "benefits"
                                                        }
                                                    >
                                                        {regeneratingSection ===
                                                        "benefits"
                                                            ? "Regenerating..."
                                                            : "Regenerate benefits"}
                                                    </Button>
                                                </div>
                                            </TabsContent>

                                            <TabsContent
                                                value="features"
                                                className="space-y-3"
                                            >
                                                <div className="space-y-3">
                                                    {features.map(
                                                        (feature, index) => (
                                                            <div
                                                                key={index}
                                                                className="space-y-2 rounded-xl border border-slate-200 p-3"
                                                            >
                                                                <Input
                                                                    value={
                                                                        feature.title
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateFeature(
                                                                            index,
                                                                            "title",
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="Feature title"
                                                                />
                                                                <Textarea
                                                                    value={
                                                                        feature.description
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateFeature(
                                                                            index,
                                                                            "description",
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="Feature description"
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        removeFeature(
                                                                            index,
                                                                        )
                                                                    }
                                                                >
                                                                    Remove
                                                                    feature
                                                                </Button>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        onClick={addFeature}
                                                    >
                                                        Add feature
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleGenerate(
                                                                "features",
                                                            )
                                                        }
                                                        disabled={
                                                            regeneratingSection ===
                                                            "features"
                                                        }
                                                    >
                                                        {regeneratingSection ===
                                                        "features"
                                                            ? "Regenerating..."
                                                            : "Regenerate features"}
                                                    </Button>
                                                </div>
                                            </TabsContent>

                                            <TabsContent
                                                value="socialProof"
                                                className="space-y-3"
                                            >
                                                <Label>Social proof</Label>
                                                <Textarea
                                                    value={sections.socialProof}
                                                    onChange={(event) =>
                                                        updateSection(
                                                            "socialProof",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleGenerate(
                                                            "socialProof",
                                                        )
                                                    }
                                                    disabled={
                                                        regeneratingSection ===
                                                        "socialProof"
                                                    }
                                                >
                                                    {regeneratingSection ===
                                                    "socialProof"
                                                        ? "Regenerating..."
                                                        : "Regenerate social proof"}
                                                </Button>
                                            </TabsContent>

                                            <TabsContent
                                                value="pricing"
                                                className="space-y-3"
                                            >
                                                <div className="space-y-2">
                                                    <Label>Label</Label>
                                                    <Input
                                                        value={
                                                            pricing.label || ""
                                                        }
                                                        onChange={(event) =>
                                                            updatePricing(
                                                                "label",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Price</Label>
                                                    <Input
                                                        value={
                                                            pricing.value || ""
                                                        }
                                                        onChange={(event) =>
                                                            updatePricing(
                                                                "value",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Note</Label>
                                                    <Input
                                                        value={
                                                            pricing.note || ""
                                                        }
                                                        onChange={(event) =>
                                                            updatePricing(
                                                                "note",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleGenerate(
                                                            "pricing",
                                                        )
                                                    }
                                                    disabled={
                                                        regeneratingSection ===
                                                        "pricing"
                                                    }
                                                >
                                                    {regeneratingSection ===
                                                    "pricing"
                                                        ? "Regenerating..."
                                                        : "Regenerate pricing"}
                                                </Button>
                                            </TabsContent>

                                            <TabsContent
                                                value="cta"
                                                className="space-y-3"
                                            >
                                                <div className="space-y-2">
                                                    <Label>Primary CTA</Label>
                                                    <Input
                                                        value={
                                                            cta.primary || ""
                                                        }
                                                        onChange={(event) =>
                                                            updateCta(
                                                                "primary",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Secondary CTA</Label>
                                                    <Input
                                                        value={
                                                            cta.secondary || ""
                                                        }
                                                        onChange={(event) =>
                                                            updateCta(
                                                                "secondary",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>
                                                        Supporting line
                                                    </Label>
                                                    <Input
                                                        value={
                                                            cta.supporting || ""
                                                        }
                                                        onChange={(event) =>
                                                            updateCta(
                                                                "supporting",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleGenerate("cta")
                                                    }
                                                    disabled={
                                                        regeneratingSection ===
                                                        "cta"
                                                    }
                                                >
                                                    {regeneratingSection ===
                                                    "cta"
                                                        ? "Regenerating..."
                                                        : "Regenerate CTA"}
                                                </Button>
                                            </TabsContent>
                                        </Tabs>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Live preview</CardTitle>
                                    <CardDescription>
                                        This is how your landing page will look.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SalesPagePreview
                                        input={input}
                                        sections={sections}
                                        templateKey={templateKey}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
