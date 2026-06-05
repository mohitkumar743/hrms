import { featurePages, siteConfig } from '../lib/site.js';

export const dynamic = 'force-static';

export function GET() {
  const featureLinks = featurePages
    .map((page) => `- ${page.title.replace(' | Attendo', '')}: ${new URL(page.path, siteConfig.url)}`)
    .join('\n');

  const body = `# Attendo

> Attendo is a web-based attendance, HR operations, leave, payroll, reporting, and multi-company administration platform.

Official site: ${siteConfig.url}/

## Product Summary

Attendo helps organizations manage employee attendance and HR operations from a single portal. It supports company admins, employees, and super admins. Core workflows include employee self punch, QR attendance scanning, attendance regularization, leave requests, payroll generation, notices, events, reports, settings, company onboarding, and page permissions.

## Primary Pages

- Home: ${siteConfig.url}/
${featureLinks}

## Core Features

- Employee punch in and punch out.
- QR code attendance scanning.
- Attendance status tracking for present, late, absent, on leave, and missed punch out.
- Attendance regularization for corrected punch in and punch out times.
- Leave application and admin leave decisions.
- Payroll generation using attendance, absences, late fines, overtime, and salary data.
- Payroll locking and salary history.
- Employee management with profile, department, designation, salary, and QR code fields.
- Notice board and event publishing.
- Reports for attendance, leave, payroll, late entries, payroll cost, and locked payrolls.
- Multi-company setup with super admin controls and page permissions.
- Activity report for delete audit visibility.

## Intended Audience

Attendo is intended for companies, offices, institutes, agencies, and operations teams that need a practical attendance and HR management system with payroll support.

## Technology Context

The full product uses a React frontend and a Node.js Express backend. The backend provides API routes for authentication, companies, employees, attendance, activity, notices, events, leave, payroll, pages, settings, and reports.

## Contact

For demos or deployment questions, contact ${siteConfig.contactEmail}.
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600'
    }
  });
}
