// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#000000', // black background
                accent: '#FBBF24', // bright yellow
                muted: 'hsl(210, 10%, 90%)',
            },
            fontFamily: {
                sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
                serif: ['"Instrument Serif"', 'serif'],
            },
            boxShadow: {
                glass: '0 4px 30px rgba(0,0,0,0.12)',
            },
        },
    },
    plugins: [],
};
