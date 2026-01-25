/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#991b1bc4', // Red with transparency
                    hover: '#b91c1cc4',   // Lighter Red with transparency
                },
                background: {
                    DEFAULT: '#FFFFFF',
                    secondary: '#fffafa', // Aesthetic very light red tint
                },
                text: {
                    primary: '#1F2937',
                    secondary: '#6B7280',
                },
                border: {
                    DEFAULT: '#E5E7EB',
                }
            }
        },
    },
    plugins: [],
}
