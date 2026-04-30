import { Badge } from "@/Components/ui/badge";

export default function SectionHeader({ eyebrow, title, description, align = "center" }) {
    const alignment =
        align === "center"
            ? "items-center text-center"
            : "items-start text-left";

    return (
        <div className={`flex flex-col gap-4 ${alignment}`}>
            {eyebrow && (
                <Badge variant="amber" className="uppercase tracking-[0.2em]">
                    {eyebrow}
                </Badge>
            )}
            <h2 className="max-w-3xl text-balance text-3xl font-semibold leading-tight text-text md:text-4xl">
                {title}
            </h2>
            {description && (
                <p className="max-w-2xl text-balance text-base leading-relaxed text-text-muted">
                    {description}
                </p>
            )}
        </div>
    );
}
