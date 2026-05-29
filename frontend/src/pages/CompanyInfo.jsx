import { Building2, Globe2, MapPin, Phone } from 'lucide-react';
import { Card, LoadingState, PageHeader } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value || '-'}</p>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3">
        <Icon className="text-primary" size={17} />
        <h2 className="text-sm font-bold text-slate-950">{title}</h2>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </Card>
  );
}

export default function CompanyInfo() {
  const query = useApiQuery('company-info', '/companies/me');
  const company = query.data;

  if (query.isLoading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Company Info" subtitle="Registered company profile and onboarding details" />
      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-lg font-bold text-white">
                {(company?.name || 'C').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-950">{company?.name || '-'}</h2>
                <p className="mt-0.5 text-sm font-semibold text-slate-500">{company?.legalName || company?.industry || 'Company profile'}</p>
              </div>
            </div>
            <span className="inline-flex w-fit rounded bg-green-100 px-3 py-1 text-xs font-bold text-green-700">{company?.status || '-'}</span>
          </div>
        </Card>

        <Section title="Profile" icon={Building2}>
          <InfoItem label="Legal Name" value={company?.legalName} />
          <InfoItem label="Industry" value={company?.industry} />
          <InfoItem label="Company Type" value={company?.companyType} />
          <InfoItem label="Established Date" value={company?.establishedDate} />
          <InfoItem label="Employee Strength" value={company?.employeeStrength} />
        </Section>

        <Section title="Registration" icon={Globe2}>
          <InfoItem label="Registration / CIN" value={company?.registrationNumber} />
          <InfoItem label="GST Number" value={company?.gstNumber} />
          <InfoItem label="PAN Number" value={company?.panNumber} />
          <InfoItem label="Website" value={company?.website} />
        </Section>

        <Section title="Contact" icon={Phone}>
          <InfoItem label="Company Email" value={company?.email} />
          <InfoItem label="Company Phone" value={company?.phone} />
          <InfoItem label="Contact Person" value={company?.contactPersonName} />
          <InfoItem label="Contact Email" value={company?.contactPersonEmail} />
          <InfoItem label="Contact Phone" value={company?.contactPersonPhone} />
        </Section>

        <Section title="Address" icon={MapPin}>
          <InfoItem label="Address Line 1" value={company?.addressLine1} />
          <InfoItem label="Address Line 2" value={company?.addressLine2} />
          <InfoItem label="City" value={company?.city} />
          <InfoItem label="State" value={company?.state} />
          <InfoItem label="Country" value={company?.country} />
          <InfoItem label="Pincode" value={company?.pincode} />
        </Section>
      </div>
    </>
  );
}
