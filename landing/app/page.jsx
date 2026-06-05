import Link from 'next/link';
import { Cta } from './components/SiteChrome.jsx';
import { absoluteUrl, buildPageMetadata, contactHref, siteConfig } from './lib/site.js';

export const metadata = buildPageMetadata({
  title: 'Attendo | Attendance, HR and Payroll Management Software',
  description:
    'Attendo is a production-ready attendance and HR operations platform for employee punch in, QR attendance, leave tracking, payroll, reports, and multi-company administration.'
});

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Attendance, HR operations, leave, payroll, reporting, and multi-company employee management software.',
    url: siteConfig.url,
    image: absoluteUrl(siteConfig.icon),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock'
    }
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="hero">
        <div className="hero-inner">
          <div>
            <p className="eyebrow">Attendance and HR operations software</p>
            <h1>Attendo</h1>
            <p className="hero-copy">
              Manage employee punch in, punch out, QR attendance, leave requests, payroll
              generation, company permissions, notices, events, and reports from one focused
              platform.
            </p>
            <div className="hero-actions">
              <a className="button primary" href={contactHref()}>
                Book a walkthrough
              </a>
              <Link className="button secondary" href="/features/attendance">
                Explore attendance
              </Link>
            </div>
            <div className="trust-row" aria-label="Attendo highlights">
              <div className="metric">
                <strong>QR</strong>
                <span>attendance scanning</span>
              </div>
              <div className="metric">
                <strong>3 roles</strong>
                <span>super admin, admin, employee</span>
              </div>
              <div className="metric">
                <strong>Payroll</strong>
                <span>attendance-linked salary runs</span>
              </div>
            </div>
          </div>

          <aside className="product-panel" aria-label="Attendo product preview">
            <div className="panel-top">
              <img src={siteConfig.icon} alt="Attendo icon" />
              <span className="panel-status">Live workforce view</span>
            </div>
            <div className="dashboard-preview">
              <div className="preview-grid">
                <div className="preview-card">
                  <h3>Present Today</h3>
                  <p className="lead">88% workforce</p>
                  <div className="bar">
                    <span style={{ width: '88%', background: 'var(--teal)' }} />
                  </div>
                </div>
                <div className="preview-card">
                  <h3>Open Punch</h3>
                  <p className="lead">missed punch out alerts</p>
                  <div className="bar">
                    <span style={{ width: '24%', background: 'var(--blue)' }} />
                  </div>
                </div>
              </div>
              <div className="table-card">
                <div className="table-row">
                  <span>Employee</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>
                <div className="table-row">
                  <span>Anita Sharma</span>
                  <span>
                    <span className="status green">Present</span>
                  </span>
                  <span>09:31 AM</span>
                </div>
                <div className="table-row">
                  <span>Rahul Verma</span>
                  <span>
                    <span className="status orange">Late</span>
                  </span>
                  <span>10:08 AM</span>
                </div>
                <div className="table-row">
                  <span>Neha Jain</span>
                  <span>
                    <span className="status blue">On leave</span>
                  </span>
                  <span>Approved</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-title">
          <h2>Everything needed for everyday attendance and HR control.</h2>
          <p>
            Attendo keeps the daily workflow practical: employees can view their attendance,
            admins can manage exceptions, and leadership gets clean reports without spreadsheet
            cleanup.
          </p>
        </div>
        <div className="feature-grid">
          {[
            ['A', 'var(--teal)', 'Attendance tracking', 'Self punch, QR scan, check-in, checkout, late marks, overtime, missed punch alerts, and attendance regularization.'],
            ['L', 'var(--orange)', 'Leave workflow', 'Employees submit leave requests while admins review pending, approved, and rejected leaves with clear history.'],
            ['P', 'var(--blue)', 'Payroll operations', 'Generate salary records from attendance, absence, late fine, overtime, and employee salary data.'],
            ['R', 'var(--red)', 'Reports', 'Review attendance, leave, payroll, late entries, payroll cost, and locked payroll records from one reporting area.'],
            ['C', 'var(--green)', 'Company controls', 'Super admins can onboard companies, assign page permissions, and manage multi-tenant company setup.'],
            ['N', '#7c3aed', 'Notices and events', 'Publish workplace notices and events so employees see relevant internal updates inside the portal.']
          ].map(([badge, color, title, copy]) => (
            <article className="feature-card" key={title}>
              <strong style={{ background: color }}>{badge}</strong>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="band" id="reports">
        <div className="section split">
          <div className="section-title">
            <h2>Built for admins who need fewer manual corrections.</h2>
            <p>
              Attendo connects attendance records with payroll and reporting, so HR teams can see
              what happened and act on it quickly.
            </p>
          </div>
          <ul className="check-list">
            <li>Role-based access for super admins, company admins, and employees.</li>
            <li>QR scanner support for controlled workplace attendance capture.</li>
            <li>Attendance regularization for missed or incorrect punch records.</li>
            <li>Activity reports for company-wise delete audits and operational traceability.</li>
            <li>Settings for company profile, attendance schedule, grace period, and late fine policy.</li>
          </ul>
        </div>
      </section>

      <section className="section narrow">
        <div className="section-title">
          <h2>Designed for growing teams and multi-company operations.</h2>
          <p>
            Use Attendo for offices, agencies, field teams, institutes, and distributed company
            groups that need a clear source of truth for people operations.
          </p>
        </div>
      </section>

      <Cta
        heading="Deploy Attendo for attendance, HR, and payroll."
        copy="Give your team a single place for punch records, leave decisions, salary runs, employee data, notices, and reports."
      />
    </main>
  );
}
