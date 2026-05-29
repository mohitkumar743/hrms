import { BarChart3, CalendarCheck, Clock3, Download, IndianRupee, ListFilter, WalletCards } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMemo, useState } from 'react';
import { Button, Card, CompactTable, Field, Input, LoadingState, PageHeader, Select, StatCard } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';
import { cn, money } from '../lib/utils.js';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatMinutes(value) {
  const total = Number(value || 0);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m` : '0m'}`.trim();
}

function withinDateRange(value, from, to) {
  if (!value) return true;
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

function statusBadge(status) {
  const styles = {
    PRESENT: 'bg-green-100 text-green-700',
    LATE: 'bg-orange-100 text-orange-700',
    PENDING: 'bg-orange-100 text-orange-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-600'
  };
  return <span className={cn('inline-flex min-w-[78px] justify-center rounded px-2.5 py-1 text-[11px] font-bold', styles[status] || 'bg-slate-100 text-slate-600')}>{status || '-'}</span>;
}

function exportCsv(filename, rows, columns) {
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [
    columns.map((column) => escape(column.label)).join(','),
    ...rows.map((row) => columns.map((column) => escape(column.value(row))).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function monthName(month) {
  if (!month) return '-';
  const [year, rawMonth] = month.split('-').map(Number);
  if (!year || !rawMonth) return month;
  return new Date(year, rawMonth - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export default function Reports() {
  const query = useApiQuery('reports', '/reports');
  const employees = useApiQuery('reports-employees', '/employees');
  const [reportTab, setReportTab] = useState('attendance');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const report = query.data || {};
  const attendance = report.attendance || [];
  const leaves = report.leaves || [];
  const payrolls = report.payrolls || [];
  const employeeMap = useMemo(() => new Map((employees.data || []).map((employee) => [employee.id, employee])), [employees.data]);
  const employeeLabel = (employeeId) => {
    const employee = employeeMap.get(employeeId);
    if (!employee) return employeeId || '-';
    return employee.employeeCode ? `${employee.fullName} (${employee.employeeCode})` : employee.fullName;
  };

  const filteredAttendance = useMemo(() => attendance.filter((row) => {
    const statusMatch = statusFilter === 'ALL' || row.status === statusFilter;
    return statusMatch && withinDateRange(row.date, fromDate, toDate);
  }), [attendance, fromDate, statusFilter, toDate]);

  const filteredLeaves = useMemo(() => leaves.filter((row) => {
    const statusMatch = statusFilter === 'ALL' || row.status === statusFilter;
    return statusMatch && withinDateRange(row.startDate, fromDate, toDate);
  }), [leaves, fromDate, statusFilter, toDate]);

  const filteredPayrolls = useMemo(() => payrolls.filter((row) => {
    const date = row.month ? `${row.month}-01` : '';
    return withinDateRange(date, fromDate, toDate);
  }), [fromDate, payrolls, toDate]);

  const attendanceStatusRows = ['PRESENT', 'LATE', 'ABSENT', 'ON_LEAVE'].map((status) => ({
    name: status.replace('_', ' '),
    value: filteredAttendance.filter((row) => row.status === status).length
  }));
  const leaveStatusRows = ['PENDING', 'APPROVED', 'REJECTED'].map((status) => ({
    name: status,
    value: filteredLeaves.filter((row) => row.status === status).length
  }));
  const payrollChartRows = Object.values(filteredPayrolls.reduce((map, row) => {
    const key = row.month || 'Unknown';
    map[key] = map[key] || { name: monthName(key), salary: 0, deductions: 0 };
    map[key].salary += Number(row.finalSalary || 0);
    map[key].deductions += Number(row.deductions || 0);
    return map;
  }, {}));

  const payrollCost = filteredPayrolls.reduce((sum, row) => sum + Number(row.finalSalary || 0), 0);
  const lateMinutes = filteredAttendance.reduce((sum, row) => sum + Number(row.lateMinutes || 0), 0);
  const pendingLeaves = filteredLeaves.filter((row) => row.status === 'PENDING').length;
  const lockedPayrolls = filteredPayrolls.filter((row) => row.locked).length;

  const activeRows = reportTab === 'attendance' ? filteredAttendance : reportTab === 'leaves' ? filteredLeaves : filteredPayrolls;
  const activeExportColumns = {
    attendance: [
      { label: 'Employee', value: (row) => employeeLabel(row.employeeId) },
      { label: 'Date', value: (row) => row.date },
      { label: 'Status', value: (row) => row.status },
      { label: 'Punch In', value: (row) => row.checkInTime },
      { label: 'Punch Out', value: (row) => row.checkOutTime },
      { label: 'Late Minutes', value: (row) => row.lateMinutes },
      { label: 'Method', value: (row) => row.attendanceMethod }
    ],
    leaves: [
      { label: 'Employee', value: (row) => row.employeeName || row.employeeId },
      { label: 'Type', value: (row) => row.leaveType },
      { label: 'From', value: (row) => row.startDate },
      { label: 'To', value: (row) => row.endDate },
      { label: 'Status', value: (row) => row.status },
      { label: 'Remark', value: (row) => row.remark }
    ],
    payroll: [
      { label: 'Employee', value: (row) => employeeLabel(row.employeeId) },
      { label: 'Month', value: (row) => row.month },
      { label: 'Present', value: (row) => row.presentDays },
      { label: 'Absent', value: (row) => row.absentDays },
      { label: 'Deductions', value: (row) => row.deductions },
      { label: 'Final Salary', value: (row) => row.finalSalary },
      { label: 'Locked', value: (row) => row.locked ? 'Yes' : 'No' }
    ]
  }[reportTab];

  if (query.isLoading || employees.isLoading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Review attendance, leave, and payroll performance from one place."
        actions={<Button variant="outline" onClick={() => exportCsv(`${reportTab}-report.csv`, activeRows, activeExportColumns)}><Download size={16} />CSV</Button>}
      />

      <Card className="mb-4 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Report View">
            <Select value={reportTab} onChange={(event) => setReportTab(event.target.value)}>
              <option value="attendance">Attendance</option>
              <option value="leaves">Leave</option>
              <option value="payroll">Payroll</option>
            </Select>
          </Field>
          <Field label="From Date"><Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></Field>
          <Field label="To Date"><Input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} /></Field>
          <Field label="Status Filter">
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} disabled={reportTab === 'payroll'}>
              <option value="ALL">All Status</option>
              {reportTab === 'attendance' ? (
                <>
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="ABSENT">Absent</option>
                  <option value="ON_LEAVE">On Leave</option>
                </>
              ) : (
                <>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </>
              )}
            </Select>
          </Field>
        </div>
      </Card>

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Attendance Rows" value={filteredAttendance.length} helper={`${formatMinutes(lateMinutes)} total late time`} tone="teal" />
        <StatCard icon={ListFilter} label="Pending Leaves" value={pendingLeaves} helper={`${filteredLeaves.length} total requests`} tone="orange" />
        <StatCard icon={WalletCards} label="Payroll Cost" value={money(payrollCost)} helper={`${lockedPayrolls} locked records`} tone="green" />
        <StatCard icon={Clock3} label="Late Entries" value={filteredAttendance.filter((row) => row.status === 'LATE').length} helper="Attendance status count" tone="purple" />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <Card className="bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 size={17} className="text-slate-500" />
            <h2 className="text-sm font-extrabold text-slate-950">Attendance Status</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceStatusRows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="#28a99a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <IndianRupee size={17} className="text-slate-500" />
            <h2 className="text-sm font-extrabold text-slate-950">{reportTab === 'payroll' ? 'Payroll by Month' : 'Leave Status'}</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {reportTab === 'payroll' ? (
                <BarChart data={payrollChartRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={money} />
                  <Tooltip formatter={(value) => money(value)} />
                  <Bar dataKey="salary" fill="#28a99a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deductions" fill="#ff7629" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie data={leaveStatusRows} dataKey="value" nameKey="name" innerRadius={58} outerRadius={94} paddingAngle={3}>
                    {['#ff7629', '#28a99a', '#e52529'].map((color) => <Cell key={color} fill={color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {reportTab === 'attendance' && (
        <CompactTable
          columns={[
            { key: 'index', label: 'S.No', render: (_row, index) => String(index + 1).padStart(2, '0') },
            { key: 'employeeId', label: 'Employee', render: (row) => employeeLabel(row.employeeId) },
            { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
            { key: 'checkInTime', label: 'Punch In', render: (row) => formatTime(row.checkInTime) },
            { key: 'checkOutTime', label: 'Punch Out', render: (row) => formatTime(row.checkOutTime) },
            { key: 'status', label: 'Status', render: (row) => statusBadge(row.status) },
            { key: 'lateMinutes', label: 'Late', render: (row) => formatMinutes(row.lateMinutes) },
            { key: 'attendanceMethod', label: 'Method' }
          ]}
          rows={filteredAttendance}
          empty="No attendance report rows"
          minWidth="940px"
        />
      )}

      {reportTab === 'leaves' && (
        <CompactTable
          columns={[
            { key: 'index', label: 'S.No', render: (_row, index) => String(index + 1).padStart(2, '0') },
            { key: 'employeeName', label: 'Employee', render: (row) => row.employeeName || row.employeeId },
            { key: 'leaveType', label: 'Type' },
            { key: 'startDate', label: 'From', render: (row) => formatDate(row.startDate) },
            { key: 'endDate', label: 'To', render: (row) => formatDate(row.endDate) },
            { key: 'status', label: 'Status', render: (row) => statusBadge(row.status) },
            { key: 'remark', label: 'Remark', render: (row) => row.remark || '-' }
          ]}
          rows={filteredLeaves}
          empty="No leave report rows"
          minWidth="860px"
        />
      )}

      {reportTab === 'payroll' && (
        <CompactTable
          columns={[
            { key: 'index', label: 'S.No', render: (_row, index) => String(index + 1).padStart(2, '0') },
            { key: 'employeeId', label: 'Employee', render: (row) => employeeLabel(row.employeeId) },
            { key: 'month', label: 'Month', render: (row) => monthName(row.month) },
            { key: 'presentDays', label: 'Present' },
            { key: 'absentDays', label: 'Absent' },
            { key: 'lateCount', label: 'Late' },
            { key: 'deductions', label: 'Deductions', render: (row) => money(row.deductions) },
            { key: 'finalSalary', label: 'Final Salary', render: (row) => money(row.finalSalary) },
            { key: 'locked', label: 'Status', render: (row) => row.locked ? 'Locked' : 'Draft' }
          ]}
          rows={filteredPayrolls}
          empty="No payroll report rows"
          minWidth="980px"
        />
      )}
    </>
  );
}
