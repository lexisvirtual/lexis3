/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0f172a',
                accent: '#fbd24c',
                secondary: '#94a3b8',
                highlight: '#8c5414',
                neutralIcon: '#798c8c',
                softOverlay: '#f59e0b33',
                lexisPurple: '#820AD1',
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'gradient-x': 'gradient-x 15s ease infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-slow': 'float-slow 8s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'modal-in': 'modal-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'overlay-in': 'overlay-in 0.4s ease-out forwards',
            },
            keyframes: {
                'gradient-x': {
                    '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
                    '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'float-slow': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                'modal-in': {
                    '0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
                    '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
                },
                'overlay-in': {
                    '0%': { opacity: '0', backdropFilter: 'blur(0px)' },
                    '100%': { opacity: '1', backdropFilter: 'blur(8px)' },
                }
            }
        }
    },
    plugins: [],
}
