import { Lock, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { Button, CompactTable, Field, FormSection, Input, LoadingState, PageHeader } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';
import { api } from '../services/api.js';
import { money } from '../lib/utils.js';
import { useAuthStore } from '../store/authStore.js';

export default function Payroll() {
  const user = useAuthStore((state) => state.user);
  const isEmployee = user?.role === 'EMPLOYEE';
  const query = useApiQuery('payroll', '/payroll');
  const employees = useApiQuery('payroll-employees', '/employees', { enabled: !isEmployee });
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const client = useQueryClient();
  const employeeMap = useMemo(() => new Map((employees.data || []).map((employee) => [employee.id, employee])), [employees.data]);
  const generate = useMutation(() => api.post('/payroll/generate', { month }), {
    onSuccess: () => {
      toast.success('Payroll generated');
      client.invalidateQueries('payroll');
      client.invalidateQueries('reports');
    }
  });
  const lock = useMutation((id) => api.patch(`/payroll/${id}/lock`), {
    onSuccess: () => {
      toast.success('Payroll locked');
      client.invalidateQueries('payroll');
    }
  });
  const rows = (query.data || []).map((row) => {
    const employee = employeeMap.get(row.employeeId);
    return {
      ...row,
      employeeName: employee?.fullName || (isEmployee ? user?.name : 'Employee'),
      employeeCode: employee?.employeeCode || (isEmployee ? user?.email : '')
    };
  });
  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-950">{row.employeeName}</p>
          {row.employeeCode && <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{row.employeeCode}</p>}
        </div>
      )
    },
    { key: 'month', label: 'Month' },
    { key: 'presentDays', label: 'Present' },
    { key: 'absentDays', label: 'Absent' },
    { key: 'lateCount', label: 'Late' },
    { key: 'deductions', label: 'Deductions', render: (row) => money(row.deductions) },
    { key: 'finalSalary', label: 'Final Salary', render: (row) => money(row.finalSalary) },
    !isEmployee && {
      key: 'locked',
      label: 'Status',
      render: (row) => row.locked ? (
        <span className="inline-flex rounded bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Locked</span>
      ) : (
        <Button className="h-8 px-3 text-xs" variant="outline" onClick={() => lock.mutate(row.id)}><Lock size={14} />Lock</Button>
      )
    }
  ].filter(Boolean);

  if (query.isLoading || employees.isLoading) return <LoadingState />;

  return (
    <>
      <PageHeader title={isEmployee ? 'Salary History' : 'Payroll'} subtitle={isEmployee ? 'Your generated monthly salary records' : 'Generate monthly payroll using attendance, absences, late fines, and overtime'} />
      {!isEmployee && (
        <FormSection title="Generate Payroll" actions={<Button type="button" onClick={() => generate.mutate()} disabled={generate.isLoading}><Play size={16} />Generate</Button>}>
          <Field label="Payroll Month" required><Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></Field>
        </FormSection>
      )}
      <CompactTable columns={columns} rows={rows} empty="No payroll records found" minWidth="860px" />
    </>
  );
}
