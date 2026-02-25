import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            fontFamily: {
                orbitron: ['Orbitron', 'monospace'],
                rajdhani: ['Rajdhani', 'sans-serif'],
                mono: ['Share Tech Mono', 'monospace'],
            },
            colors: {
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                },
                jarvis: {
                    cyan: 'oklch(0.78 0.18 195)',
                    'cyan-bright': 'oklch(0.88 0.22 195)',
                    'cyan-dim': 'oklch(0.55 0.14 195)',
                    gold: 'oklch(0.72 0.16 65)',
                    'gold-bright': 'oklch(0.85 0.18 65)',
                    'gold-dim': 'oklch(0.55 0.12 65)',
                    dark: 'oklch(0.06 0.01 220)',
                    'dark-mid': 'oklch(0.1 0.02 220)',
                    panel: 'oklch(0.12 0.025 220)',
                    red: 'oklch(0.65 0.22 25)',
                    green: 'oklch(0.72 0.18 150)',
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
                'glow-cyan': '0 0 20px oklch(0.78 0.18 195 / 0.4), 0 0 40px oklch(0.78 0.18 195 / 0.2)',
                'glow-gold': '0 0 20px oklch(0.72 0.16 65 / 0.4), 0 0 40px oklch(0.72 0.16 65 / 0.2)',
                'glow-cyan-strong': '0 0 30px oklch(0.78 0.18 195 / 0.7), 0 0 60px oklch(0.78 0.18 195 / 0.4)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'pulse-ring': {
                    '0%': { transform: 'scale(1)', opacity: '0.8' },
                    '100%': { transform: 'scale(1.5)', opacity: '0' }
                },
                'spin-slow': {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' }
                },
                'spin-reverse': {
                    from: { transform: 'rotate(360deg)' },
                    to: { transform: 'rotate(0deg)' }
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 10px oklch(0.78 0.18 195 / 0.3)' },
                    '50%': { boxShadow: '0 0 30px oklch(0.78 0.18 195 / 0.8), 0 0 60px oklch(0.78 0.18 195 / 0.4)' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                'data-flow': {
                    '0%': { transform: 'translateY(100%)', opacity: '0' },
                    '10%': { opacity: '1' },
                    '90%': { opacity: '1' },
                    '100%': { transform: 'translateY(-100%)', opacity: '0' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
                'spin-slow': 'spin-slow 8s linear infinite',
                'spin-medium': 'spin-slow 4s linear infinite',
                'spin-reverse': 'spin-reverse 6s linear infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'data-flow': 'data-flow 3s linear infinite',
            }
        }
    },
    plugins: [typography, containerQueries, animate]
};
