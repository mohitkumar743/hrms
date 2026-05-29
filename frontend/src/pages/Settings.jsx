import { Building2, Clock3, IndianRupee, RotateCcw, Save, ShieldCheck, TimerReset } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { Button, Card, Field, Input, LoadingState, PageHeader, Select } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';
import { api } from '../services/api.js';
import { cn } from '../lib/utils.js';

const defaultSettings = {
  officeStartTime: '09:30',
  officeEndTime: '18:30',
  gracePeriodMinutes: 10,
  lateFineEnabled: true,
  lateFineAmount: 100,
  lateCountThreshold: 3,
  companyProfile: { name: 'Acme HR', timezone: 'Asia/Kolkata' }
};

const timezones = ['Asia/Kolkata', 'UTC', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York'];

function minutesFromTime(value) {
  if (!value) return 0;
  const [hours, minutes] = value.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function formatDuration(start, end) {
  const startMinutes = minutesFromTime(start);
  let endMinutes = minutesFromTime(end);
  if (endMinutes <= startMinutes) endMinutes += 1440;
  const total = endMinutes - startMinutes;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours}h${minutes ? ` ${minutes}m` : ''}`;
}

function SettingCard({ icon: Icon, label, value, helper, tone = 'teal' }) {
  const tones = {
    teal: 'bg-teal-50 text-[#0f766e]',
    blue: 'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-700',
    green: 'bg-emerald-50 text-emerald-700'
  };

  return (
    <Card className="bg-white p-4">
      <div className="flex items-start gap-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-md', tones[tone])}>
          <Icon size={19} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
          <p className="mt-2 truncate text-lg font-extrabold text-slate-950">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{helper}</p>
        </div>
      </div>
    </Card>
  );
}

function SectionShell({ title, subtitle, icon: Icon, children }) {
  return (
    <Card className="overflow-hidden bg-white">
      <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2">{children}</div>
    </Card>
  );
}

export default function Settings() {
  const query = useApiQuery('settings', '/settings');
  const client = useQueryClient();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const summary = useMemo(() => {
    if (!form) return null;
    return {
      workday: formatDuration(form.officeStartTime, form.officeEndTime),
      grace: `${form.gracePeriodMinutes || 0} min`,
      fine: form.lateFineEnabled ? `Rs ${Number(form.lateFineAmount || 0)}` : 'Disabled',
      threshold: `${form.lateCountThreshold || 0} late marks`
    };
  }, [form]);

  const mutation = useMutation(() => api.put('/settings', {
    ...form,
    gracePeriodMinutes: Number(form.gracePeriodMinutes || 0),
    lateFineAmount: Number(form.lateFineAmount || 0),
    lateCountThreshold: Number(form.lateCountThreshold || 0)
  }), {
    onSuccess: () => {
      toast.success('Settings saved');
      client.invalidateQueries('settings');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to save settings')
  });

  if (query.isLoading || !form || !summary) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Company profile, attendance schedule, grace period, and late fine policy."
        actions={(
          <>
            <Button type="button" variant="outline" onClick={() => setForm(query.data || defaultSettings)}>
              <RotateCcw size={16} />Reset
            </Button>
            <Button type="submit" form="settings-form" disabled={mutation.isLoading}>
              <Save size={16} />Save Settings
            </Button>
          </>
        )}
      />

      <form id="settings-form" className="space-y-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SettingCard icon={Clock3} label="Workday" value={summary.workday} helper={`${form.officeStartTime} to ${form.officeEndTime}`} tone="teal" />
          <SettingCard icon={TimerReset} label="Grace Period" value={summary.grace} helper="Allowed after office start" tone="blue" />
          <SettingCard icon={IndianRupee} label="Late Fine" value={summary.fine} helper={`After ${summary.threshold}`} tone="orange" />
          <SettingCard icon={ShieldCheck} label="Policy Status" value={form.lateFineEnabled ? 'Active' : 'Fine Off'} helper={form.companyProfile?.timezone || 'Timezone not set'} tone="green" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <SectionShell title="Company Profile" subtitle="This information is used across attendance, payroll, and employee-facing screens." icon={Building2}>
              <Field label="Company Name" required>
                <Input value={form.companyProfile?.name || ''} onChange={(event) => setForm({ ...form, companyProfile: { ...form.companyProfile, name: event.target.value } })} />
              </Field>
              <Field label="Timezone" required>
                <Select value={form.companyProfile?.timezone || 'Asia/Kolkata'} onChange={(event) => setForm({ ...form, companyProfile: { ...form.companyProfile, timezone: event.target.value } })}>
                  {timezones.map((timezone) => <option key={timezone} value={timezone}>{timezone}</option>)}
                </Select>
              </Field>
            </SectionShell>

            <SectionShell title="Attendance Schedule" subtitle="Define default office timing used for QR attendance, self punch, late marks, and payroll calculations." icon={Clock3}>
              <Field label="Office Start" required>
                <Input type="time" value={form.officeStartTime || ''} onChange={(event) => setForm({ ...form, officeStartTime: event.target.value })} />
              </Field>
              <Field label="Office End" required>
                <Input type="time" value={form.officeEndTime || ''} onChange={(event) => setForm({ ...form, officeEndTime: event.target.value })} />
              </Field>
              <Field label="Grace Period Minutes" required>
                <Input type="number" min="0" value={form.gracePeriodMinutes} onChange={(event) => setForm({ ...form, gracePeriodMinutes: event.target.value })} />
              </Field>
              <Field label="Late Count Threshold" required>
                <Input type="number" min="0" value={form.lateCountThreshold} onChange={(event) => setForm({ ...form, lateCountThreshold: event.target.value })} />
              </Field>
            </SectionShell>

            <SectionShell title="Late Fine Policy" subtitle="Control whether repeated late attendance applies a deduction during payroll generation." icon={IndianRupee}>
              <Field label="Late Fine Status">
                <Select value={String(form.lateFineEnabled)} onChange={(event) => setForm({ ...form, lateFineEnabled: event.target.value === 'true' })}>
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </Select>
              </Field>
              <Field label="Late Fine Amount">
                <Input type="number" min="0" disabled={!form.lateFineEnabled} value={form.lateFineAmount} onChange={(event) => setForm({ ...form, lateFineAmount: event.target.value })} />
              </Field>
            </SectionShell>
          </div>

          <Card className="h-fit overflow-hidden bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-extrabold text-slate-950">Policy Preview</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">Current rule summary before saving.</p>
            </div>
            <div className="space-y-3 p-5">
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase text-slate-400">Shift Window</p>
                <p className="mt-2 text-sm font-extrabold text-slate-950">{form.officeStartTime} - {form.officeEndTime}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase text-slate-400">Late Mark Starts</p>
                <p className="mt-2 text-sm font-extrabold text-slate-950">{form.gracePeriodMinutes || 0} minutes after office start</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase text-slate-400">Fine Rule</p>
                <p className="mt-2 text-sm font-extrabold text-slate-950">
                  {form.lateFineEnabled ? `Rs ${Number(form.lateFineAmount || 0)} after ${form.lateCountThreshold || 0} late marks` : 'Late fine disabled'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </>
  );
}
