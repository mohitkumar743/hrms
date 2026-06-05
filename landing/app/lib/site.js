export const siteConfig = {
  name: 'Attendo',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://attendo.in',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@attendo.in',
  description:
    'Attendo is attendance, HR operations, leave, payroll, reporting, and multi-company administration software for growing teams.',
  logo: '/assets/horizoanllogoandnaem.png',
  icon: '/assets/Icon.png'
};

export const navLinks = [
  { label: 'Attendance', href: '/features/attendance' },
  { label: 'Payroll', href: '/features/payroll' },
  { label: 'HR Operations', href: '/features/hr-operations' },
  { label: 'Reports', href: '/#reports' }
];

export const featurePages = [
  {
    slug: 'attendance',
    path: '/features/attendance',
    title: 'Attendance Management Software | Attendo',
    description:
      'Attendo attendance management software supports self punch, QR attendance, punch in, punch out, late marks, overtime, missed punch alerts, and regularization.',
    eyebrow: 'Attendance software',
    heading: 'Attendance management built around real punch records.',
    copy:
      'Attendo helps companies capture check-in and checkout time, identify late entries, manage missed punch out cases, and keep employee attendance history ready for payroll and reports.',
    primaryCta: 'Talk to sales',
    secondaryCta: 'See payroll',
    secondaryHref: '/features/payroll',
    sectionHeading: 'Capture, correct, and report attendance from one place.',
    sectionCopy:
      'Employees can punch themselves in and out, admins can scan QR codes, and HR can regularize exceptional records without losing the daily audit trail.',
    cards: [
      {
        badge: '1',
        color: 'var(--teal)',
        title: 'Self punch',
        copy: 'Employees can punch in and punch out from their own dashboard with live duration and daily status.'
      },
      {
        badge: '2',
        color: 'var(--blue)',
        title: 'QR scanner',
        copy: 'Admins can scan employee QR cards or enter QR values manually to record attendance at the workplace.'
      },
      {
        badge: '3',
        color: 'var(--orange)',
        title: 'Late and overtime',
        copy: 'Track late minutes, overtime minutes, absent status, leave status, and present status for daily operations.'
      }
    ],
    bandHeading: 'Useful attendance records for payroll.',
    bandCopy:
      'Attendo attendance data flows into payroll generation, reports, and employee-facing history screens.',
    bullets: [
      'Punch in and punch out time history for each employee.',
      'Missed punch out visibility for incomplete attendance days.',
      'Admin regularization for corrected punch in and punch out times.',
      'Attendance filtering by date, employee, and status.',
      'Attendance reports for present, late, leave, absent, and overtime records.'
    ],
    ctaHeading: 'Make attendance easier to trust.',
    ctaCopy:
      'Use Attendo to manage attendance capture, correction, and reporting before payroll work begins.'
  },
  {
    slug: 'payroll',
    path: '/features/payroll',
    title: 'Payroll Management Software | Attendo',
    description:
      'Attendo payroll management software generates salary records using attendance, absences, late fines, overtime, employee salary, and locked payroll history.',
    eyebrow: 'Payroll software',
    heading: 'Payroll that starts with attendance truth.',
    copy:
      'Attendo helps HR teams generate monthly salary records using attendance, absences, late fines, overtime, and employee salary information.',
    primaryCta: 'Book a payroll demo',
    secondaryCta: 'See attendance',
    secondaryHref: '/features/attendance',
    sectionHeading: 'Generate, review, and lock salary records.',
    sectionCopy:
      'Attendo keeps payroll close to attendance so HR teams can reduce manual calculations and give employees access to their salary history.',
    cards: [
      {
        badge: 'S',
        color: 'var(--green)',
        title: 'Salary generation',
        copy: 'Create monthly payroll using employee base salary, attendance records, absence deductions, late fines, and overtime.'
      },
      {
        badge: 'F',
        color: 'var(--orange)',
        title: 'Fine policy',
        copy: 'Configure late fine policy and connect repeated late marks to payroll calculations when needed.'
      },
      {
        badge: 'H',
        color: 'var(--blue)',
        title: 'Salary history',
        copy: 'Employees can view generated monthly salary records while admins can review and lock payroll runs.'
      }
    ],
    bandHeading: 'Payroll reports without spreadsheet cleanup.',
    bandCopy:
      'Use reports to review payroll cost, locked records, leave status, attendance status, and late entries.',
    bullets: [
      'Payroll by month reporting.',
      'Final salary records with employee details.',
      'Locked payroll state for completed salary runs.',
      'Attendance-linked deductions and overtime support.',
      'Company admin and employee role views.'
    ],
    ctaHeading: 'Turn attendance data into payroll records.',
    ctaCopy:
      'Attendo gives HR teams a more connected workflow from daily attendance to monthly salary output.'
  },
  {
    slug: 'hr-operations',
    path: '/features/hr-operations',
    title: 'HR Operations Software | Attendo',
    description:
      'Attendo HR operations software manages employees, company onboarding, leave requests, notices, events, permissions, reports, and activity audits.',
    eyebrow: 'HR operations software',
    heading: 'One portal for company admins, employees, and super admins.',
    copy:
      'Attendo supports employee records, company onboarding, leave approvals, notices, events, reports, permissions, and activity audit screens for multi-company HR operations.',
    primaryCta: 'Plan your setup',
    secondaryCta: 'Back to home',
    secondaryHref: '/',
    sectionHeading: 'Organized workflows for everyday HR administration.',
    sectionCopy:
      'Attendo gives admins the screens they need to manage people data and gives employees a clear portal for their own attendance, leave, notices, and salary history.',
    cards: [
      {
        badge: 'E',
        color: 'var(--red)',
        title: 'Employee records',
        copy: 'Maintain employee profile, department, designation, contact, salary, and QR code information.'
      },
      {
        badge: 'L',
        color: 'var(--teal)',
        title: 'Leave approvals',
        copy: 'Track leave applications and approve or reject requests with company admin controls.'
      },
      {
        badge: 'M',
        color: 'var(--blue)',
        title: 'Multi-company setup',
        copy: 'Onboard companies, assign page permissions, and separate tenant data for company-level operations.'
      }
    ],
    bandHeading: 'Communication and audit screens included.',
    bandCopy:
      'HR work does not stop at attendance. Attendo also keeps notices, events, reports, settings, and activity history in the same system.',
    bullets: [
      'Notice board for company announcements.',
      'Events management for workplace activity updates.',
      'Activity report for company-wise delete audit trails.',
      'Company profile, contact, registration, and address views.',
      'Role-based navigation for super admin, company admin, and employee users.'
    ],
    ctaHeading: 'Keep HR operations visible and connected.',
    ctaCopy:
      'Deploy Attendo as the operating layer for employee data, attendance, leaves, payroll, and reports.'
  }
];

export function absoluteUrl(path = '/') {
  return new URL(path, siteConfig.url).toString();
}

export function contactHref() {
  return `mailto:${siteConfig.contactEmail}`;
}

export function buildPageMetadata({ title, description, path = '/', image = siteConfig.logo }) {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      images: [{ url: absoluteUrl(image), alt: `${siteConfig.name} logo` }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl(image)]
    },
    robots: {
      index: true,
      follow: true
    }
  };
}
