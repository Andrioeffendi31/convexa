import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx}',
    ],

    theme: {
        extend: {
            colors: {
                bg: 'hsl(var(--bg) / <alpha-value>)',
                'bg-elevated': 'hsl(var(--bg-elevated) / <alpha-value>)',
                'bg-subtle': 'hsl(var(--bg-subtle) / <alpha-value>)',
                border: 'hsl(var(--border) / <alpha-value>)',
                'border-strong': 'hsl(var(--border-strong) / <alpha-value>)',
                text: 'hsl(var(--text) / <alpha-value>)',
                'text-muted': 'hsl(var(--text-muted) / <alpha-value>)',
                'text-subtle': 'hsl(var(--text-subtle) / <alpha-value>)',
                accent: 'hsl(var(--accent) / <alpha-value>)',
                'accent-2': 'hsl(var(--accent-2) / <alpha-value>)',
                'accent-soft': 'hsl(var(--accent) / 0.12)',
            },
            fontFamily: {
                sans: [
                    'Inter',
                    '"Inter Variable"',
                    ...defaultTheme.fontFamily.sans,
                ],
                display: [
                    '"Geist"',
                    'Inter',
                    ...defaultTheme.fontFamily.sans,
                ],
                mono: [
                    '"JetBrains Mono"',
                    '"Fira Code"',
                    ...defaultTheme.fontFamily.mono,
                ],
                editorial: ['"Iowan Old Style"', 'Georgia', 'serif'],
            },
            boxShadow: {
                glow: '0 0 0 1px hsl(var(--accent) / 0.35), 0 8px 32px -8px hsl(var(--accent) / 0.45)',
                'glow-cyan': '0 0 0 1px hsl(var(--accent-2) / 0.35), 0 8px 32px -8px hsl(var(--accent-2) / 0.45)',
                'inner-soft': 'inset 0 1px 0 0 hsl(0 0% 100% / 0.04)',
                premium: '0 30px 80px -30px hsl(262 83% 50% / 0.45), 0 0 0 1px hsl(var(--border))',
            },
            backgroundImage: {
                'gradient-accent':
                    'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--accent-2)) 100%)',
                'gradient-mesh':
                    'radial-gradient(at 20% 20%, hsl(262 83% 50% / 0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, hsl(188 95% 50% / 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, hsl(316 80% 60% / 0.14) 0px, transparent 50%)',
                'grid-pattern':
                    'linear-gradient(hsl(var(--border) / 0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.6) 1px, transparent 1px)',
            },
            backgroundSize: {
                grid: '32px 32px',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                aurora: {
                    '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
                    '33%': { transform: 'translate3d(40px, -20px, 0) scale(1.1)' },
                    '66%': { transform: 'translate3d(-30px, 30px, 0) scale(0.95)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                'pulse-glow': {
                    '0%, 100%': {
                        boxShadow:
                            '0 0 0 0 hsl(var(--accent) / 0.45)',
                    },
                    '50%': {
                        boxShadow:
                            '0 0 0 12px hsl(var(--accent) / 0)',
                    },
                },
                'caret-blink': {
                    '0%, 49%': { opacity: '1' },
                    '50%, 100%': { opacity: '0' },
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(24px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in-scale': {
                    '0%': { opacity: '0', transform: 'scale(0.96)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'gradient-x': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
            animation: {
                shimmer: 'shimmer 2.5s linear infinite',
                aurora: 'aurora 18s ease-in-out infinite',
                float: 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'caret-blink': 'caret-blink 1s step-end infinite',
                'slide-up': 'slide-up 0.6s ease-out both',
                'fade-in-scale': 'fade-in-scale 0.3s ease-out both',
                'fade-up': 'fade-up 0.6s ease-out both',
                'fade-in': 'fade-in 0.5s ease-out both',
                'gradient-x': 'gradient-x 6s ease infinite',
            },
        },
    },

    plugins: [forms],
};
