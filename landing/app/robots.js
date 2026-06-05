import { siteConfig } from './lib/site.js';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/'
    },
    sitemap: `${siteConfig.url}/sitemap.xml`
  };
}
