import { Clock, MoreVertical, Pencil, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';
import { Card, CompactTable, Input, LoadingState, PageHeader, Select } from '../components/ui.jsx';
import { api } from '../services/api.js';
import { useApiQuery } from '../hooks/useApiQuery.js';
import { useAuthStore } from '../store/authStore.js';

function formatTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  const rawHours = date.getHours();
  const displayHours = rawHours % 12 || 12;
  const hours = String(displayHours).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = rawHours >= 12 ? 'PM' : 'AM';
  return `${hours} : ${minutes} ${period}`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatMinutes(value) {
  const totalMinutes = Number(value || 0);
  if (!totalMinutes) return '0 min';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours ? `${hours} hr ` : ''}${minutes ? `${minutes} min` : ''}`.trim();
}

function formatDuration(start, end) {
  if (!start || !end) return '-';
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const totalMinutes = Math.max(0, Math.floor((endTime - startTime) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function punchOutStatus(row) {
  if (row.checkOutTime) return formatTime(row.checkOutTime);
  if (row.checkInTime) return <span className="font-bold text-[#e52529]">Missed Punch Out</span>;
  return '-';
}

export default function Attendance() {
  const user = useAuthStore((state) => state.user);
  const query = useApiQuery('attendance', '/attendance');
  const employees = useApiQuery('attendance-employees', '/employees', { enabled: user?.role !== 'EMPLOYEE' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [manualRecord, setManualRecord] = useState(null);
  const [manualTime, setManualTime] = useState('');
  const [regularizeRecord, setRegularizeRecord] = useState(null);
  const [regularizeForm, setRegularizeForm] = useState({ checkInTime: '', checkOutTime: '' });
  const [actionMenu, setActionMenu] = useState(null);
  const client = useQueryClient();
  const employeeMap = useMemo(() => new Map((employees.data || []).map((employee) => [employee.id, employee])), [employees.data]);
  const manualCheckout = useMutation(({ id, checkOutTime }) => api.patch(`/attendance/${id}/manual-checkout`, { checkOutTime }), {
    onSuccess: () => {
      toast.success('Punch out time updated');
      setManualRecord(null);
      setManualTime('');
      client.invalidateQueries('attendance');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update punch out time')
  });
  const regularizeAttendance = useMutation(({ id, payload }) => api.patch(`/attendance/${id}/regularize`, payload), {
    onSuccess: () => {
      toast.success('Attendance time regularized');
      setRegularizeRecord(null);
      setRegularizeForm({ checkInTime: '', checkOutTime: '' });
      client.invalidateQueries('attendance');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to regularize attendance')
  });
  const deleteAttendance = useMutation((id) => api.delete(`/attendance/${id}`), {
    onSuccess: () => {
      toast.success('Attendance record deleted');
      setActionMenu(null);
      client.invalidateQueries('attendance');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete attendance record')
  });
  const rows = (query.data || []).map((row) => ({
    ...row,
    employeeName: employeeMap.get(row.employeeId)?.fullName || row.employeeName || (user?.role === 'EMPLOYEE' ? user?.name : row.employeeId)
  }));
  const filteredRows = rows.filter((row) => {
    const text = `${row.employeeName} ${row.date} ${row.status} ${row.attendanceMethod}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const attendanceColumns = [
    { key: 'index', label: 'S.No', render: (_row, index) => String(index + 1).padStart(2, '0') },
    { key: 'employeeName', label: 'Employee', className: 'font-bold text-slate-950' },
    { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
    { key: 'checkInTime', label: 'Punch In', render: (row) => formatTime(row.checkInTime) },
    { key: 'checkOutTime', label: 'Punch Out', render: (row) => punchOutStatus(row) },
    { key: 'duration', label: 'Duration', render: (row) => formatDuration(row.checkInTime, row.checkOutTime) },
    { key: 'status', label: 'Status', render: (row) => (
      <span className={`inline-flex min-w-[68px] justify-center rounded px-2.5 py-1 text-[11px] font-bold ${row.status === 'LATE' ? 'bg-orange-100 text-orange-700' : row.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
        {row.status}
      </span>
    ) },
    { key: 'lateMinutes', label: 'Late Min', render: (row) => formatMinutes(row.lateMinutes) },
    { key: 'attendanceMethod', label: 'Method' },
    ...(user?.role !== 'EMPLOYEE' ? [{
      key: 'action',
      label: 'Action',
      headerClassName: 'text-center',
      className: 'text-center',
      render: (row) => (
        <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100" onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setActionMenu(actionMenu?.record.id === row.id ? null : { record: row, top: rect.top, left: rect.left - 164 });
        }}>
          <MoreVertical size={15} />
        </button>
      )
    }] : [])
  ];

  if (query.isLoading || employees.isLoading) return <LoadingState />;

  return (
    <>
      {user?.role === 'EMPLOYEE' && <PageHeader title="Attendance History" subtitle="Your check-in, checkout, late, and attendance status history" />}
      {user?.role !== 'EMPLOYEE' && <PageHeader title="Attendance" subtitle="QR attendance records with check-in, checkout, late, and overtime fields" />}
      <CompactTable
        columns={attendanceColumns}
        rows={filteredRows}
        empty="No attendance records found"
        minWidth="900px"
        searchValue={search}
        onSearchChange={setSearch}
        filters={(
          <Select className="h-7 w-full max-w-[128px] text-xs" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">Filter</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="ABSENT">Absent</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ON_LEAVE">On Leave</option>
          </Select>
        )}
      />
      {actionMenu && (
        <>
          <button className="fixed inset-0 z-40 cursor-default bg-transparent" type="button" aria-label="Close attendance action menu" onClick={() => setActionMenu(null)} />
          <div className="fixed z-50 w-40 overflow-hidden rounded-md border border-slate-200 bg-white py-1 text-left shadow-panel" style={{ top: actionMenu.top, left: Math.max(8, actionMenu.left) }}>
            {!actionMenu.record.checkOutTime && actionMenu.record.checkInTime && (
              <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-[#e52529] hover:bg-red-50" onClick={() => {
                setManualRecord(actionMenu.record);
                setManualTime(new Date(actionMenu.record.checkInTime).toTimeString().slice(0, 5));
                setActionMenu(null);
              }}><Pencil size={14} />Set Punch Out</button>
            )}
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50" onClick={() => {
              setRegularizeRecord(actionMenu.record);
              setRegularizeForm({
                checkInTime: actionMenu.record.checkInTime ? new Date(actionMenu.record.checkInTime).toTimeString().slice(0, 5) : '',
                checkOutTime: actionMenu.record.checkOutTime ? new Date(actionMenu.record.checkOutTime).toTimeString().slice(0, 5) : ''
              });
              setActionMenu(null);
            }}><Clock size={14} />Regularize Time</button>
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-[#e52529] hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={deleteAttendance.isLoading} onClick={() => {
              if (window.confirm(`Delete attendance for ${actionMenu.record.employeeName} on ${formatDate(actionMenu.record.date)}?`)) {
                deleteAttendance.mutate(actionMenu.record.id);
              }
            }}><Trash2 size={14} />Delete Record</button>
          </div>
        </>
      )}
      {manualRecord && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
          <Card className="w-full max-w-md bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-950">Set Punch Out Time</h2>
                <p className="text-xs text-slate-500">{manualRecord.employeeName} | {formatDate(manualRecord.date)}</p>
              </div>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100" onClick={() => setManualRecord(null)} aria-label="Close manual checkout"><X size={16} /></button>
            </div>
            <form onSubmit={(event) => {
              event.preventDefault();
              manualCheckout.mutate({ id: manualRecord.id, checkOutTime: manualTime });
            }}>
              <label className="block text-xs font-bold text-slate-950">
                Punch Out Time
                <Input className="mt-2" type="time" value={manualTime} onChange={(event) => setManualTime(event.target.value)} />
              </label>
              <p className="mt-3 rounded-md bg-slate-50 p-3 text-xs font-semibold text-slate-500">Only time can be changed. Date remains fixed as {formatDate(manualRecord.date)}.</p>
              <div className="mt-5 flex justify-center gap-3">
                <button type="button" className="h-9 min-w-[96px] rounded-md border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={() => setManualRecord(null)}>Cancel</button>
                <button type="submit" className="h-9 min-w-[118px] rounded-md bg-[#28a99a] px-6 text-sm font-semibold text-white hover:bg-[#218f83] disabled:cursor-not-allowed disabled:opacity-60" disabled={manualCheckout.isLoading}>Save</button>
              </div>
            </form>
          </Card>
        </div>
      )}
      {regularizeRecord && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
          <Card className="w-full max-w-md bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-950">Regularize Time</h2>
                <p className="text-xs text-slate-500">{regularizeRecord.employeeName} | {formatDate(regularizeRecord.date)}</p>
              </div>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100" onClick={() => setRegularizeRecord(null)} aria-label="Close regularize time"><X size={16} /></button>
            </div>
            <form onSubmit={(event) => {
              event.preventDefault();
              regularizeAttendance.mutate({ id: regularizeRecord.id, payload: regularizeForm });
            }}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold text-slate-950">
                  Punch In Time
                  <Input className="mt-2" type="time" value={regularizeForm.checkInTime} onChange={(event) => setRegularizeForm({ ...regularizeForm, checkInTime: event.target.value })} />
                </label>
                <label className="block text-xs font-bold text-slate-950">
                  Punch Out Time
                  <Input className="mt-2" type="time" value={regularizeForm.checkOutTime} onChange={(event) => setRegularizeForm({ ...regularizeForm, checkOutTime: event.target.value })} />
                </label>
              </div>
              <p className="mt-3 rounded-md bg-slate-50 p-3 text-xs font-semibold text-slate-500">Only time can be changed. Date remains fixed as {formatDate(regularizeRecord.date)}.</p>
              <div className="mt-5 flex justify-center gap-3">
                <button type="button" className="h-9 min-w-[96px] rounded-md border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={() => setRegularizeRecord(null)}>Cancel</button>
                <button type="submit" className="h-9 min-w-[118px] rounded-md bg-[#28a99a] px-6 text-sm font-semibold text-white hover:bg-[#218f83] disabled:cursor-not-allowed disabled:opacity-60" disabled={regularizeAttendance.isLoading}>Save</button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
