import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx}',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: [
                    '"Avenir Next"',
                    'Avenir',
                    '"Helvetica Neue"',
                    ...defaultTheme.fontFamily.sans,
                ],
                display: [
                    '"Avenir Next"',
                    'Avenir',
                    '"Helvetica Neue"',
                    'sans-serif',
                ],
                editorial: ['"Iowan Old Style"', 'Georgia', 'serif'],
            },
        },
    },

    plugins: [forms],
};
