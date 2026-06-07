export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
extend: {
      colors: {
        // This maps 'text-main' to var(--color-text-main)
        main: 'var(--color-text-main)', 
        muted: 'var(--color-text-muted)',
        // This maps 'bg-page' to var(--color-bg-page)
        page: 'var(--color-bg-page)', 
        brand: {
          DEFAULT: 'var(--color-brand)',
          hover: 'var(--color-brand-hover)',
          subtle: 'var(--color-brand-subtle)',
        },
      }
    },
  plugins: [],
};
