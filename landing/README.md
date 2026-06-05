# Attendo Landing

Next.js SEO landing site for Attendo. This folder is intentionally separate from the main frontend app so it can be deployed on its own domain or subdomain.

## Structure

- `app/page.jsx` - main landing page.
- `app/features/attendance/page.jsx` - attendance software landing page.
- `app/features/payroll/page.jsx` - payroll software landing page.
- `app/features/hr-operations/page.jsx` - HR operations landing page.
- `app/lib/site.js` - central site URL, contact email, navigation, metadata, and feature page SEO copy.
- `app/sitemap.js` - generated sitemap.
- `app/robots.js` - generated robots file.
- `app/llms.txt/route.js` - static `llms.txt` route for AI crawlers and LLM tools.
- `public/assets/` - copied Attendo logo and icon files used by Next.js.

## Run

```bash
npm install
npm run dev
```

## SEO Config

Set these environment variables for production:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_CONTACT_EMAIL=sales@your-domain.com
```

Most page titles, descriptions, canonical URLs, sitemap entries, Open Graph metadata, and `llms.txt` content are controlled from `app/lib/site.js`.
