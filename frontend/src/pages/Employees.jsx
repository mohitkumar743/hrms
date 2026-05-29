import { Eye, MoreVertical, Pencil, Plus, Trash2, UserCheck, UserCircle, UserX, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { api } from '../services/api.js';
import { Button, Card, CompactTable, Field, Input, LoadingState, PageHeader, PasswordInput, Select } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';
import { money } from '../lib/utils.js';

const emptyForm = { employeeCode: '', fullName: '', phone: '', email: '', password: 'password123', department: '', designation: '', joiningDate: '', monthlySalary: '', shiftStart: '', shiftEnd: '' };

function EmployeeSection({ title, children, actions, columns = 'md:grid-cols-2 xl:grid-cols-4' }) {
  return (
    <Card className="mb-3 overflow-hidden bg-white">
      <div className="flex min-h-11 items-center justify-between border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-bold text-slate-950">{title}</h2>
        {actions}
      </div>
      <div className={`grid gap-4 p-4 ${columns}`}>{children}</div>
    </Card>
  );
}

export default function Employees() {
  const location = useLocation();
  const isAddPage = location.pathname.endsWith('/add');
  const isViewPage = location.pathname.endsWith('/view') || location.pathname === '/employees';
  const query = useApiQuery('employees', '/employees');
  const settings = useApiQuery('settings', '/settings', { enabled: isAddPage });
  const client = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionMenu, setActionMenu] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
  const mutation = useMutation((payload) => api.post('/employees', {
    ...payload,
    monthlySalary: Number(payload.monthlySalary || 0),
    shiftStart: payload.shiftStart || undefined,
    shiftEnd: payload.shiftEnd || undefined
  }), {
    onSuccess: () => {
      toast.success('Employee added');
      setForm(emptyForm);
      client.invalidateQueries('employees');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to save employee')
  });
  const inactiveMutation = useMutation((id) => api.patch(`/employees/${id}/deactivate`), {
    onSuccess: () => {
      toast.success('Employee marked inactive');
      setActionMenu(null);
      client.invalidateQueries('employees');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update employee')
  });
  const activeMutation = useMutation((id) => api.patch(`/employees/${id}/activate`), {
    onSuccess: () => {
      toast.success('Employee marked active');
      setActionMenu(null);
      client.invalidateQueries('employees');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update employee')
  });
  const deleteMutation = useMutation((id) => api.delete(`/employees/${id}`), {
    onSuccess: () => {
      toast.success('Employee deleted');
      setActionMenu(null);
      client.invalidateQueries('employees');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete employee')
  });
  const updateMutation = useMutation((payload) => api.put(`/employees/${payload.id}`, {
    fullName: payload.fullName,
    phone: payload.phone,
    email: payload.email,
    department: payload.department,
    designation: payload.designation,
    joiningDate: payload.joiningDate,
    monthlySalary: Number(payload.monthlySalary || 0),
    shiftStart: payload.shiftStart || undefined,
    shiftEnd: payload.shiftEnd || undefined,
    status: payload.status
  }), {
    onSuccess: () => {
      toast.success('Employee details updated');
      setEditEmployee(null);
      client.invalidateQueries('employees');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update employee')
  });

  const employees = query.data || [];
  const filteredEmployees = employees.filter((employee) => {
    const text = `${employee.employeeCode} ${employee.fullName} ${employee.department} ${employee.designation} ${employee.email} ${employee.phone}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || employee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const employeeColumns = [
    { key: 'index', label: 'S.No', render: (_employee, index) => String(index + 1).padStart(2, '0') },
    { key: 'name', label: 'Name', render: (employee) => (
      <div className="flex items-center gap-3">
        <UserCircle className="shrink-0 text-slate-500" size={28} />
        <div className="min-w-0">
          <p className="max-w-[150px] truncate font-bold text-slate-950">{employee.fullName}</p>
          <p className="mt-1 text-xs font-semibold text-[#28a99a]">{employee.employeeCode}</p>
        </div>
      </div>
    ) },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'contact', label: 'Contact Details', render: (employee) => (
      <>
        <p className="font-medium text-slate-700">{employee.email}</p>
        <p className="mt-1 text-xs text-slate-500">{employee.phone}</p>
      </>
    ) },
    { key: 'joiningDate', label: 'Join Date' },
    { key: 'shift', label: 'Shift', render: (employee) => `${employee.shiftStart || '-'} - ${employee.shiftEnd || '-'}` },
    { key: 'salary', label: 'Salary', render: (employee) => money(employee.monthlySalary) },
    { key: 'status', label: 'Status', render: (employee) => (
      <span className={`inline-flex min-w-[72px] justify-center rounded px-3 py-1.5 text-xs font-bold ${employee.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
        {employee.status === 'ACTIVE' ? 'Active' : 'Inactive'}
      </span>
    ) },
    { key: 'action', label: 'Action', headerClassName: 'text-center', className: 'text-center', render: (employee) => (
      <button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100" type="button" aria-label={`Actions for ${employee.fullName}`} onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setActionMenu(actionMenu?.employee.id === employee.id ? null : { employee, top: rect.top, left: rect.left - 152 });
      }}>
        <MoreVertical size={16} />
      </button>
    ) }
  ];

  if (query.isLoading || (isAddPage && settings.isLoading)) return <LoadingState />;

  return (
    <>
      {isAddPage && (
        <>
          <PageHeader title="Add New Employee" subtitle="Dashboard / Employee List / Add New Employee" />
          <form onSubmit={(event) => { event.preventDefault(); mutation.mutate(form); }}>
            <EmployeeSection title="Personal Info">
              <Field label="Employee ID" required><Input placeholder="Enter Employee ID" value={form.employeeCode} onChange={(event) => setForm({ ...form, employeeCode: event.target.value })} /></Field>
              <Field label="Full Name" required><Input placeholder="Enter full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></Field>
              <Field label="Department" required><Select value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })}>
                <option value="">Select department</option>
                <option value="HR">HR</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="IT">IT</option>
                <option value="Sales">Sales</option>
              </Select></Field>
              <Field label="Designation" required><Input placeholder="Enter designation" value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} /></Field>
              <Field label="Joining Date" required><Input type="date" value={form.joiningDate} onChange={(event) => setForm({ ...form, joiningDate: event.target.value })} /></Field>
              <Field label="Phone Number" required><Input placeholder="Enter phone number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
              <Field label="Email" required><Input placeholder="Enter email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
              <Field label="Monthly Salary" required><Input type="number" placeholder="Enter monthly salary" value={form.monthlySalary} onChange={(event) => setForm({ ...form, monthlySalary: event.target.value })} /></Field>
            </EmployeeSection>

            <EmployeeSection title="Special Shift Timing" columns="md:grid-cols-2 xl:grid-cols-4">
              <Field label="Shift Start"><Input type="time" value={form.shiftStart} onChange={(event) => setForm({ ...form, shiftStart: event.target.value })} /></Field>
              <Field label="Shift End"><Input type="time" value={form.shiftEnd} onChange={(event) => setForm({ ...form, shiftEnd: event.target.value })} /></Field>
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold leading-5 text-slate-500 md:col-span-2">
                Leave blank to use company default time: {settings.data?.officeStartTime || '09:30'} - {settings.data?.officeEndTime || '18:30'}.
              </div>
            </EmployeeSection>

            <EmployeeSection title="Login Details" columns="md:grid-cols-2">
              <Field label="Password" required><PasswordInput placeholder="Enter password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></Field>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold leading-5 text-slate-500">
                Employee email will be used as the login email.
              </div>
            </EmployeeSection>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button type="button" className="h-10 min-w-[108px] rounded-md border border-[#e52529] bg-white px-8 text-sm font-semibold text-[#e52529] transition hover:bg-red-50" onClick={() => setForm(emptyForm)}>
                Reset
              </button>
              <button type="submit" className="h-10 min-w-[126px] rounded-md bg-[#28a99a] px-8 text-sm font-semibold text-white transition hover:bg-[#218f83] disabled:cursor-not-allowed disabled:opacity-60" disabled={mutation.isLoading}>
                Save Changes
              </button>
            </div>
          </form>
        </>
      )}

      {isViewPage && (
        <>
          <PageHeader title="View Employees" subtitle="Employee profiles, contact details, salary, shift, and status" />
          <CompactTable
            columns={employeeColumns}
            rows={filteredEmployees}
            empty="No employees found"
            minWidth="1050px"
            searchValue={search}
            onSearchChange={setSearch}
            filters={(
              <Select className="h-7 w-full max-w-[128px] text-xs" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="ALL">Filter</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            )}
          />
          {actionMenu && (
            <>
              <button className="fixed inset-0 z-40 cursor-default bg-transparent" type="button" aria-label="Close action menu" onClick={() => setActionMenu(null)} />
              <div className="fixed z-50 w-36 overflow-hidden rounded-md border border-slate-200 bg-white py-1 text-left shadow-panel" style={{ top: actionMenu.top, left: Math.max(8, actionMenu.left) }}>
                <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" onClick={() => { setViewEmployee(actionMenu.employee); setActionMenu(null); }}><Eye size={14} />View Details</button>
                <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50" onClick={() => { setEditEmployee({ ...actionMenu.employee }); setActionMenu(null); }}><Pencil size={14} />Edit Details</button>
                {actionMenu.employee.status === 'INACTIVE' ? (
                  <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={activeMutation.isLoading} onClick={() => activeMutation.mutate(actionMenu.employee.id)}><UserCheck size={14} />Mark Active</button>
                ) : (
                  <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={inactiveMutation.isLoading} onClick={() => inactiveMutation.mutate(actionMenu.employee.id)}><UserX size={14} />Mark Inactive</button>
                )}
                <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-[#e52529] hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={deleteMutation.isLoading} onClick={() => {
                  if (window.confirm(`Delete ${actionMenu.employee.fullName}?`)) deleteMutation.mutate(actionMenu.employee.id);
                }}><Trash2 size={14} />Delete</button>
              </div>
            </>
          )}
          {viewEmployee && (
            <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/30 p-3">
              <Card className="w-full max-w-3xl bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-950">Employee Details</h2>
                    <p className="text-xs text-slate-500">{viewEmployee.fullName} profile and ID card</p>
                  </div>
                  <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close employee details" onClick={() => setViewEmployee(null)}><X size={16} /></button>
                </div>
                <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <UserCircle className="shrink-0 text-slate-500" size={46} />
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-950">{viewEmployee.fullName}</h3>
                        <p className="mt-0.5 text-xs font-semibold text-[#28a99a]">{viewEmployee.employeeCode}</p>
                        <span className={`mt-2 inline-flex rounded px-2.5 py-1 text-[11px] font-bold ${viewEmployee.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{viewEmployee.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
                      <p><span className="block text-[10px] font-bold uppercase text-slate-400">Department</span>{viewEmployee.department}</p>
                      <p><span className="block text-[10px] font-bold uppercase text-slate-400">Designation</span>{viewEmployee.designation}</p>
                      <p><span className="block text-[10px] font-bold uppercase text-slate-400">Email</span>{viewEmployee.email}</p>
                      <p><span className="block text-[10px] font-bold uppercase text-slate-400">Phone</span>{viewEmployee.phone}</p>
                      <p><span className="block text-[10px] font-bold uppercase text-slate-400">Joining Date</span>{viewEmployee.joiningDate}</p>
                      <p><span className="block text-[10px] font-bold uppercase text-slate-400">Monthly Salary</span>{money(viewEmployee.monthlySalary)}</p>
                      <p><span className="block text-[10px] font-bold uppercase text-slate-400">Shift Time</span>{viewEmployee.shiftStart || '-'} - {viewEmployee.shiftEnd || '-'}</p>
                      <p><span className="block text-[10px] font-bold uppercase text-slate-400">Special Shift</span>{viewEmployee.customShiftEnabled ? 'Enabled' : 'Company Default'}</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-panel">
                    <div className="bg-[#28a99a] px-4 py-3 text-center text-white">
                      <p className="text-[10px] font-bold uppercase tracking-wide">Employee ID Card</p>
                      <h3 className="mt-0.5 text-base font-extrabold">HRMS</h3>
                    </div>
                    <div className="p-4 text-center">
                      <UserCircle className="mx-auto text-slate-500" size={56} />
                      <p className="mt-2 text-base font-extrabold text-slate-950">{viewEmployee.fullName}</p>
                      <p className="text-xs font-semibold text-slate-500">{viewEmployee.designation}</p>
                      <div className="my-4 flex justify-center">
                        <div className="rounded-lg border border-slate-200 bg-white p-2">
                          <QRCodeCanvas value={viewEmployee.qrCode || `${viewEmployee.companyId}:${viewEmployee.employeeCode}`} size={92} />
                        </div>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3 text-left text-[11px] text-slate-600">
                        <p><span className="font-bold text-slate-950">ID:</span> {viewEmployee.employeeCode}</p>
                        <p className="mt-1"><span className="font-bold text-slate-950">Dept:</span> {viewEmployee.department}</p>
                        <p className="mt-1"><span className="font-bold text-slate-950">Phone:</span> {viewEmployee.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
          {editEmployee && (
            <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/30 p-3">
              <Card className="w-full max-w-3xl bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-950">Edit Employee Details</h2>
                    <p className="text-xs text-slate-500">{editEmployee.employeeCode}</p>
                  </div>
                  <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close edit employee" onClick={() => setEditEmployee(null)}><X size={16} /></button>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); updateMutation.mutate(editEmployee); }}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Full Name" required><Input value={editEmployee.fullName || ''} onChange={(event) => setEditEmployee({ ...editEmployee, fullName: event.target.value })} /></Field>
                    <Field label="Phone Number" required><Input value={editEmployee.phone || ''} onChange={(event) => setEditEmployee({ ...editEmployee, phone: event.target.value })} /></Field>
                    <Field label="Email" required><Input value={editEmployee.email || ''} onChange={(event) => setEditEmployee({ ...editEmployee, email: event.target.value })} /></Field>
                    <Field label="Department" required><Select value={editEmployee.department || ''} onChange={(event) => setEditEmployee({ ...editEmployee, department: event.target.value })}>
                      <option value="">Select department</option>
                      <option value="HR">HR</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance">Finance</option>
                      <option value="IT">IT</option>
                      <option value="Sales">Sales</option>
                    </Select></Field>
                    <Field label="Designation" required><Input value={editEmployee.designation || ''} onChange={(event) => setEditEmployee({ ...editEmployee, designation: event.target.value })} /></Field>
                    <Field label="Joining Date" required><Input type="date" value={editEmployee.joiningDate || ''} onChange={(event) => setEditEmployee({ ...editEmployee, joiningDate: event.target.value })} /></Field>
                    <Field label="Monthly Salary" required><Input type="number" value={editEmployee.monthlySalary || ''} onChange={(event) => setEditEmployee({ ...editEmployee, monthlySalary: event.target.value })} /></Field>
                    <Field label="Status" required><Select value={editEmployee.status || 'ACTIVE'} onChange={(event) => setEditEmployee({ ...editEmployee, status: event.target.value })}>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </Select></Field>
                    <Field label="Shift Start"><Input type="time" value={editEmployee.shiftStart || ''} onChange={(event) => setEditEmployee({ ...editEmployee, shiftStart: event.target.value })} /></Field>
                    <Field label="Shift End"><Input type="time" value={editEmployee.shiftEnd || ''} onChange={(event) => setEditEmployee({ ...editEmployee, shiftEnd: event.target.value })} /></Field>
                  </div>
                  <div className="mt-5 flex justify-center gap-3">
                    <button type="button" className="h-9 min-w-[96px] rounded-md border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={() => setEditEmployee(null)}>Cancel</button>
                    <button type="submit" className="h-9 min-w-[118px] rounded-md bg-[#28a99a] px-6 text-sm font-semibold text-white hover:bg-[#218f83] disabled:cursor-not-allowed disabled:opacity-60" disabled={updateMutation.isLoading}>Save Changes</button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </>
      )}
    </>
  );
}
