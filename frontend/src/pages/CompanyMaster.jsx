import { Building2, Eye, EyeOff, KeyRound, Pencil, Wand2, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';
import { useLocation } from 'react-router-dom';
import { Card, DataTable, Field, FormSection, Input, LoadingState, PageHeader, PasswordInput, Select, StatCard, Textarea } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';
import { api } from '../services/api.js';

const emptyForm = {
  name: '',
  legalName: '',
  industry: '',
  companyType: '',
  registrationNumber: '',
  gstNumber: '',
  panNumber: '',
  email: '',
  phone: '',
  website: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  contactPersonName: '',
  contactPersonEmail: '',
  contactPersonPhone: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  establishedDate: '',
  employeeStrength: '',
  status: 'ACTIVE'
};

const editTabs = ['Profile', 'Registration', 'Address', 'Contact', 'Admin Login'];

function generateStrongPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const required = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@#$%'].map((set) => set[Math.floor(Math.random() * set.length)]);
  const rest = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]);
  return [...required, ...rest].sort(() => Math.random() - 0.5).join('');
}

export default function CompanyMaster() {
  const location = useLocation();
  const isOnboardPage = location.pathname.endsWith('/onboard');
  const isViewPage = location.pathname.endsWith('/view');
  const query = useApiQuery('companies', '/companies');
  const [form, setForm] = useState(emptyForm);
  const [editCompany, setEditCompany] = useState(null);
  const [editStep, setEditStep] = useState(0);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const client = useQueryClient();
  const submitForm = (event) => {
    event.preventDefault();
    mutation.mutate(form);
  };

  const mutation = useMutation((payload) => api.post('/companies', payload), {
    onSuccess: () => {
      toast.success('Company created');
      setForm(emptyForm);
      client.invalidateQueries('companies');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to save company')
  });
  const updateMutation = useMutation((payload) => api.put(`/companies/${payload.id}`, payload), {
    onSuccess: () => {
      toast.success('Company updated');
      setEditCompany(null);
      client.invalidateQueries('companies');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update company')
  });
  const togglePassword = (id) => setVisiblePasswords((current) => ({ ...current, [id]: !current[id] }));

  const columns = [
    { key: 'name', label: 'Company', render: (row) => (
      <div>
        <p className="font-bold text-slate-950">{row.name}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-400">{row.legalName || row.industry || '-'}</p>
      </div>
    ) },
    { key: 'contact', label: 'Contact', render: (row) => (
      <div>
        <p>{row.email || '-'}</p>
        <p className="mt-0.5 text-xs text-slate-500">{row.phone || row.website || '-'}</p>
      </div>
    ) },
    { key: 'adminLogin', label: 'Portal Login', render: (row) => (
      <div>
        <p className="font-semibold text-slate-700">{row.adminEmail || '-'}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <span>{row.adminPassword ? (visiblePasswords[row.id] ? row.adminPassword : '********') : '-'}</span>
          {row.adminPassword && (
            <button type="button" className="text-slate-500 hover:text-primary" aria-label="View company password" onClick={() => togglePassword(row.id)}>
              {visiblePasswords[row.id] ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
        </div>
      </div>
    ) },
    { key: 'location', label: 'Location', render: (row) => [row.city, row.state].filter(Boolean).join(', ') || '-' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-' },
    { key: 'action', label: 'Action', render: (row) => (
      <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100" aria-label={`Edit ${row.name}`} onClick={() => { setEditCompany({ ...emptyForm, ...row }); setEditStep(0); }}>
        <Pencil size={15} />
      </button>
    ) }
  ];

  if (query.isLoading) return <LoadingState />;

  return (
    <>
      <PageHeader title={isOnboardPage ? 'Onboard Company' : 'View Companies'} subtitle={isOnboardPage ? 'Create a complete tenant company profile' : 'Review onboarded tenant company details'} />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <StatCard icon={Building2} label="Total Companies" value={query.data?.length || 0} tone="teal" />
        <StatCard label="Active" value={(query.data || []).filter((company) => company.status === 'ACTIVE').length} tone="green" />
        <StatCard label="Inactive" value={(query.data || []).filter((company) => company.status === 'INACTIVE').length} tone="orange" />
      </div>
      {isOnboardPage && (
        <form onSubmit={submitForm}>
          <FormSection title="Company Profile">
            <Field label="Brand / Display Name" required><Input required placeholder="Acme HR" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
            <Field label="Legal Name"><Input placeholder="Acme HR Private Limited" value={form.legalName} onChange={(event) => setForm({ ...form, legalName: event.target.value })} /></Field>
            <Field label="Industry"><Input placeholder="IT Services" value={form.industry} onChange={(event) => setForm({ ...form, industry: event.target.value })} /></Field>
            <Field label="Company Type"><Select value={form.companyType} onChange={(event) => setForm({ ...form, companyType: event.target.value })}>
              <option value="">Select type</option>
              <option value="Private Limited">Private Limited</option>
              <option value="LLP">LLP</option>
              <option value="Partnership">Partnership</option>
              <option value="Proprietorship">Proprietorship</option>
              <option value="Public Limited">Public Limited</option>
            </Select></Field>
            <Field label="Established Date"><Input type="date" value={form.establishedDate} onChange={(event) => setForm({ ...form, establishedDate: event.target.value })} /></Field>
            <Field label="Employee Strength"><Input placeholder="1-50" value={form.employeeStrength} onChange={(event) => setForm({ ...form, employeeStrength: event.target.value })} /></Field>
            <Field label="Status" required><Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select></Field>
          </FormSection>
          <FormSection title="Registration & Contact">
            <Field label="Registration / CIN"><Input placeholder="Company registration number" value={form.registrationNumber} onChange={(event) => setForm({ ...form, registrationNumber: event.target.value })} /></Field>
            <Field label="GST Number"><Input placeholder="GSTIN" value={form.gstNumber} onChange={(event) => setForm({ ...form, gstNumber: event.target.value })} /></Field>
            <Field label="PAN Number"><Input placeholder="PAN" value={form.panNumber} onChange={(event) => setForm({ ...form, panNumber: event.target.value })} /></Field>
            <Field label="Company Email"><Input type="email" placeholder="company@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
            <Field label="Company Phone"><Input placeholder="+91 98765 43210" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
            <Field label="Website"><Input placeholder="https://example.com" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></Field>
          </FormSection>
          <FormSection title="Registered Address">
            <Field label="Address Line 1"><Textarea placeholder="Office, building, street" value={form.addressLine1} onChange={(event) => setForm({ ...form, addressLine1: event.target.value })} /></Field>
            <Field label="Address Line 2"><Textarea placeholder="Area, landmark" value={form.addressLine2} onChange={(event) => setForm({ ...form, addressLine2: event.target.value })} /></Field>
            <Field label="City"><Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></Field>
            <Field label="State"><Input value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} /></Field>
            <Field label="Country"><Input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} /></Field>
            <Field label="Pincode"><Input value={form.pincode} onChange={(event) => setForm({ ...form, pincode: event.target.value })} /></Field>
          </FormSection>
          <FormSection title="Primary Contact Person">
            <Field label="Contact Name"><Input placeholder="HR or admin contact" value={form.contactPersonName} onChange={(event) => setForm({ ...form, contactPersonName: event.target.value })} /></Field>
            <Field label="Contact Email"><Input type="email" value={form.contactPersonEmail} onChange={(event) => setForm({ ...form, contactPersonEmail: event.target.value })} /></Field>
            <Field label="Contact Phone"><Input value={form.contactPersonPhone} onChange={(event) => setForm({ ...form, contactPersonPhone: event.target.value })} /></Field>
          </FormSection>
          <FormSection title="Company Admin Portal Login">
            <Field label="Admin Name" required><Input required placeholder="Company admin name" value={form.adminName} onChange={(event) => setForm({ ...form, adminName: event.target.value })} /></Field>
            <Field label="Login Email" required><Input required type="email" placeholder="admin@company.com" value={form.adminEmail} onChange={(event) => setForm({ ...form, adminEmail: event.target.value })} /></Field>
            <Field label="Password" required><PasswordInput required value={form.adminPassword} onChange={(event) => setForm({ ...form, adminPassword: event.target.value })} /></Field>
            <div className="flex items-end">
              <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary" onClick={() => setForm({ ...form, adminPassword: generateStrongPassword() })}>
                <Wand2 size={15} />Auto Generate
              </button>
            </div>
          </FormSection>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button type="button" className="h-10 min-w-[108px] rounded-md border border-[#e52529] bg-white px-8 text-sm font-semibold text-[#e52529] transition hover:bg-red-50" onClick={() => setForm(emptyForm)}>
              Reset
            </button>
            <button type="submit" className="h-10 min-w-[126px] rounded-md bg-[#28a99a] px-8 text-sm font-semibold text-white transition hover:bg-[#218f83] disabled:cursor-not-allowed disabled:opacity-60" disabled={mutation.isLoading}>
              Onboard
            </button>
          </div>
        </form>
      )}
      {isViewPage && <DataTable columns={columns} rows={query.data || []} empty="No companies found" />}
      {editCompany && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-3">
          <Card className="flex max-h-[calc(100vh-24px)] w-full max-w-5xl flex-col overflow-hidden bg-white">
            <div className="mb-3 flex items-center justify-between">
              <div className="px-4 pt-4">
                <h2 className="text-base font-bold text-slate-950">Update Company Details</h2>
                <p className="text-xs text-slate-500">{editCompany.name}</p>
              </div>
              <button type="button" className="mr-4 mt-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close edit company" onClick={() => setEditCompany(null)}><X size={16} /></button>
            </div>
            <div className="border-b border-slate-200 px-4 pb-3">
              <div className="flex gap-2 overflow-x-auto">
                {editTabs.map((tab, index) => (
                  <button
                    key={tab}
                    type="button"
                    className={`h-9 shrink-0 rounded-md px-4 text-xs font-bold transition ${editStep === index ? 'bg-[#28a99a] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    onClick={() => setEditStep(index)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); updateMutation.mutate(editCompany); }}>
              <div className="min-h-[292px] overflow-hidden p-4">
                {editStep === 0 && (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Field label="Brand / Display Name" required><Input required value={editCompany.name || ''} onChange={(event) => setEditCompany({ ...editCompany, name: event.target.value })} /></Field>
                    <Field label="Legal Name"><Input value={editCompany.legalName || ''} onChange={(event) => setEditCompany({ ...editCompany, legalName: event.target.value })} /></Field>
                    <Field label="Industry"><Input value={editCompany.industry || ''} onChange={(event) => setEditCompany({ ...editCompany, industry: event.target.value })} /></Field>
                    <Field label="Company Type"><Select value={editCompany.companyType || ''} onChange={(event) => setEditCompany({ ...editCompany, companyType: event.target.value })}>
                      <option value="">Select type</option>
                      <option value="Private Limited">Private Limited</option>
                      <option value="LLP">LLP</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Proprietorship">Proprietorship</option>
                      <option value="Public Limited">Public Limited</option>
                    </Select></Field>
                    <Field label="Established Date"><Input type="date" value={editCompany.establishedDate || ''} onChange={(event) => setEditCompany({ ...editCompany, establishedDate: event.target.value })} /></Field>
                    <Field label="Employee Strength"><Input value={editCompany.employeeStrength || ''} onChange={(event) => setEditCompany({ ...editCompany, employeeStrength: event.target.value })} /></Field>
                    <Field label="Status" required><Select value={editCompany.status || 'ACTIVE'} onChange={(event) => setEditCompany({ ...editCompany, status: event.target.value })}>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </Select></Field>
                  </div>
                )}
                {editStep === 1 && (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Field label="Registration / CIN"><Input value={editCompany.registrationNumber || ''} onChange={(event) => setEditCompany({ ...editCompany, registrationNumber: event.target.value })} /></Field>
                    <Field label="GST Number"><Input value={editCompany.gstNumber || ''} onChange={(event) => setEditCompany({ ...editCompany, gstNumber: event.target.value })} /></Field>
                    <Field label="PAN Number"><Input value={editCompany.panNumber || ''} onChange={(event) => setEditCompany({ ...editCompany, panNumber: event.target.value })} /></Field>
                    <Field label="Company Email"><Input type="email" value={editCompany.email || ''} onChange={(event) => setEditCompany({ ...editCompany, email: event.target.value })} /></Field>
                    <Field label="Company Phone"><Input value={editCompany.phone || ''} onChange={(event) => setEditCompany({ ...editCompany, phone: event.target.value })} /></Field>
                    <Field label="Website"><Input value={editCompany.website || ''} onChange={(event) => setEditCompany({ ...editCompany, website: event.target.value })} /></Field>
                  </div>
                )}
                {editStep === 2 && (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Field label="Address Line 1"><Textarea value={editCompany.addressLine1 || ''} onChange={(event) => setEditCompany({ ...editCompany, addressLine1: event.target.value })} /></Field>
                    <Field label="Address Line 2"><Textarea value={editCompany.addressLine2 || ''} onChange={(event) => setEditCompany({ ...editCompany, addressLine2: event.target.value })} /></Field>
                    <Field label="City"><Input value={editCompany.city || ''} onChange={(event) => setEditCompany({ ...editCompany, city: event.target.value })} /></Field>
                    <Field label="State"><Input value={editCompany.state || ''} onChange={(event) => setEditCompany({ ...editCompany, state: event.target.value })} /></Field>
                    <Field label="Country"><Input value={editCompany.country || ''} onChange={(event) => setEditCompany({ ...editCompany, country: event.target.value })} /></Field>
                    <Field label="Pincode"><Input value={editCompany.pincode || ''} onChange={(event) => setEditCompany({ ...editCompany, pincode: event.target.value })} /></Field>
                  </div>
                )}
                {editStep === 3 && (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Field label="Contact Name"><Input value={editCompany.contactPersonName || ''} onChange={(event) => setEditCompany({ ...editCompany, contactPersonName: event.target.value })} /></Field>
                    <Field label="Contact Email"><Input type="email" value={editCompany.contactPersonEmail || ''} onChange={(event) => setEditCompany({ ...editCompany, contactPersonEmail: event.target.value })} /></Field>
                    <Field label="Contact Phone"><Input value={editCompany.contactPersonPhone || ''} onChange={(event) => setEditCompany({ ...editCompany, contactPersonPhone: event.target.value })} /></Field>
                  </div>
                )}
                {editStep === 4 && (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Field label="Admin Name" required><Input required value={editCompany.adminName || ''} onChange={(event) => setEditCompany({ ...editCompany, adminName: event.target.value })} /></Field>
                    <Field label="Login Email" required><Input required type="email" value={editCompany.adminEmail || ''} onChange={(event) => setEditCompany({ ...editCompany, adminEmail: event.target.value })} /></Field>
                    <Field label="Portal Password" required><PasswordInput required value={editCompany.adminPassword || ''} onChange={(event) => setEditCompany({ ...editCompany, adminPassword: event.target.value })} /></Field>
                    <div className="flex items-end gap-2">
                      <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-primary hover:text-primary" onClick={() => setEditCompany({ ...editCompany, adminPassword: generateStrongPassword() })}>
                        <Wand2 size={14} />Generate
                      </button>
                      <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 text-xs font-semibold text-orange-700 transition hover:bg-orange-100" onClick={() => setEditCompany({ ...editCompany, adminPassword: generateStrongPassword() })}>
                        <KeyRound size={14} />Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                <button type="button" className="h-9 min-w-[96px] rounded-md border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={() => setEditCompany(null)}>Cancel</button>
                <div className="flex gap-3">
                  <button type="button" className="h-9 min-w-[88px] rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={editStep === 0} onClick={() => setEditStep((current) => Math.max(0, current - 1))}>Back</button>
                  {editStep < editTabs.length - 1 ? (
                    <button type="button" className="h-9 min-w-[88px] rounded-md bg-[#28a99a] px-5 text-sm font-semibold text-white hover:bg-[#218f83]" onClick={() => setEditStep((current) => Math.min(editTabs.length - 1, current + 1))}>Next</button>
                  ) : (
                    <button type="submit" className="h-9 min-w-[118px] rounded-md bg-[#28a99a] px-6 text-sm font-semibold text-white hover:bg-[#218f83] disabled:cursor-not-allowed disabled:opacity-60" disabled={updateMutation.isLoading}>Update</button>
                  )}
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
