import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';
import { Button, CompactTable, Field, FormSection, Input, PageHeader } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';
import { api } from '../services/api.js';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatClock(value) {
  if (!value) return '-';
  const [hours, minutes] = value.split(':').map(Number);
  const displayHours = hours % 12 || 12;
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${String(displayHours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} ${period}`;
}

export default function Events() {
  const client = useQueryClient();
  const query = useApiQuery(['events', 'all'], '/events?all=true');
  const [form, setForm] = useState({ title: '', eventDate: '', startTime: '', endTime: '', lead: '', expiryDate: '' });

  const createEvent = useMutation((payload) => api.post('/events', { ...payload, expiryDate: payload.expiryDate || null }), {
    onSuccess: () => {
      toast.success('Event saved');
      setForm({ title: '', eventDate: '', startTime: '', endTime: '', lead: '', expiryDate: '' });
      client.invalidateQueries('events');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to save event')
  });

  const deleteEvent = useMutation((id) => api.delete(`/events/${id}`), {
    onSuccess: () => {
      toast.success('Event deleted');
      client.invalidateQueries('events');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete event')
  });

  const columns = [
    { key: 'title', label: 'Event', render: (row) => <span className="font-bold text-slate-950">{row.title}</span> },
    { key: 'eventDate', label: 'Date', render: (row) => formatDate(row.eventDate) },
    { key: 'time', label: 'Time', render: (row) => `${formatClock(row.startTime)} - ${formatClock(row.endTime)}` },
    { key: 'lead', label: 'Lead', render: (row) => row.lead || '-' },
    { key: 'expiryDate', label: 'Expiry', render: (row) => row.expiryDate ? formatDate(row.expiryDate) : 'No expiry' },
    { key: 'actions', label: 'Action', render: (row) => <button className="text-red-600 transition hover:text-red-700" type="button" onClick={() => deleteEvent.mutate(row.id)} aria-label="Delete event"><Trash2 size={16} /></button> }
  ];

  return (
    <>
      <PageHeader title="Events" subtitle="Create upcoming events. Optional expiry hides events from employees after that date." />
      <form onSubmit={(event) => { event.preventDefault(); createEvent.mutate(form); }}>
        <FormSection title="Add Event" actions={<Button disabled={createEvent.isLoading}><Plus size={16} />Save Event</Button>}>
          <Field label="Title" required><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Enter event title" required /></Field>
          <Field label="Event Date" required><Input type="date" value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} required /></Field>
          <Field label="Start Time" required><Input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} required /></Field>
          <Field label="End Time" required><Input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} required /></Field>
          <Field label="Lead Optional"><Input value={form.lead} onChange={(event) => setForm({ ...form, lead: event.target.value })} placeholder="Enter lead name" /></Field>
          <Field label="Expiry Date Optional"><Input type="date" value={form.expiryDate} onChange={(event) => setForm({ ...form, expiryDate: event.target.value })} /></Field>
        </FormSection>
      </form>
      <CompactTable columns={columns} rows={query.data || []} empty={query.isLoading ? 'Loading events...' : 'No events found'} minWidth="820px" />
    </>
  );
}
