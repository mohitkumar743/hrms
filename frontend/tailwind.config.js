export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif']
      },
      colors: {
        primary: { DEFAULT: 'var(--color-brand-primary)', dark: 'var(--color-brand-primary-dark)' },
        accent: {
          orange: 'var(--color-accent-orange)',
          purple: 'var(--color-accent-purple)',
          green: 'var(--color-accent-green)',
          sky: 'var(--color-accent-sky)'
        },
        app: {
          bg: 'var(--color-surface-app)',
          panel: 'var(--color-surface-panel)',
          muted: 'var(--color-surface-muted)'
        },
        ink: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          danger: 'var(--color-text-danger)'
        }
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        panel: 'var(--shadow-panel)'
      }
    }
  },
  plugins: []
};
