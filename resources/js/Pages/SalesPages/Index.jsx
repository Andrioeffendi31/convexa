import { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

import { Badge } from "@/Components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

const templateLabels = {
    freeform: "Freeform HTML",
    aurora: "Aurora SaaS",
    foundry: "Foundry Enterprise",
    studio: "Studio Product",
};

function formatDate(value) {
    if (!value) return "Just now";
    return new Date(value).toLocaleString();
}

const pageSizes = ["12", "24", "48"];

export default function Index({ pages, filters = {}, templates = [] }) {
    const [form, setForm] = useState({
        product_name: filters.product_name ?? "",
        template_key: filters.template_key ?? "all",
        updated_from: filters.updated_from ?? "",
        updated_to: filters.updated_to ?? "",
        per_page: String(filters.per_page ?? 12),
    });

    const templateOptions = useMemo(
        () =>
            templates.map((template) => ({
                value: template.key,
                label: template.name,
            })),
        [templates],
    );

    const hasActiveFilters =
        form.product_name.trim() !== "" ||
        form.template_key !== "all" ||
        form.updated_from !== "" ||
        form.updated_to !== "";

    const applyFilters = (event) => {
        event.preventDefault();

        const query = {
            per_page: form.per_page,
        };

        if (form.product_name.trim() !== "") {
            query.product_name = form.product_name.trim();
        }
        if (form.template_key !== "all") {
            query.template_key = form.template_key;
        }
        if (form.updated_from) {
            query.updated_from = form.updated_from;
        }
        if (form.updated_to) {
            query.updated_to = form.updated_to;
        }

        router.get(route("sales-pages.index"), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setForm({
            product_name: "",
            template_key: "all",
            updated_from: "",
            updated_to: "",
            per_page: "12",
        });

        router.get(
            route("sales-pages.index"),
            { per_page: 12 },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleDelete = (pageId, productName) => {
        if (
            !window.confirm(
                `Delete "${productName}"? This action cannot be undone.`,
            )
        ) {
            return;
        }

        router.delete(route("sales-pages.destroy", pageId), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">
                            Sales Pages
                        </h2>
                        <p className="text-sm text-slate-500">
                            Manage and iterate on your generated HTML landing
                            pages.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route("sales-pages.create")}>New page</Link>
                    </Button>
                </div>
            }
        >
            <Head title="Sales Pages" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Card className="mb-6 overflow-hidden border-slate-200 shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
                            <CardTitle>History Filters</CardTitle>
                            <CardDescription>
                                Find pages quickly by product, template, and
                                update window.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <form
                                onSubmit={applyFilters}
                                className="grid gap-4 lg:grid-cols-12"
                            >
                                <div className="space-y-2 lg:col-span-4">
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
                                        placeholder="Search product name..."
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-1 lg:col-span-2">
                                    <Label>Template</Label>
                                    <Select
                                        value={form.template_key}
                                        onValueChange={(value) =>
                                            setForm((state) => ({
                                                ...state,
                                                template_key: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All templates" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All templates
                                            </SelectItem>
                                            {templateOptions.map((template) => (
                                                <SelectItem
                                                    key={template.value}
                                                    value={template.value}
                                                >
                                                    {template.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 sm:col-span-1 lg:col-span-2">
                                    <Label>Updated from</Label>
                                    <Input
                                        type="date"
                                        value={form.updated_from}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                updated_from:
                                                    event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-1 lg:col-span-2">
                                    <Label>Updated to</Label>
                                    <Input
                                        type="date"
                                        value={form.updated_to}
                                        onChange={(event) =>
                                            setForm((state) => ({
                                                ...state,
                                                updated_to: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-1 lg:col-span-2">
                                    <Label>Per page</Label>
                                    <Select
                                        value={form.per_page}
                                        onValueChange={(value) =>
                                            setForm((state) => ({
                                                ...state,
                                                per_page: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pageSizes.map((size) => (
                                                <SelectItem
                                                    key={size}
                                                    value={size}
                                                >
                                                    {size} items
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-wrap items-end gap-2 lg:col-span-12">
                                    <Button type="submit">Apply filters</Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={clearFilters}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {pages.data.length === 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {hasActiveFilters
                                        ? "No matching pages"
                                        : "No pages yet"}
                                </CardTitle>
                                <CardDescription>
                                    {hasActiveFilters
                                        ? "Try changing your filters to broaden results."
                                        : "Generate your first sales page to see it here."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {hasActiveFilters ? (
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                    >
                                        Reset filters
                                    </Button>
                                ) : (
                                    <Button asChild>
                                        <Link
                                            href={route("sales-pages.create")}
                                        >
                                            Create your first page
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                                <span>
                                    Showing {pages.from} to {pages.to} of{" "}
                                    {pages.total} pages
                                </span>
                                <span>
                                    Page {pages.current_page} of{" "}
                                    {pages.last_page}
                                </span>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {pages.data.map((page) => (
                                    <Card key={page.id} className="group">
                                        <CardHeader>
                                            <div className="flex items-center justify-between gap-3">
                                                <Badge variant="slate">
                                                    {templateLabels[
                                                        page.template_key
                                                    ] ?? page.template_key}
                                                </Badge>
                                                <span className="text-xs text-slate-400">
                                                    {formatDate(
                                                        page.updated_at,
                                                    )}
                                                </span>
                                            </div>
                                            <CardTitle className="text-lg">
                                                {page.product_name}
                                            </CardTitle>
                                            <CardDescription>
                                                {page.headline ||
                                                    "No headline yet"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            "sales-pages.show",
                                                            page.id,
                                                        )}
                                                    >
                                                        Open
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            "sales-pages.export",
                                                            page.id,
                                                        )}
                                                    >
                                                        Export
                                                    </Link>
                                                </Button>
                                                {page.public_url && (
                                                    <Button
                                                        variant="outline"
                                                        asChild
                                                    >
                                                        <a
                                                            href={
                                                                page.public_url
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Public link
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleDelete(
                                                            page.id,
                                                            page.product_name,
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                ID: {page.id}
                                            </span>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    disabled={!pages.prev_page_url}
                                    onClick={() =>
                                        pages.prev_page_url &&
                                        router.get(
                                            pages.prev_page_url,
                                            {},
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={!pages.next_page_url}
                                    onClick={() =>
                                        pages.next_page_url &&
                                        router.get(
                                            pages.next_page_url,
                                            {},
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
