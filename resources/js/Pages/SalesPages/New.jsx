import { useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
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
import TemplateThumbnail from "@/Components/TemplateThumbnail";

const textToList = (value) =>
    value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

const toneOptions = [
    "Professional & consultative",
    "Bold & outcome-driven",
    "Friendly & approachable",
    "Executive & premium",
];

const fallbackTemplates = [
    {
        key: "aurora",
        name: "Aurora SaaS",
        description:
            "Clean modern SaaS style with strong trust cues and conversion-focused flow.",
    },
    {
        key: "foundry",
        name: "Foundry Enterprise",
        description:
            "Enterprise-ready layout with premium contrast and executive messaging structure.",
    },
    {
        key: "studio",
        name: "Studio Product",
        description:
            "Product storytelling layout for feature-first launches with polished visuals.",
    },
];

export default function New({ templates = [] }) {
    const templateOptions =
        templates.length > 0 ? templates : fallbackTemplates;
    const initialTemplateKey = templateOptions[0]?.key ?? "aurora";

    const [form, setForm] = useState({
        template_key: initialTemplateKey,
        product_name: "",
        product_description: "",
        key_features_text: "",
        target_audience: "",
        price: "",
        unique_selling_points_text: "",
        problem_statement: "",
        desired_outcome: "",
        primary_cta: "",
        secondary_cta: "",
        brand_tone: toneOptions[0],
        visual_direction: "",
        proof_points_text: "",
        objections_text: "",
        competitors_text: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const briefScore = useMemo(() => {
        const checks = [
            form.problem_statement.trim() !== "",
            form.desired_outcome.trim() !== "",
            textToList(form.proof_points_text).length > 0,
            form.primary_cta.trim() !== "",
        ];

        return checks.filter(Boolean).length;
    }, [
        form.problem_statement,
        form.desired_outcome,
        form.proof_points_text,
        form.primary_cta,
    ]);

    const briefScorePercent = Math.round((briefScore / 4) * 100);
    const sectionCardClass = "overflow-hidden";

    const onSubmit = (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        router.post(
            route("sales-pages.store"),
            {
                product_name: form.product_name,
                product_description: form.product_description,
                template_key: form.template_key,
                key_features: textToList(form.key_features_text),
                target_audience: form.target_audience,
                price: form.price,
                unique_selling_points: textToList(
                    form.unique_selling_points_text,
                ),
                brief_meta: {
                    problem_statement: form.problem_statement,
                    desired_outcome: form.desired_outcome,
                    primary_cta: form.primary_cta,
                    secondary_cta: form.secondary_cta,
                    brand_tone: form.brand_tone,
                    visual_direction: form.visual_direction,
                    proof_points: textToList(form.proof_points_text),
                    objections: textToList(form.objections_text),
                    competitors: textToList(form.competitors_text),
                },
            },
            {
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-text">
                            Create SaaS Landing Workspace
                        </h2>
                        <p className="text-sm text-text-muted">
                            Isi brief seperlunya saja. AI akan melengkapi dan
                            generate draft profesional otomatis.
                        </p>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-text">
                        {briefScorePercent}%
                    </p>
                </div>
            }
        >
            <Head title="New Session" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={onSubmit} className="space-y-5">
                        <Card className={sectionCardClass}>
                            <CardHeader>
                                <CardTitle>
                                    0) Choose Starting Blueprint
                                </CardTitle>
                                <CardDescription>
                                    Pilih salah satu dari 3 template profesional
                                    sebagai struktur awal landing page.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 md:grid-cols-3">
                                    {templateOptions.map((template) => (
                                        <TemplateThumbnail
                                            key={template.key}
                                            templateKey={template.key}
                                            name={template.name}
                                            description={template.description}
                                            active={
                                                form.template_key ===
                                                template.key
                                            }
                                            onClick={() =>
                                                setForm((state) => ({
                                                    ...state,
                                                    template_key: template.key,
                                                }))
                                            }
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={sectionCardClass}>
                            <CardHeader>
                                <CardTitle>1) Product Fundamentals</CardTitle>
                                <CardDescription>
                                    Fondasi utama agar AI paham produk, pasar,
                                    dan positioning inti. Semua field opsional.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Product name</Label>
                                    <Input
                                        value={form.product_name}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                product_name:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder="Nimbus CRM"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Product description</Label>
                                    <Textarea
                                        value={form.product_description}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                product_description:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder="Apa produk ini, untuk siapa, dan kenapa penting."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>
                                        Key features (comma-separated)
                                    </Label>
                                    <Input
                                        value={form.key_features_text}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                key_features_text:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder="Live dashboard, AI follow-up, workflow automation"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unique selling points</Label>
                                    <Input
                                        value={form.unique_selling_points_text}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                unique_selling_points_text:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder="Onboarding 7 hari, migration support, compliance-ready"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target audience</Label>
                                    <Input
                                        value={form.target_audience}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                target_audience:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder="VP Sales, RevOps, Sales Managers"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pricing context</Label>
                                    <Input
                                        value={form.price}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                price: event.target.value,
                                            }))
                                        }
                                        placeholder="$99/user/month or custom enterprise pricing"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={sectionCardClass}>
                            <CardHeader>
                                <CardTitle>2) Strategic Brief</CardTitle>
                                <CardDescription>
                                    Detail ini akan meningkatkan kualitas hasil
                                    landing page secara signifikan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Primary customer pain</Label>
                                    <Textarea
                                        value={form.problem_statement}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                problem_statement:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder="Masalah utama yang sedang dialami customer saat ini."
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Desired business outcome</Label>
                                    <Textarea
                                        value={form.desired_outcome}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                desired_outcome:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder="Hasil bisnis yang ingin dicapai (mis. faster pipeline velocity, lower CAC payback)."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Primary CTA</Label>
                                    <Input
                                        value={form.primary_cta}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                primary_cta: event.target.value,
                                            }))
                                        }
                                        placeholder="Start free trial"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Secondary CTA</Label>
                                    <Input
                                        value={form.secondary_cta}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                secondary_cta:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder="Book a demo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Brand tone</Label>
                                    <Select
                                        value={form.brand_tone}
                                        onValueChange={(value) =>
                                            setForm((state) => ({
                                                ...state,
                                                brand_tone: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {toneOptions.map((tone) => (
                                                <SelectItem
                                                    key={tone}
                                                    value={tone}
                                                >
                                                    {tone}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Visual direction</Label>
                                    <Input
                                        value={form.visual_direction}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                visual_direction:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder="Modern SaaS, clean cards, strong trust cues"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>
                                        Proof points (comma-separated)
                                    </Label>
                                    <Input
                                        value={form.proof_points_text}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                proof_points_text:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder="200+ clients, 37% faster deal cycle, SOC2-ready"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>
                                        Common objections (comma-separated)
                                    </Label>
                                    <Input
                                        value={form.objections_text}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                objections_text:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder="Implementation takes too long, Integration complexity"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>
                                        Competitors / alternatives
                                        (comma-separated)
                                    </Label>
                                    <Input
                                        value={form.competitors_text}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                competitors_text:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder="HubSpot, Salesforce, Pipedrive"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={sectionCardClass}>
                            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-text-muted">
                                    Workspace akan membuat starter draft dulu,
                                    lalu auto-generate full draft dari brief
                                    saat kamu membuka halaman chat.
                                </p>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting
                                        ? "Creating Workspace..."
                                        : "Create Workspace"}
                                </Button>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
