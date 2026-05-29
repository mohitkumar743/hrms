import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { Button, Field, FormSection, Input, LoadingState, PageHeader, Select } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';
import { api } from '../services/api.js';

export default function Settings() {
  const query = useApiQuery('settings', '/settings');
  const client = useQueryClient();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const mutation = useMutation(() => api.put('/settings', {
    ...form,
    gracePeriodMinutes: Number(form.gracePeriodMinutes),
    lateFineAmount: Number(form.lateFineAmount),
    lateCountThreshold: Number(form.lateCountThreshold)
  }), {
    onSuccess: () => {
      toast.success('Settings saved');
      client.invalidateQueries('settings');
    }
  });

  if (query.isLoading || !form) return <LoadingState />;

  return (
    <>
      <PageHeader title="Settings" subtitle="Company profile, office timings, attendance rules, and late fines" />
      <form onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
        <FormSection title="Company Info">
          <Field label="Company Name" required><Input value={form.companyProfile?.name || ''} onChange={(event) => setForm({ ...form, companyProfile: { ...form.companyProfile, name: event.target.value } })} /></Field>
          <Field label="Timezone" required><Input value={form.companyProfile?.timezone || ''} onChange={(event) => setForm({ ...form, companyProfile: { ...form.companyProfile, timezone: event.target.value } })} /></Field>
        </FormSection>
        <FormSection title="Attendance Rules" actions={<Button disabled={mutation.isLoading}><Save size={16} />Save Settings</Button>}>
          <Field label="Office Start" required><Input type="time" value={form.officeStartTime} onChange={(event) => setForm({ ...form, officeStartTime: event.target.value })} /></Field>
          <Field label="Office End" required><Input type="time" value={form.officeEndTime} onChange={(event) => setForm({ ...form, officeEndTime: event.target.value })} /></Field>
          <Field label="Grace Period" required><Input type="number" value={form.gracePeriodMinutes} onChange={(event) => setForm({ ...form, gracePeriodMinutes: event.target.value })} /></Field>
          <Field label="Late Fine"><Select value={String(form.lateFineEnabled)} onChange={(event) => setForm({ ...form, lateFineEnabled: event.target.value === 'true' })}><option value="true">Enabled</option><option value="false">Disabled</option></Select></Field>
          <Field label="Late Fine Amount"><Input type="number" value={form.lateFineAmount} onChange={(event) => setForm({ ...form, lateFineAmount: event.target.value })} /></Field>
          <Field label="Late Count Threshold"><Input type="number" value={form.lateCountThreshold} onChange={(event) => setForm({ ...form, lateCountThreshold: event.target.value })} /></Field>
        </FormSection>
      </form>
    </>
  );
}
