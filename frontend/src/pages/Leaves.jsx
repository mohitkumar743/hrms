import { Check, ClipboardList, Send, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api.js';
import { useAuthStore } from '../store/authStore.js';
import { Button, Card, CompactTable, Field, Input, LoadingState, PageHeader, Select, StatCard, Textarea } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';

const emptyForm = {
  leaveType: 'Casual Leave',
  dayType: 'FULL_DAY',
  startDate: '',
  endDate: '',
  reason: ''
};

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${formatDate(value)} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: 'bg-orange-100 text-orange-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-600'
  };
  return <span className={`inline-flex min-w-[86px] justify-center rounded px-3 py-1.5 text-xs font-bold ${styles[status] || 'bg-slate-100 text-slate-600'}`}>{status || '-'}</span>;
}

function LeaveForm({ form, setForm, mutation, user }) {
  return (
    <Card className="mb-4 bg-white p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.startDate || !form.endDate) {
            toast.error('Please select leave dates');
            return;
          }
          if (form.endDate < form.startDate) {
            toast.error('End date cannot be before start date');
            return;
          }
          mutation.mutate({ ...form, employeeId: user?.employeeId });
        }}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Leave Type" required>
            <Select value={form.leaveType} onChange={(event) => setForm({ ...form, leaveType: event.target.value })}>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </Select>
          </Field>
          <Field label="Day Type" required>
            <Select value={form.dayType} onChange={(event) => setForm({ ...form, dayType: event.target.value })}>
              <option value="FULL_DAY">Full Day</option>
              <option value="HALF_DAY">Half Day</option>
            </Select>
          </Field>
          <Field label="From" required>
            <Input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value, endDate: form.endDate || event.target.value })} />
          </Field>
          <Field label="To" required>
            <Input type="date" value={form.endDate} min={form.startDate || undefined} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
          </Field>
          <div className="md:col-span-2 xl:col-span-4">
            <Field label="Reason" required>
              <Textarea value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Enter leave reason" />
            </Field>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setForm(emptyForm)}>Reset</Button>
          <Button type="submit" disabled={mutation.isLoading || !user?.employeeId}><Send size={16} />Apply Leave</Button>
        </div>
      </form>
    </Card>
  );
}

export default function Leaves() {
  const user = useAuthStore((state) => state.user);
  const isEmployee = user?.role === 'EMPLOYEE';
  const query = useApiQuery(['leaves', user?.role, user?.employeeId], '/leave');
  const client = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [decision, setDecision] = useState(null);
  const [decisionRemark, setDecisionRemark] = useState('');

  const applyMutation = useMutation((payload) => api.post('/leave', payload), {
    onSuccess: () => {
      toast.success('Leave request submitted');
      setForm(emptyForm);
      client.invalidateQueries('leaves');
      client.invalidateQueries('header-leaves');
      client.invalidateQueries('reports');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to apply leave')
  });

  const decide = useMutation(({ id, status, remark }) => api.patch(`/leave/${id}/decision`, { status, remark }), {
    onSuccess: () => {
      toast.success('Leave updated');
      setDecision(null);
      setDecisionRemark('');
      client.invalidateQueries('leaves');
      client.invalidateQueries('header-leaves');
      client.invalidateQueries('reports');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update leave')
  });

  const leaves = query.data || [];
  const pendingCount = leaves.filter((leave) => leave.status === 'PENDING').length;
  const approvedCount = leaves.filter((leave) => leave.status === 'APPROVED').length;
  const rejectedCount = leaves.filter((leave) => leave.status === 'REJECTED').length;

  const filteredLeaves = useMemo(() => leaves.filter((leave) => {
    const matchesStatus = statusFilter === 'ALL' || leave.status === statusFilter;
    const text = `${leave.employeeName || ''} ${leave.employeeCode || ''} ${leave.leaveType} ${leave.dayType} ${leave.reason} ${leave.remark || ''} ${leave.status}`.toLowerCase();
    return matchesStatus && text.includes(search.toLowerCase());
  }), [leaves, search, statusFilter]);

  const columns = [
    { key: 'index', label: 'S.No', render: (_leave, index) => String(index + 1).padStart(2, '0') },
    ...(!isEmployee ? [{ key: 'employee', label: 'Employee', render: (leave) => (
      <div>
        <p className="font-bold text-slate-950">{leave.employeeName || '-'}</p>
        {leave.employeeCode && <p className="mt-1 text-xs font-semibold text-[#28a99a]">{leave.employeeCode}</p>}
      </div>
    ) }] : []),
    { key: 'createdAt', label: 'Applied On', render: (leave) => formatDateTime(leave.createdAt) },
    { key: 'leaveType', label: 'Type' },
    { key: 'dayType', label: 'Day', render: (leave) => leave.dayType === 'HALF_DAY' ? 'Half Day' : 'Full Day' },
    { key: 'startDate', label: 'From', render: (leave) => formatDate(leave.startDate) },
    { key: 'endDate', label: 'To', render: (leave) => formatDate(leave.endDate) },
    { key: 'reason', label: 'Reason', className: 'max-w-[260px]', render: (leave) => <p className="line-clamp-2">{leave.reason}</p> },
    { key: 'status', label: 'Status', render: (leave) => <StatusBadge status={leave.status} /> },
    { key: 'remark', label: 'Admin Remark', className: 'max-w-[240px]', render: (leave) => leave.remark ? <p className="line-clamp-2">{leave.remark}</p> : '-' },
    ...(!isEmployee ? [{
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-center',
      className: 'text-center',
      render: (leave) => leave.status === 'PENDING' ? (
        <div className="flex justify-center gap-2">
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-green-50 text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={decide.isLoading} onClick={() => { setDecision({ leave, status: 'APPROVED' }); setDecisionRemark(''); }} aria-label="Approve leave">
            <Check size={16} strokeWidth={2.8} />
          </button>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={decide.isLoading} onClick={() => { setDecision({ leave, status: 'REJECTED' }); setDecisionRemark(''); }} aria-label="Reject leave">
            <X size={16} strokeWidth={2.8} />
          </button>
        </div>
      ) : '-'
    }] : [])
  ];

  if (query.isLoading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title={isEmployee ? 'My Leaves' : 'Leave Requests'}
        subtitle={isEmployee ? 'Apply for leave and track request status' : 'Approve pending requests and review company leave history'}
      />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <StatCard icon={ClipboardList} label="Pending" value={pendingCount} helper="Awaiting decision" tone="orange" />
        <StatCard icon={Check} label="Approved" value={approvedCount} helper="Accepted requests" tone="green" />
        <StatCard icon={X} label="Rejected" value={rejectedCount} helper="Declined requests" tone="purple" />
      </div>

      {isEmployee && <LeaveForm form={form} setForm={setForm} mutation={applyMutation} user={user} />}

      <CompactTable
        columns={columns}
        rows={filteredLeaves}
        empty={isEmployee ? 'No leave history found' : 'No leave requests found'}
        minWidth={isEmployee ? '820px' : '1050px'}
        searchValue={search}
        onSearchChange={setSearch}
        filters={(
          <Select className="h-7 w-full max-w-[128px] text-xs" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </Select>
        )}
      />

      {decision && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-3">
          <Card className="w-full max-w-md bg-white p-4">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-950">{decision.status === 'APPROVED' ? 'Approve Leave' : 'Reject Leave'}</h2>
              <p className="mt-1 text-xs text-slate-500">{decision.leave.employeeName || 'Employee'} - {decision.leave.startDate} to {decision.leave.endDate}</p>
            </div>
            <Field label={decision.status === 'APPROVED' ? 'Approval Remark' : 'Reject Remark'} required>
              <Textarea value={decisionRemark} onChange={(event) => setDecisionRemark(event.target.value)} placeholder="Enter remark for employee" autoFocus />
            </Field>
            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setDecision(null); setDecisionRemark(''); }}>Cancel</Button>
              <Button
                type="button"
                disabled={decide.isLoading}
                onClick={() => {
                  if (!decisionRemark.trim()) {
                    toast.error('Please enter remark');
                    return;
                  }
                  decide.mutate({ id: decision.leave.id, status: decision.status, remark: decisionRemark.trim() });
                }}
              >
                {decision.status === 'APPROVED' ? <Check size={16} /> : <X size={16} />}
                {decision.status === 'APPROVED' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
