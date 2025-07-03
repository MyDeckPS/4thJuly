import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				'warm-sage': 'hsl(var(--warm-sage))',
				'soft-blue': 'hsl(var(--soft-blue))',
				'warm-peach': 'hsl(var(--warm-peach))',
				'cream': 'hsl(var(--cream))',
				'forest': 'hsl(var(--forest))',
				// Override emerald-50 with custom color
				emerald: {
					50: '#FFE0E9',
					100: '#dcfce7',
					200: '#bbf7d0',
					300: '#86efac',
					400: '#4ade80',
					500: '#22c55e',
					600: '#16a34a',
					700: '#15803d',
					800: '#166534',
					900: '#14532d',
					950: '#052e16'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				script: ['Brush Script MT', 'Lucida Handwriting', 'cursive'],
			},
			spacing: {
				'safe-area-bottom': 'env(safe-area-inset-bottom)',
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
				'fade-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'bubble-float': {
					'0%': { transform: 'translateY(100vh) scale(0)', opacity: '0' },
					'10%': { opacity: '0.6' },
					'90%': { opacity: '0.6' },
					'100%': { transform: 'translateY(-10vh) scale(1)', opacity: '0' }
				},
				'pulse-wave': {
					'0%': { transform: 'translateX(-100%) skewX(-12deg)', opacity: '0' },
					'50%': { opacity: '1' },
					'100%': { transform: 'translateX(200%) skewX(-12deg)', opacity: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-up': 'fade-up 0.8s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'bubble-float-1': 'bubble-float 8s ease-in-out infinite',
				'bubble-float-2': 'bubble-float 10s ease-in-out infinite 2s',
				'bubble-float-3': 'bubble-float 12s ease-in-out infinite 4s',
				'pulse-wave': 'pulse-wave 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
