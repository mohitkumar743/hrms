import { Building2, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { Card, DataTable, LoadingState, PageHeader, StatCard } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : '-';
}

export default function SuperAdminDashboard() {
  const query = useApiQuery('companies', '/companies');
  const companies = query.data || [];
  const activeCompanies = companies.filter((company) => company.status === 'ACTIVE');
  const inactiveCompanies = companies.filter((company) => company.status === 'INACTIVE');
  const recentCompanies = [...companies]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  const columns = [
    { key: 'name', label: 'Company', render: (company) => (
      <div>
        <p className="font-bold text-slate-950">{company.name}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-400">{company.legalName || company.industry || '-'}</p>
      </div>
    ) },
    { key: 'contact', label: 'Contact', render: (company) => (
      <div>
        <p>{company.email || '-'}</p>
        <p className="mt-0.5 text-xs text-slate-500">{company.phone || '-'}</p>
      </div>
    ) },
    { key: 'location', label: 'Location', render: (company) => [company.city, company.state].filter(Boolean).join(', ') || '-' },
    { key: 'status', label: 'Status', render: (company) => (
      <span className={`inline-flex rounded px-3 py-1 text-xs font-bold ${company.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
        {company.status || '-'}
      </span>
    ) },
    { key: 'createdAt', label: 'Onboarded', render: (company) => formatDate(company.createdAt) }
  ];

  if (query.isLoading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Super Admin Dashboard" subtitle="Overview of onboarded companies and tenant activity" />
      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Building2} label="Total Companies" value={companies.length} helper="All tenant companies" tone="teal" />
        <StatCard icon={CheckCircle2} label="Active Companies" value={activeCompanies.length} helper="Currently enabled" tone="green" />
        <StatCard icon={XCircle} label="Inactive Companies" value={inactiveCompanies.length} helper="Disabled tenants" tone="orange" />
        <StatCard icon={Clock3} label="Recent Onboarding" value={recentCompanies[0]?.name || '-'} helper={recentCompanies[0] ? formatDate(recentCompanies[0].createdAt) : 'No companies yet'} tone="blue" />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-slate-400">Active Ratio</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">{companies.length ? Math.round((activeCompanies.length / companies.length) * 100) : 0}%</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">{activeCompanies.length} of {companies.length} companies active</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-slate-400">Industries</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">{new Set(companies.map((company) => company.industry).filter(Boolean)).size}</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">Unique industries captured</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-slate-400">Locations</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">{new Set(companies.map((company) => company.city).filter(Boolean)).size}</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">Cities in company profiles</p>
        </Card>
      </div>

      <DataTable columns={columns} rows={recentCompanies} empty="No companies onboarded yet" />
    </>
  );
}
