/** @type {import('tailwindcss').Config} */
module.exports = {
    plugins: [require('@tailwindcss/line-clamp')],
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                fadeOut: {
                    '0%': { opacity: '1', transform: 'scale(1)' },
                    '100%': { opacity: '0', transform: 'scale(0.95)' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.3s ease-out forwards',
                fadeOut: 'fadeOut 0.3s ease-in forwards',
            },
            transitionProperty: {
                'transform-opacity': 'transform, opacity',
            },
        },
    },
    plugins: [],
};
