import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, BriefcaseBusiness, CalendarDays, ChevronLeft, ChevronRight, Clock3, GraduationCap, IndianRupee, LogIn, LogOut, MoreVertical, UserRound, UsersRound, WalletCards } from 'lucide-react';
import { motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { Card, LoadingState, PageHeader } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';
import { cn, money } from '../lib/utils.js';
import { useAuthStore } from '../store/authStore.js';
import { api } from '../services/api.js';

const stats = [
  { label: 'Total Employees', value: '186', helper: '+12 This Month', trend: '8% ^', icon: UsersRound, tone: 'bg-[#3158f6]', card: 'from-[#f3f6ff] via-[#e5ecff] to-[#cddcff]' },
  { label: 'Present Today', value: '164', helper: '88% Workforce', trend: '4% ^', icon: UserRound, tone: 'bg-[#28a99a]', card: 'from-[#effffc] via-[#d8fbf6] to-[#b8f2e9]' },
  { label: 'Open Positions', value: '14', helper: '6 Interviews Today', trend: '3 New', icon: BriefcaseBusiness, tone: 'bg-[#16a9f5]', card: 'from-[#f0fbff] via-[#d8f3ff] to-[#bceaff]' },
  { label: 'Leave Requests', value: '23', helper: '9 Pending Review', trend: '5 New', icon: CalendarDays, tone: 'bg-[#ff7629]', card: 'from-[#fff7ed] via-[#ffead2] to-[#ffd6a8]' },
  { label: 'Payroll Value', value: '₹18.4L', helper: 'May Payroll Cycle', trend: 'Ready', icon: WalletCards, tone: 'bg-[#02c52d]', card: 'from-[#effff2] via-[#d9ffe0] to-[#baffc8]' },
  { label: 'Departments', value: '08', helper: '3 Locations Active', trend: 'Live', icon: GraduationCap, tone: 'bg-[#a61ced]', card: 'from-[#fff3ff] via-[#f8ddff] to-[#edc2ff]' }
];

const demoChartRows = [
  { name: 'Jan', headcount: 142, joined: 6 },
  { name: 'Feb', headcount: 148, joined: 8 },
  { name: 'Mar', headcount: 155, joined: 10 },
  { name: 'Apr', headcount: 162, joined: 7 },
  { name: 'May', headcount: 168, joined: 9 },
  { name: 'Jun', headcount: 171, joined: 5 },
  { name: 'Jul', headcount: 176, joined: 6 },
  { name: 'Aug', headcount: 181, joined: 8 },
  { name: 'Sep', headcount: 186, joined: 7 },
  { name: 'Oct', headcount: 190, joined: 6 },
  { name: 'Nov', headcount: 194, joined: 5 },
  { name: 'Dec', headcount: 201, joined: 9 }
];

function DemoBadge() {
  return <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-700">DEMO</span>;
}

function EduStatCard({ item }) {
  const Icon = item.icon;
  return (
    <Card className={`min-h-[128px] border border-white/80 bg-gradient-to-br ${item.card} p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-panel`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${item.tone} text-white`}>
          <Icon size={19} />
        </div>
        <p className="text-[13px] font-bold text-slate-950">{item.label}</p>
        {item.demo && <DemoBadge />}
      </div>
      <p className="mt-6 text-[22px] font-extrabold leading-none text-slate-950">{item.value}</p>
      <p className="mt-3 text-xs text-slate-950"><span className="font-bold text-[#e52529]">{item.trend}</span> {item.helper}</p>
    </Card>
  );
}

function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function WorkforceAttendance({ attendanceRows = [], employees = [] }) {
  const today = todayIsoLocal();
  const activeEmployees = employees.filter((employee) => employee.status !== 'INACTIVE').length;
  const todayRows = attendanceRows.filter((row) => row.date === today);
  const presentCount = todayRows.filter((row) => ['PRESENT', 'LATE'].includes(row.status)).length;
  const lateCount = todayRows.filter((row) => row.status === 'LATE').length;
  const absentCount = Math.max(activeEmployees - presentCount, 0);
  const missedCount = todayRows.filter((row) => row.checkInTime && !row.checkOutTime).length;
  const total = activeEmployees || todayRows.length;
  const rows = [
    { label: 'Present Today', value: `${percent(presentCount, total)}%`, color: 'bg-[#28a99a]', flex: presentCount },
    { label: 'Absent Today', value: `${percent(absentCount, total)}%`, color: 'bg-[#e52529]', flex: absentCount },
    { label: 'Late Punch In', value: `${percent(lateCount, total)}%`, color: 'bg-[#ff7629]', flex: lateCount },
    { label: 'Open Punch', value: `${percent(missedCount, total)}%`, color: 'bg-[#3158f6]', flex: missedCount }
  ];
  return (
    <Card className="overflow-hidden bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-panel">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-bold text-slate-950">Workforce Attendance</h2>
      </div>
      <div className="p-4">
        <div className="flex h-8 gap-1 overflow-hidden rounded">
          {rows.map((row) => <div key={row.label} className={`${row.color} transition duration-300 hover:brightness-110`} style={{ flex: Math.max(row.flex, total ? 0.2 : 1) }} />)}
        </div>
        <div className="mt-6 space-y-5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center rounded-md text-[13px] transition duration-200 hover:bg-slate-50">
              <span className={`mr-2 h-2.5 w-2.5 rounded-sm ${row.color}`} />
              <span className="text-slate-700">{row.label}</span>
              <span className="ml-auto font-bold text-slate-950">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function CalendarPanel() {
  const now = new Date();
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dates = [...Array(monthStart.getDay()).fill(''), ...Array.from({ length: daysInMonth }, (_value, index) => String(index + 1))];
  const monthLabel = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const today = String(now.getDate());
  return (
    <Card className="overflow-hidden bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-panel">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-bold text-slate-950">Calendar</h2>
      </div>
      <div className="p-3">
        <div className="flex h-7 items-center justify-between rounded-full bg-[#e2f7f5] px-2 text-[12px] font-bold text-slate-600">
          <button className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#28a99a] transition hover:bg-[#28a99a] hover:text-white" aria-label="Previous month"><ChevronLeft size={14} /></button>
          <span>{monthLabel}</span>
          <button className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#28a99a] transition hover:bg-[#28a99a] hover:text-white" aria-label="Next month"><ChevronRight size={14} /></button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-y-2.5 text-center text-[11px] font-bold text-slate-950">
          {days.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="mt-2.5 grid grid-cols-7 gap-y-2 text-center text-[12px] text-slate-500">
          {dates.map((date, index) => (
            <span key={`${date}-${index}`} className={date === today ? 'mx-auto flex h-7 w-7 items-center justify-center rounded bg-[#e52529] font-bold text-white shadow-sm transition duration-200 hover:bg-[#c91f23]' : date ? 'mx-auto flex h-7 w-7 items-center justify-center rounded transition duration-200 hover:bg-[#e2f7f5] hover:text-[#28a99a]' : ''}>{date}</span>
          ))}
        </div>
      </div>
    </Card>
  );
}

function Avatar({ name, tone = 'bg-blue-100 text-blue-700' }) {
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${tone}`}>
      {name.split(' ').map((word) => word[0]).join('').slice(0, 2)}
    </div>
  );
}

function PanelHeader({ title, demo = false }) {
  return (
    <div className="flex min-h-11 items-center justify-between border-b border-slate-200 px-4 py-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-slate-950">{title}</h2>
        {demo && <DemoBadge />}
      </div>
      <button className="text-slate-500 transition hover:text-slate-900" aria-label={`${title} options`}><MoreVertical size={16} /></button>
    </div>
  );
}

function NoticeBoard({ notices = [] }) {
  return (
    <Card className="overflow-hidden bg-white">
      <PanelHeader title="Notice Board" />
      <div className="app-scrollbar h-[360px] space-y-5 overflow-y-auto p-4">
        {notices.length ? notices.map((notice) => (
          <div key={notice.id} className="flex gap-3">
            <Avatar name={notice.title || 'Notice'} tone="bg-indigo-100 text-indigo-700" />
            <div>
              <p className="text-sm font-bold text-slate-950">{notice.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{notice.message}</p>
              <p className="mt-2 text-xs font-medium text-slate-500">{formatDate(notice.createdAt)}</p>
            </div>
          </div>
        )) : <p className="py-10 text-center text-sm font-medium text-slate-500">No notices available.</p>}
      </div>
    </Card>
  );
}

function countLeaveDays(request) {
  if (request.dayType === 'HALF_DAY') return 'Half Day';
  if (!request.startDate || !request.endDate) return '1 Day';
  const days = Math.max(1, Math.round((new Date(request.endDate) - new Date(request.startDate)) / 86400000) + 1);
  return `${days} ${days === 1 ? 'Day' : 'Days'}`;
}

function LeaveRequestsPanel({ leaves = [] }) {
  const requests = [...leaves]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  return (
    <Card className="overflow-hidden bg-white">
      <PanelHeader title="Leave Requests" />
      <div className="app-scrollbar h-[360px] space-y-5 overflow-y-auto p-4">
        {requests.length ? requests.map((request, index) => (
          <div key={request.id || index} className="flex items-start gap-3">
            <Avatar name={request.employeeName || 'Employee'} tone={index % 2 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">{request.employeeName || 'Employee'}</p>
              <p className="mt-1 text-xs text-slate-500">{request.leaveType || 'Leave'} | {request.status || 'PENDING'}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-extrabold text-slate-950">{countLeaveDays(request)}</p>
              <p className="mt-1 whitespace-nowrap text-xs text-slate-500">Applied: {formatDate(request.createdAt)}</p>
            </div>
          </div>
        )) : <p className="py-10 text-center text-sm font-medium text-slate-500">No leave requests found.</p>}
      </div>
    </Card>
  );
}

function formatClock(value) {
  if (!value) return '-';
  const [hours, minutes] = value.split(':').map(Number);
  const displayHours = hours % 12 || 12;
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

function UpcomingEvents({ events = [] }) {
  return (
    <Card className="overflow-hidden bg-white">
      <PanelHeader title="Upcoming Events" />
      <div className="app-scrollbar h-[360px] space-y-6 overflow-y-auto p-4">
        {events.length ? events.map((event, index) => (
          <div key={event.id} className={`flex items-center gap-4 border-l-2 pl-3 ${['border-fuchsia-500', 'border-orange-500', 'border-blue-600', 'border-emerald-500', 'border-cyan-600'][index % 5]}`}>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-950">{formatClock(event.startTime)} - {formatClock(event.endTime)}</p>
              <p className="mt-1 truncate text-xs font-medium text-slate-500">{event.title}</p>
              <p className="mt-2 text-[11px] text-slate-500">{formatDate(event.eventDate)}{event.lead ? <> | Lead by <span className="font-semibold text-[#28a99a]">{event.lead}</span></> : null}</p>
            </div>
            <button className="ml-auto h-8 rounded bg-slate-100 px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-200">View</button>
          </div>
        )) : <p className="py-10 text-center text-sm font-medium text-slate-500">No upcoming events.</p>}
      </div>
    </Card>
  );
}

function UserOverview({ employees = [] }) {
  const employeeCount = employees.length;
  const activeEmployees = employees.filter((employee) => employee.status !== 'INACTIVE').length;
  const inactiveEmployees = employees.filter((employee) => employee.status === 'INACTIVE').length;
  const total = employeeCount || 1;
  const users = [
    { label: 'Active', value: activeEmployees, color: 'bg-[#13b91f]' },
    { label: 'Inactive', value: inactiveEmployees, color: 'bg-[#ff7629]' },
    { label: 'Admins', value: 1, color: 'bg-[#3158f6]', demo: true }
  ];

  return (
    <Card className="overflow-hidden bg-white">
      <PanelHeader title="User Overview" demo />
      <div className="p-4">
        <div className="relative mx-auto h-[178px] max-w-[260px]">
          <div className="absolute left-6 top-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#22d4c1] to-[#0c9f91] text-2xl font-extrabold text-white shadow-lg">{percent(activeEmployees, total)}%</div>
          <div className="absolute right-3 top-2 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#ff9b45] to-[#ff6724] text-2xl font-extrabold text-white shadow-lg">{percent(inactiveEmployees, total)}%</div>
          <div className="absolute bottom-3 right-14 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#7e8cff] to-[#2648f5] text-xl font-extrabold text-white shadow-lg ring-4 ring-white">DEMO</div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-3 px-4">
          {users.map((user) => (
            <div key={user.label}>
              <p className="flex items-center gap-2 text-xs font-medium text-slate-600"><span className={`h-2.5 w-2.5 rounded-full ${user.color}`} />{user.label}{user.demo && <DemoBadge />}</p>
              <p className="mt-2 text-sm font-extrabold text-slate-950">{user.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function IncomeExpenseChart({ payrolls = [] }) {
  const monthly = payrolls.reduce((map, payroll) => {
    const key = payroll.month || 'Unknown';
    const current = map.get(key) || { name: key, salary: 0, deductions: 0 };
    current.salary += Number(payroll.finalSalary || 0);
    current.deductions += Number(payroll.deductions || 0);
    map.set(key, current);
    return map;
  }, new Map());
  const data = [...monthly.values()].sort((a, b) => a.name.localeCompare(b.name));
  const visibleData = data.length ? data : [
    { name: 'Jan', salary: 47000, deductions: 10000 },
    { name: 'Feb', salary: 49000, deductions: 8000 },
    { name: 'Mar', salary: 54000, deductions: 12000 }
  ];
  const totalSalary = data.reduce((sum, row) => sum + row.salary, 0);
  const totalDeductions = data.reduce((sum, row) => sum + row.deductions, 0);
  const formatTooltip = (value) => money(value);

  return (
    <Card className="overflow-hidden bg-white">
      <PanelHeader title="Payroll Trend" demo={!data.length} />
      <div className="p-4">
        <div className="mb-2 flex items-center justify-center gap-4 text-xs text-slate-600">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#28a99a]" />Salary: <b className="text-slate-950">{money(totalSalary)}</b></span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#ff7629]" />Deductions: <b className="text-slate-950">{money(totalDeductions)}</b></span>
        </div>
        <div className="h-[212px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visibleData} margin={{ left: 2, right: 10, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#28a99a" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#28a99a" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff7629" stopOpacity={0.24} />
                  <stop offset="95%" stopColor="#ff7629" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="2 2" />
              <XAxis dataKey="name" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickFormatter={money} />
              <Tooltip cursor={{ stroke: '#cbd5e1' }} formatter={formatTooltip} />
              <Area type="stepAfter" dataKey="salary" stroke="#16a34a" fill="url(#incomeFill)" strokeWidth={2} dot={false} />
              <Area type="stepAfter" dataKey="deductions" stroke="#ff8a1f" fill="url(#expenseFill)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function todayIsoLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

function formatDuration(start, end) {
  if (!start || !end) return '-';
  const minutes = Math.max(0, Math.floor((new Date(end) - new Date(start)) / 60000));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours ? `${hours} hr ` : ''}${remainingMinutes ? `${remainingMinutes} min` : ''}`.trim() || '0 min';
}

function SwipeAction({ label, tone = 'green', icon: Icon, disabled, processing, onComplete }) {
  const [progress, setProgress] = useState(0);
  const trackRef = useRef(null);
  const x = useMotionValue(0);
  const isGreen = tone === 'green';
  const maxTravel = () => Math.max(1, (trackRef.current?.clientWidth || 0) - 52);

  useEffect(() => {
    if (processing) {
      setProgress(100);
      x.set(maxTravel());
      return;
    }
    setProgress(0);
    x.set(0);
  }, [processing, x]);

  const complete = () => {
    if (disabled) return;
    setProgress(100);
    x.set(maxTravel());
    onComplete();
  };
  const reset = () => {
    setProgress(0);
    x.set(0);
  };

  return (
    <div ref={trackRef} className={cn('relative h-[52px] overflow-hidden rounded-md border p-1', isGreen ? 'border-emerald-200 bg-emerald-50' : 'border-orange-200 bg-orange-50')}>
      <motion.div
        className={cn('absolute inset-y-1 left-1 rounded', isGreen ? 'bg-emerald-500' : 'bg-orange-500')}
        initial={false}
        animate={{ width: `${Math.max(16, progress)}%` }}
        transition={{ duration: 0.15 }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 px-14 text-sm font-extrabold text-slate-700">
        <span className="truncate">{processing ? 'Processing...' : label}</span>
      </div>
      <motion.button
        type="button"
        className={cn('relative z-10 flex h-11 w-11 items-center justify-center rounded-md text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70', isGreen ? 'bg-emerald-600' : 'bg-orange-600')}
        style={{ x }}
        drag="x"
        dragConstraints={trackRef}
        dragElastic={0}
        dragMomentum={false}
        onDrag={(_event, info) => {
          const max = maxTravel();
          setProgress(Math.min(100, Math.max(0, (info.offset.x / max) * 100)));
        }}
        onDragEnd={() => {
          const max = maxTravel();
          const travelled = x.get();
          if (travelled >= max * 0.86) complete();
          else reset();
        }}
        disabled={disabled}
        aria-label={label}
      >
        {processing ? <Clock3 size={18} /> : Icon ? <Icon size={18} /> : <ArrowRight size={18} />}
      </motion.button>
    </div>
  );
}

function EmployeePunchCard({ rows, user, punchAttendance }) {
  const [now, setNow] = useState(() => new Date());
  const today = todayIsoLocal();
  const todayRow = rows.find((row) => row.date === today);
  const isPunchedIn = Boolean(todayRow?.checkInTime);
  const isPunchedOut = Boolean(todayRow?.checkOutTime);
  const liveDuration = isPunchedIn ? formatDuration(todayRow.checkInTime, todayRow.checkOutTime || now.toISOString()) : '-';
  const punchType = isPunchedIn ? 'CHECK_OUT' : 'CHECK_IN';
  const isComplete = isPunchedIn && isPunchedOut;

  useEffect(() => {
    if (!isPunchedIn || isPunchedOut) return undefined;
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, [isPunchedIn, isPunchedOut]);

  return (
    <Card className="overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-bold text-slate-950">Today Attendance</h2>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <Avatar name={user?.name || 'Employee'} tone="bg-emerald-100 text-emerald-700" />
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold text-slate-950">{user?.name || 'Employee'}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500"><CalendarDays size={13} />{formatDate(today)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-slate-400">Punch In</p>
            <p className="mt-1 text-sm font-extrabold text-emerald-700">{formatTime(todayRow?.checkInTime)}</p>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase text-slate-400">Punch Out</p>
            <p className="mt-1 text-sm font-extrabold text-orange-600">{formatTime(todayRow?.checkOutTime)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-500"><Clock3 size={14} />Duration</span>
          <span className="text-lg font-extrabold text-slate-950">{liveDuration}</span>
        </div>

        {isComplete ? (
          <div className="rounded-md bg-emerald-50 px-3 py-3 text-center text-sm font-extrabold text-emerald-700">Attendance completed for today</div>
        ) : (
          <SwipeAction
            key={punchType}
            label={isPunchedIn ? 'Swipe to Punch Out' : 'Swipe to Punch In'}
            tone={isPunchedIn ? 'orange' : 'green'}
            icon={isPunchedIn ? LogOut : LogIn}
            disabled={punchAttendance.isLoading}
            processing={punchAttendance.isLoading}
            onComplete={() => punchAttendance.mutate(punchType)}
          />
        )}
      </div>
    </Card>
  );
}

function statusClass(status, missedPunchOut) {
  if (missedPunchOut) return 'bg-red-50 text-red-600';
  if (status === 'LATE') return 'bg-amber-100 text-amber-700';
  if (status === 'ABSENT') return 'bg-red-100 text-red-700';
  return 'bg-emerald-100 text-emerald-700';
}

function EmployeeAttendanceOverview({ rows }) {
  const present = rows.filter((row) => ['PRESENT', 'LATE'].includes(row.status)).length;
  const leave = rows.filter((row) => row.status === 'ON_LEAVE').length;
  const holiday = rows.filter((row) => row.status === 'HOLIDAY').length;
  const total = present + leave + holiday;
  const percent = (value) => (total ? Math.round((value / total) * 100) : 0);
  const items = [
    { label: 'Present', value: present, color: 'bg-[#13b91f]' },
    { label: 'Leave', value: leave, color: 'bg-[#ff7629]' },
    { label: 'Holiday', value: holiday, color: 'bg-[#3158f6]' }
  ];

  return (
    <Card className="overflow-hidden bg-white">
      <PanelHeader title="Attendance Overview" />
      <div className="p-4">
        <div className="relative mx-auto h-[178px] max-w-[260px]">
          <div className="absolute left-6 top-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#22d4c1] to-[#0c9f91] text-2xl font-extrabold text-white shadow-lg">{percent(present)}%</div>
          <div className="absolute right-3 top-2 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#ff9b45] to-[#ff6724] text-2xl font-extrabold text-white shadow-lg">{percent(leave)}%</div>
          <div className="absolute bottom-3 right-14 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#7e8cff] to-[#2648f5] text-xl font-extrabold text-white shadow-lg ring-4 ring-white">{percent(holiday)}%</div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-3 px-4">
          {items.map((item) => (
            <div key={item.label}>
              <p className="flex items-center gap-2 text-xs font-medium text-slate-600"><span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />{item.label}</p>
              <p className="mt-2 text-sm font-extrabold text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function RecentAttendanceHistory({ rows }) {
  const recentRows = [...rows]
    .sort((a, b) => new Date(b.date || b.checkInTime || 0) - new Date(a.date || a.checkInTime || 0))
    .slice(0, 5);

  return (
    <Card className="overflow-hidden bg-white">
      <PanelHeader title="Recent Attendance History" />
      <div className="app-scrollbar h-[300px] space-y-2 overflow-y-auto p-2.5">
        {recentRows.length ? recentRows.map((row) => {
          const missedPunchOut = Boolean(row.checkInTime && !row.checkOutTime);
          return (
            <div key={row.id} className="rounded-md border border-slate-100 bg-slate-50/70 px-3 py-2 transition hover:border-slate-200 hover:bg-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-extrabold leading-tight text-slate-950">
                    {formatDate(row.date || row.checkInTime)}
                    <span className="ml-2 align-middle text-[10px] font-semibold uppercase text-slate-400">{row.attendanceMethod || 'Manual'}</span>
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClass(row.status, missedPunchOut)}`}>
                  {missedPunchOut ? 'MISSED' : row.status || 'PRESENT'}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="min-w-[86px] rounded bg-white px-2.5 py-1.5">
                  <p className="text-[10px] font-semibold text-slate-400">Punch In</p>
                  <p className="text-[12px] font-extrabold leading-tight text-red-600">{formatTime(row.checkInTime)}</p>
                </div>
                <div className="min-w-[72px] text-center">
                  <p className="text-[10px] font-semibold text-slate-400">Duration</p>
                  <p className="text-[12px] font-extrabold leading-tight text-purple-700">{missedPunchOut ? '-' : formatDuration(row.checkInTime, row.checkOutTime)}</p>
                </div>
                <div className="min-w-[86px] rounded bg-white px-2.5 py-1.5 text-right">
                  <p className="text-[10px] font-semibold text-slate-400">Punch Out</p>
                  {missedPunchOut ? (
                    <p className="text-[12px] font-extrabold leading-tight text-red-600">Missed</p>
                  ) : (
                    <p className="text-[12px] font-extrabold leading-tight text-orange-600">{formatTime(row.checkOutTime)}</p>
                  )}
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="px-4 py-10 text-center text-sm font-medium text-slate-500">No attendance history found.</div>
        )}
      </div>
    </Card>
  );
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function buildAdminStats({ employees = [], attendanceRows = [], leaves = [], payrolls = [] }) {
  const today = todayIsoLocal();
  const monthKey = currentMonthKey();
  const activeEmployees = employees.filter((employee) => employee.status !== 'INACTIVE');
  const joinedThisMonth = employees.filter((employee) => employee.joiningDate?.startsWith(monthKey)).length;
  const todayRows = attendanceRows.filter((row) => row.date === today);
  const presentToday = todayRows.filter((row) => ['PRESENT', 'LATE'].includes(row.status)).length;
  const pendingLeaves = leaves.filter((leave) => leave.status === 'PENDING').length;
  const newLeaves = leaves.filter((leave) => leave.createdAt?.startsWith(today)).length;
  const currentPayrolls = payrolls.filter((payroll) => payroll.month === monthKey);
  const payrollValue = (currentPayrolls.length ? currentPayrolls : payrolls).reduce((sum, row) => sum + Number(row.finalSalary || 0), 0);
  const departments = new Set(activeEmployees.map((employee) => employee.department).filter(Boolean)).size;

  return [
    { label: 'Total Employees', value: activeEmployees.length, helper: `${joinedThisMonth} joined this month`, trend: 'Live', icon: UsersRound, tone: 'bg-[#3158f6]', card: 'from-[#f3f6ff] via-[#e5ecff] to-[#cddcff]' },
    { label: 'Present Today', value: presentToday, helper: `${percent(presentToday, activeEmployees.length)}% workforce`, trend: `${todayRows.length} punches`, icon: UserRound, tone: 'bg-[#28a99a]', card: 'from-[#effffc] via-[#d8fbf6] to-[#b8f2e9]' },
    { ...stats[2], demo: true },
    { label: 'Leave Requests', value: pendingLeaves, helper: `${newLeaves} new today`, trend: 'Pending', icon: CalendarDays, tone: 'bg-[#ff7629]', card: 'from-[#fff7ed] via-[#ffead2] to-[#ffd6a8]' },
    { label: 'Payroll Value', value: money(payrollValue), helper: `${monthKey} payroll cycle`, trend: currentPayrolls.length ? 'Current' : 'All', icon: WalletCards, tone: 'bg-[#02c52d]', card: 'from-[#effff2] via-[#d9ffe0] to-[#baffc8]' },
    { label: 'Departments', value: departments, helper: 'From employee profiles', trend: 'Live', icon: GraduationCap, tone: 'bg-[#a61ced]', card: 'from-[#fff3ff] via-[#f8ddff] to-[#edc2ff]' }
  ];
}

function buildHeadcountRows(employees = []) {
  if (!employees.length) return demoChartRows;
  const year = new Date().getFullYear();
  const monthLabels = Array.from({ length: 12 }, (_value, index) => new Date(year, index, 1).toLocaleDateString('en-GB', { month: 'short' }));
  const joinedByMonth = Array(12).fill(0);
  let openingHeadcount = 0;

  employees.forEach((employee) => {
    const joined = employee.joiningDate ? new Date(employee.joiningDate) : null;
    if (!joined || Number.isNaN(joined.getTime())) return;
    if (joined.getFullYear() < year) openingHeadcount += 1;
    if (joined.getFullYear() === year) joinedByMonth[joined.getMonth()] += 1;
  });

  let headcount = openingHeadcount;
  return monthLabels.map((name, index) => {
    headcount += joinedByMonth[index];
    return { name, headcount, joined: joinedByMonth[index] };
  });
}

function EmployeeDashboard({ attendanceRows, notices, events, punchAttendance, user }) {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Your attendance, notices, and upcoming events." />
      <motion.div className="grid gap-4 xl:grid-cols-[347px_1fr_347px]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <EmployeePunchCard rows={attendanceRows} user={user} punchAttendance={punchAttendance} />
        <RecentAttendanceHistory rows={attendanceRows} />
        <CalendarPanel />
      </motion.div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <EmployeeAttendanceOverview rows={attendanceRows} />
        <NoticeBoard notices={notices} />
        <UpcomingEvents events={events} />
      </div>
    </>
  );
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const isEmployee = user?.role === 'EMPLOYEE';
  const canLoadCompanyContent = ['COMPANY_ADMIN', 'EMPLOYEE'].includes(user?.role);
  const client = useQueryClient();
  const attendance = useApiQuery('attendance', '/attendance', { enabled: canLoadCompanyContent });
  const notices = useApiQuery(['notices', isEmployee ? 'visible' : 'all'], isEmployee ? '/notices' : '/notices?all=true', { enabled: canLoadCompanyContent });
  const events = useApiQuery(['events', isEmployee ? 'visible' : 'all'], isEmployee ? '/events' : '/events?all=true', { enabled: canLoadCompanyContent });
  const employees = useApiQuery('dashboard-employees', '/employees', { enabled: user?.role === 'COMPANY_ADMIN' });
  const reports = useApiQuery('dashboard-reports', '/reports', { enabled: user?.role === 'COMPANY_ADMIN' });
  const punchAttendance = useMutation((type) => api.post('/attendance/self-punch', { type }), {
    onSuccess: (_response, type) => {
      toast.success(type === 'CHECK_IN' ? 'Punched in successfully' : 'Punched out successfully');
      client.invalidateQueries('attendance');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update attendance')
  });
  const loading = !user || (isEmployee && attendance.isLoading);
  const attendanceRows = attendance.data || [];
  const noticeRows = notices.data || [];
  const eventRows = events.data || [];
  const employeeRows = employees.data || [];
  const reportRows = reports.data || {};
  const leaveRows = reportRows.leaves || [];
  const payrollRows = reportRows.payrolls || [];
  const adminStats = buildAdminStats({ employees: employeeRows, attendanceRows, leaves: leaveRows, payrolls: payrollRows });
  const chartRows = buildHeadcountRows(employeeRows);
  const headcountIsDemo = !employeeRows.length;
  const formatHeadcountTooltip = (value, name) => [value, name === 'headcount' ? 'Headcount' : 'New Joiners'];

  if (loading) return <LoadingState />;

  if (isEmployee) return <EmployeeDashboard attendanceRows={attendanceRows} notices={noticeRows} events={eventRows} punchAttendance={punchAttendance} user={user} />;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Attendo overview for workforce, attendance, payroll, hiring, and leave operations." />
      <motion.div className="grid gap-4 xl:grid-cols-[1fr_347px]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="grid gap-4 md:grid-cols-3">
          {adminStats.slice(0, 3).map((item, index) => <EduStatCard key={index} item={item} />)}
          {adminStats.slice(3).map((item, index) => <EduStatCard key={index + 3} item={item} />)}
        </div>
        <WorkforceAttendance attendanceRows={attendanceRows} employees={employeeRows} />
      </motion.div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_347px]">
      <Card className="overflow-hidden bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-950">Headcount Growth</h2>
          {headcountIsDemo && <DemoBadge />}
        </div>
        <div className="p-4">
        <div className="mb-3 flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rotate-45 bg-[#28a99a]" />Headcount: <b className="text-slate-950">{chartRows.at(-1)?.headcount || 0}</b></span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rotate-45 bg-[#ff7629]" />New Joiners: <b className="text-slate-950">{chartRows.reduce((sum, row) => sum + row.joined, 0)}</b></span>
        </div>
        <div className="h-[205px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartRows}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} />
              <Tooltip cursor={{ fill: 'transparent' }} formatter={formatHeadcountTooltip} />
              <Bar dataKey="headcount" stackId="a" fill="#28a99a" barSize={27} label={{ position: 'insideTop', fill: '#fff', fontSize: 10, fontWeight: 700 }} />
              <Bar dataKey="joined" stackId="a" fill="#ff7629" barSize={27} radius={[2, 2, 0, 0]} label={{ position: 'insideTop', fill: '#fff', fontSize: 10, fontWeight: 700 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        </div>
      </Card>
      <CalendarPanel />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <NoticeBoard notices={noticeRows} />
        <LeaveRequestsPanel leaves={leaveRows} />
        <UpcomingEvents events={eventRows} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[347px_1fr]">
        <UserOverview employees={employeeRows} />
        <IncomeExpenseChart payrolls={payrollRows} />
      </div>
    </>
  );
}
