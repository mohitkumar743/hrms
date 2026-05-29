import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';
import { Button, CompactTable, Field, FormSection, Input, PageHeader, Textarea } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';
import { api } from '../services/api.js';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Notices() {
  const client = useQueryClient();
  const query = useApiQuery(['notices', 'all'], '/notices?all=true');
  const [form, setForm] = useState({ title: '', message: '', expiryDate: '' });

  const createNotice = useMutation((payload) => api.post('/notices', { ...payload, expiryDate: payload.expiryDate || null }), {
    onSuccess: () => {
      toast.success('Notice saved');
      setForm({ title: '', message: '', expiryDate: '' });
      client.invalidateQueries('notices');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to save notice')
  });

  const deleteNotice = useMutation((id) => api.delete(`/notices/${id}`), {
    onSuccess: () => {
      toast.success('Notice deleted');
      client.invalidateQueries('notices');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete notice')
  });

  const columns = [
    { key: 'title', label: 'Title', render: (row) => <span className="font-bold text-slate-950">{row.title}</span> },
    { key: 'message', label: 'Message', render: (row) => <span className="line-clamp-2 text-xs">{row.message}</span> },
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'expiryDate', label: 'Expiry', render: (row) => row.expiryDate ? formatDate(row.expiryDate) : 'No expiry' },
    { key: 'actions', label: 'Action', render: (row) => <button className="text-red-600 transition hover:text-red-700" type="button" onClick={() => deleteNotice.mutate(row.id)} aria-label="Delete notice"><Trash2 size={16} /></button> }
  ];

  return (
    <>
      <PageHeader title="Notice Board" subtitle="Create notices for employees. Optional expiry hides notices after that date." />
      <form onSubmit={(event) => { event.preventDefault(); createNotice.mutate(form); }}>
        <FormSection title="Add Notice" actions={<Button disabled={createNotice.isLoading}><Plus size={16} />Save Notice</Button>}>
          <Field label="Title" required><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Enter notice title" required /></Field>
          <Field label="Expiry Date Optional"><Input type="date" value={form.expiryDate} onChange={(event) => setForm({ ...form, expiryDate: event.target.value })} /></Field>
          <div className="xl:col-span-2"><Field label="Message" required><Textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Enter notice message" required /></Field></div>
        </FormSection>
      </form>
      <CompactTable columns={columns} rows={query.data || []} empty={query.isLoading ? 'Loading notices...' : 'No notices found'} minWidth="760px" />
    </>
  );
}
