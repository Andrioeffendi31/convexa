import AuroraTemplate from "@/Templates/AuroraTemplate";
import FoundryTemplate from "@/Templates/FoundryTemplate";
import StudioTemplate from "@/Templates/StudioTemplate";

const templates = {
    aurora: AuroraTemplate,
    foundry: FoundryTemplate,
    studio: StudioTemplate,
};

export default function SalesPagePreview({ input, sections, templateKey }) {
    const Template = templates[templateKey] ?? AuroraTemplate;

    if (!sections) {
        return (
            <div className="flex h-full min-h-[480px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 p-8 text-center text-sm text-slate-500">
                Generate your first draft to preview the landing page.
            </div>
        );
    }

    return <Template input={input} sections={sections} />;
}
