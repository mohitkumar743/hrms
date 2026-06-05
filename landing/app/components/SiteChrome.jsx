import Link from 'next/link';
import { contactHref, navLinks, siteConfig } from '../lib/site.js';

export function Header() {
  return (
    <header className="site-header">
      <nav className="nav" aria-label="Main navigation">
        <Link className="brand" href="/">
          <img src={siteConfig.logo} alt={siteConfig.name} />
        </Link>
        <div className="nav-links">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <a className="button primary" href={contactHref()}>
          Request demo
        </a>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>© 2026 Attendo. Attendance and HR operations software.</span>
        <div className="footer-links">
          <Link href="/llms.txt">llms.txt</Link>
          <Link href="/sitemap.xml">Sitemap</Link>
          <Link href="/robots.txt">Robots</Link>
        </div>
      </div>
    </footer>
  );
}

export function Cta({ heading, copy }) {
  return (
    <section className="cta">
      <div className="cta-inner">
        <div>
          <h2>{heading}</h2>
          <p>{copy}</p>
        </div>
        <a className="button primary" href={contactHref()}>
          Request demo
        </a>
      </div>
    </section>
  );
}
