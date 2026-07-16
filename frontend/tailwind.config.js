/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme specifications
        primary: '#2563EB',
        secondary: '#475569',
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
        text: '#0F172A',
        background: '#F8FAFC',
        card: '#FFFFFF',

        // Global color overrides for theme consistency
        indigo: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          505: '#3b82f6',
          500: '#2563eb', // Primary
          600: '#2563eb', // Primary
          650: '#1d4ed8',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        slate: {
          50: '#F8FAFC',  // Background
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          450: '#64748b',
          500: '#475569', // Secondary
          550: '#475569', // Secondary
          600: '#475569', // Secondary
          650: '#334155',
          700: '#334155',
          800: '#0F172A', // Text
          850: '#0F172A', // Text
          900: '#0F172A', // Text
          950: '#020617',
        },
        emerald: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#16A34A', // Success
          600: '#16A34A', // Success
          700: '#15803d',
        },
        green: {
          500: '#16A34A', // Success
          600: '#16A34A', // Success
        },
        amber: {
          50: '#fffbeb',
          500: '#F59E0B', // Warning
          600: '#F59E0B', // Warning
        },
        red: {
          50: '#fef2f2',
          500: '#DC2626', // Error
          600: '#DC2626', // Error
          650: '#DC2626', // Error
        }
      }
    },
  },
  plugins: [],
}
