import Link from 'next/link';
import { contactHref } from '../lib/site.js';
import { Cta } from './SiteChrome.jsx';

export function FeaturePage({ page }) {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.heading}</h1>
          <p className="hero-copy">{page.copy}</p>
          <div className="hero-actions">
            <a className="button primary" href={contactHref()}>
              {page.primaryCta}
            </a>
            <Link className="button secondary" href={page.secondaryHref}>
              {page.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          <h2>{page.sectionHeading}</h2>
          <p>{page.sectionCopy}</p>
        </div>
        <div className="feature-grid">
          {page.cards.map((card) => (
            <article className="feature-card" key={card.title}>
              <strong style={{ background: card.color }}>{card.badge}</strong>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="section split">
          <div className="section-title">
            <h2>{page.bandHeading}</h2>
            <p>{page.bandCopy}</p>
          </div>
          <ul className="check-list">
            {page.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <Cta heading={page.ctaHeading} copy={page.ctaCopy} />
    </main>
  );
}
