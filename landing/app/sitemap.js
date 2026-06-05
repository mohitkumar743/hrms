import { featurePages, siteConfig } from './lib/site.js';

export default function sitemap() {
  const now = new Date('2026-06-05');
  const routes = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    ...featurePages.map((page) => ({
      path: page.path,
      priority: page.slug === 'hr-operations' ? 0.8 : 0.9,
      changeFrequency: 'monthly'
    })),
    { path: '/llms.txt', priority: 0.4, changeFrequency: 'monthly' }
  ];

  return routes.map((route) => ({
    url: new URL(route.path, siteConfig.url).toString(),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
