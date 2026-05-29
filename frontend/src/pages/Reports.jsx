import { Download } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button, Card, DataTable, LoadingState, PageHeader, StatCard } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';
import { money } from '../lib/utils.js';

export default function Reports() {
  const query = useApiQuery('reports', '/reports');
  if (query.isLoading) return <LoadingState />;

  const chart = [
    { name: 'Present', value: query.data?.totals?.present || 0 },
    { name: 'Late', value: query.data?.totals?.late || 0 },
    { name: 'Leaves', value: query.data?.leaves?.length || 0 }
  ];

  return (
    <>
      <PageHeader title="Reports" subtitle="Attendance, payroll, and leave reporting" actions={<><Button variant="outline"><Download size={16} />CSV</Button><Button variant="outline"><Download size={16} />PDF</Button></>} />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <StatCard label="Attendance Rows" value={query.data?.attendance?.length || 0} tone="teal" />
        <StatCard label="Leave Requests" value={query.data?.leaves?.length || 0} tone="purple" />
        <StatCard label="Payroll Cost" value={money(query.data?.totals?.payrollCost)} tone="orange" />
      </div>
      <Card className="mb-5 p-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--color-brand-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <DataTable columns={[{ key: 'employeeId', label: 'Employee' }, { key: 'month', label: 'Month' }, { key: 'finalSalary', label: 'Final Salary', render: (row) => money(row.finalSalary) }]} rows={query.data?.payrolls || []} empty="No payroll report rows" />
    </>
  );
}
