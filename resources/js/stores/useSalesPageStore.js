import { create } from 'zustand';

const emptySections = {
    headline: '',
    subheadline: '',
    description: '',
    benefits: [],
    features: [],
    socialProof: '',
    pricing: {
        label: 'Price',
        value: '',
        note: '',
    },
    cta: {
        primary: '',
        secondary: '',
        supporting: '',
    },
};

const emptyInput = {
    product_name: '',
    product_description: '',
    key_features: [],
    target_audience: '',
    price: '',
    unique_selling_points: [],
};

export const useSalesPageStore = create((set) => ({
    input: { ...emptyInput },
    templateKey: 'aurora',
    sections: null,
    generationMeta: null,
    setInput: (key, value) =>
        set((state) => ({
            input: { ...state.input, [key]: value },
        })),
    setTemplateKey: (templateKey) => set({ templateKey }),
    setSections: (sections) => set({ sections }),
    setGenerationMeta: (generationMeta) => set({ generationMeta }),
    reset: () =>
        set({
            input: { ...emptyInput },
            templateKey: 'aurora',
            sections: null,
            generationMeta: null,
        }),
    hydrate: (payload) =>
        set({
            input: { ...emptyInput, ...(payload.input ?? {}) },
            templateKey: payload.templateKey ?? 'aurora',
            sections: payload.sections ?? null,
            generationMeta: payload.generationMeta ?? null,
        }),
    updateSection: (key, value) =>
        set((state) => ({
            sections: {
                ...state.sections,
                [key]: value,
            },
        })),
    updateBenefit: (index, value) =>
        set((state) => {
            const benefits = [...(state.sections?.benefits ?? [])];
            benefits[index] = value;
            return {
                sections: {
                    ...state.sections,
                    benefits,
                },
            };
        }),
    addBenefit: () =>
        set((state) => ({
            sections: {
                ...state.sections,
                benefits: [...(state.sections?.benefits ?? []), ''],
            },
        })),
    removeBenefit: (index) =>
        set((state) => {
            const benefits = [...(state.sections?.benefits ?? [])];
            benefits.splice(index, 1);
            return {
                sections: {
                    ...state.sections,
                    benefits,
                },
            };
        }),
    updateFeature: (index, field, value) =>
        set((state) => {
            const features = [...(state.sections?.features ?? [])];
            const feature = { ...(features[index] ?? { title: '', description: '' }) };
            feature[field] = value;
            features[index] = feature;
            return {
                sections: {
                    ...state.sections,
                    features,
                },
            };
        }),
    addFeature: () =>
        set((state) => ({
            sections: {
                ...state.sections,
                features: [
                    ...(state.sections?.features ?? []),
                    { title: '', description: '' },
                ],
            },
        })),
    removeFeature: (index) =>
        set((state) => {
            const features = [...(state.sections?.features ?? [])];
            features.splice(index, 1);
            return {
                sections: {
                    ...state.sections,
                    features,
                },
            };
        }),
    updatePricing: (key, value) =>
        set((state) => ({
            sections: {
                ...state.sections,
                pricing: {
                    ...(state.sections?.pricing ?? {}),
                    [key]: value,
                },
            },
        })),
    updateCta: (key, value) =>
        set((state) => ({
            sections: {
                ...state.sections,
                cta: {
                    ...(state.sections?.cta ?? {}),
                    [key]: value,
                },
            },
        })),
    ensureSections: () =>
        set((state) => ({
            sections: state.sections ?? { ...emptySections },
        })),
}));

export const defaultSections = emptySections;
