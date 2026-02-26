/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                cyan: {
                    DEFAULT: '#00f5ff',
                    dim: '#00c8d4',
                    dark: '#006e7a',
                },
                dark: {
                    DEFAULT: '#050505',
                    card: '#0d0d0d',
                    input: '#0a0a0a',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Montserrat', 'Inter', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'neon-cyan': '0 0 20px #00f5ff, 0 0 60px #00f5ff40, 0 0 120px #00f5ff20',
                'neon-cyan-sm': '0 0 10px #00f5ff, 0 0 30px #00f5ff50',
                'card': 'inset 0 1px 0 rgba(255,255,255,0.05)',
            },
            animation: {
                'pulse-cyan': 'pulseCyan 2s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2.5s linear infinite',
                'count-up': 'countUp 0.3s ease-out',
                'gradient': 'gradient 8s ease infinite',
            },
            keyframes: {
                pulseCyan: {
                    '0%, 100%': { boxShadow: '0 0 20px #00f5ff, 0 0 60px #00f5ff40' },
                    '50%': { boxShadow: '0 0 35px #00f5ff, 0 0 100px #00f5ff80' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
        },
    },
    plugins: [],
}
