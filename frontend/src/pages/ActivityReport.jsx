import { useMemo, useState } from 'react';
import { Activity, Clock3, UserRound } from 'lucide-react';
import { Card, CompactTable, Input, LoadingState, PageHeader, Select, StatCard } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';

function formatDateTime(row) {
  const value = row.createdAt ? new Date(row.createdAt) : new Date(`${row.date}T${row.time || '00:00:00'}`);
  return value.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function actionClass(action) {
  if (action === 'DELETE') return 'bg-red-100 text-red-700';
  return 'bg-orange-100 text-orange-700';
}

function deletedSummary(record = {}) {
  return record.fullName || record.title || record.employeeName || record.email || record.employeeCode || record.id || '-';
}

export default function ActivityReport() {
  const query = useApiQuery('activity-report', '/activity');
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState('ALL');
  const [date, setDate] = useState('');
  const rows = query.data || [];
  const users = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => map.set(row.userId, row.userName || row.userEmail || row.userId));
    return [...map.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);
  const filteredRows = rows.filter((row) => {
    const text = `${row.userName} ${row.userEmail} ${row.role} ${row.action} ${row.resource} ${row.description}`.toLowerCase();
    return text.includes(search.toLowerCase())
      && (userId === 'ALL' || row.userId === userId)
      && (!date || row.date === date);
  });
  const columns = [
    { key: 'index', label: 'S.No', render: (_row, index) => String(index + 1).padStart(2, '0') },
    { key: 'createdAt', label: 'Date & Time', render: (row) => formatDateTime(row), className: 'font-semibold text-slate-700' },
    { key: 'userName', label: 'User', render: (row) => (
      <div>
        <p className="font-bold text-slate-950">{row.userName}</p>
        <p className="text-[11px] font-medium text-slate-500">{row.userEmail || row.role}</p>
      </div>
    ) },
    { key: 'role', label: 'Role' },
    { key: 'action', label: 'Action', render: (row) => (
      <span className={`inline-flex min-w-[78px] justify-center rounded px-2.5 py-1 text-[11px] font-bold ${actionClass(row.action)}`}>
        {row.action}
      </span>
    ) },
    { key: 'description', label: 'Activity', className: 'font-semibold text-slate-700' },
    { key: 'resource', label: 'Module', render: (row) => row.resource || '-' },
    { key: 'deletedRecord', label: 'Deleted Record', render: (row) => {
      const record = row.metadata?.deletedRecord || {};
      return (
        <details className="max-w-[280px]">
          <summary className="cursor-pointer truncate text-xs font-bold text-[#e52529]">{deletedSummary(record)}</summary>
          <pre className="mt-2 max-h-44 overflow-auto rounded bg-slate-950 p-2 text-[11px] leading-4 text-white">{JSON.stringify(record, null, 2)}</pre>
        </details>
      );
    } }
  ];

  if (query.isLoading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Activity Report" subtitle="Company-wise delete audit with date, time, user, and deleted record details." />
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <StatCard icon={Activity} label="Delete Logs" value={rows.length} tone="teal" />
        <StatCard icon={UserRound} label="Users Who Deleted" value={users.length} tone="blue" />
        <StatCard icon={Clock3} label="Today Deletes" value={rows.filter((row) => row.date === new Date().toISOString().slice(0, 10)).length} tone="green" />
      </div>
      <Card className="mb-4 bg-white p-3">
        <div className="grid gap-3 md:grid-cols-3">
          <Select value={userId} onChange={(event) => setUserId(event.target.value)}>
            <option value="ALL">All Users</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
          </Select>
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <button type="button" className="h-9 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-[#28a99a] hover:text-[#28a99a]" onClick={() => { setUserId('ALL'); setDate(''); setSearch(''); }}>Clear Filters</button>
        </div>
      </Card>
      <CompactTable
        columns={columns}
        rows={filteredRows}
        empty="No activity logs found"
        minWidth="1180px"
        searchValue={search}
        onSearchChange={setSearch}
      />
    </>
  );
}
