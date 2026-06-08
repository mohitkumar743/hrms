# Attendo Static Next Project

This project serves the mirrored `attendo.in` WordPress/Elementor pages through Next.js.

## Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Edit Pages

The copied pages are in `public`.

- Home: `public/index.html`
- About: `public/about/index.html`
- Pricing: `public/pricing/index.html`
- Addons: `public/addon/index.html`
- Site assets: `public/assets`
- WordPress runtime files used by the static copy: `public/vendor/wordpress`
- CDN/font assets: `public/vendor/cdn.jsdelivr`
- External theme media: `public/external/themexriver`
- Static JSON data: `public/data/wp-json`

The Next route in `app/[[...path]]/route.js` maps clean URLs like `/about` and `/addon/payroll` to the matching static HTML files.

For exact visual matching, keep the original CSS/JS asset paths unless you are intentionally rebuilding a page as React components.
