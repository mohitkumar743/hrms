import { Download, Eye, EyeOff, Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils.js';

export function Button({ className, variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark',
    orange: 'bg-accent-orange text-white hover:bg-orange-600 active:bg-orange-700',
    ghost: 'bg-transparent text-ink-secondary hover:bg-app-muted active:bg-slate-200',
    outline: 'border border-slate-200 bg-app-panel text-ink-primary hover:border-primary hover:bg-teal-50 hover:text-primary active:bg-teal-100'
  };
  return <button className={cn('inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', variants[variant], className)} {...props} />;
}

export function Card({ className, ...props }) {
  return <div className={cn('surface-card rounded-md border border-white/80 bg-app-panel', className)} {...props} />;
}

export function Input(props) {
  const { className, ...rest } = props;
  return <input className={cn('h-9 w-full rounded-md border border-slate-300 bg-app-panel px-3 text-sm text-ink-primary outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-teal-100 disabled:bg-app-muted disabled:text-ink-secondary', className)} {...rest} />;
}

export function PasswordInput({ className, ...props }) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('pr-10', className)} {...props} />
      <button type="button" className="absolute right-3 top-2.5 text-slate-400 transition hover:text-slate-700" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible((current) => !current)}>
        <Icon size={16} />
      </button>
    </div>
  );
}

export function Select(props) {
  const { className, ...rest } = props;
  return <select className={cn('h-9 w-full rounded-md border border-slate-300 bg-app-panel px-3 text-sm text-ink-primary outline-none focus:border-primary focus:ring-2 focus:ring-teal-100 disabled:bg-app-muted disabled:text-ink-secondary', className)} {...rest} />;
}

export function Textarea(props) {
  const { className, ...rest } = props;
  return <textarea className={cn('min-h-24 w-full rounded-md border border-slate-300 bg-app-panel px-3 py-2 text-sm text-ink-primary outline-none focus:border-primary focus:ring-2 focus:ring-teal-100 disabled:bg-app-muted disabled:text-ink-secondary', className)} {...rest} />;
}

export function StatCard({ icon: Icon, label, value, helper, tone = 'orange' }) {
  const tones = {
    orange: { card: 'from-orange-50 to-orange-100', icon: 'bg-accent-orange' },
    blue: { card: 'from-indigo-50 to-blue-100', icon: 'bg-blue-600' },
    purple: { card: 'from-purple-50 to-fuchsia-100', icon: 'bg-accent-purple' },
    teal: { card: 'from-teal-50 to-cyan-100', icon: 'bg-primary' },
    green: { card: 'from-emerald-50 to-green-100', icon: 'bg-accent-green' },
    sky: { card: 'from-sky-50 to-cyan-100', icon: 'bg-accent-sky' }
  };
  const selectedTone = tones[tone] || tones.orange;
  return (
    <Card className={cn('border-0 bg-gradient-to-br p-4 shadow-none', selectedTone.card)}>
      <div className="flex items-start gap-3">
        {Icon && <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white', selectedTone.icon)}><Icon size={18} /></div>}
        <div>
          <p className="text-xs font-bold text-slate-950">{label}</p>
          <p className="mt-5 text-2xl font-bold text-slate-950">{value}</p>
          {helper && <p className="mt-2 text-xs font-semibold text-ink-secondary">{helper}</p>}
        </div>
      </div>
    </Card>
  );
}

export function DataTable({ columns, rows, empty = 'No records found' }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-100 bg-app-panel shadow-panel">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>{columns.map((column) => <th key={column.key} className="px-4 py-3 font-semibold">{column.label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows?.length ? rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {columns.map((column) => <td key={column.key} className="px-4 py-3 text-slate-700">{column.render ? column.render(row) : row[column.key]}</td>)}
              </tr>
            )) : (
              <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>{empty}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CompactTable({ columns, rows = [], empty = 'No records found', minWidth = '900px', searchValue = '', onSearchChange, filters, getRowKey = (row) => row.id }) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const startIndex = rows.length ? (safePage - 1) * rowsPerPage : 0;
  const visibleRows = rows.slice(startIndex, startIndex + rowsPerPage);
  const from = rows.length ? startIndex + 1 : 0;
  const to = rows.length ? startIndex + visibleRows.length : 0;
  const pageButtons = Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5);

  useEffect(() => {
    setPage(1);
  }, [rows.length, rowsPerPage, searchValue]);

  return (
    <Card className="overflow-hidden bg-white p-3">
      <div className="mb-2 flex flex-col gap-2 lg:flex-row lg:items-center">
        <button className="inline-flex h-7 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-[#28a99a] hover:text-[#28a99a]" type="button">
          <Download size={14} />Export
        </button>
        {onSearchChange && (
          <div className="relative w-full max-w-[312px]">
            <Search className="absolute left-3 top-1.5 text-slate-400" size={13} />
            <Input className="h-7 pl-8 text-xs" placeholder="Search..." value={searchValue} onChange={(event) => onSearchChange(event.target.value)} />
          </div>
        )}
        {filters}
        <div className="ml-auto flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-slate-600">
          <span>Rows per page:</span>
          <Select className="h-7 w-16 text-xs" value={rowsPerPage} onChange={(event) => setRowsPerPage(Number(event.target.value))}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
          </Select>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ minWidth }}>
            <thead className="bg-slate-100 text-[11px] font-bold text-slate-950">
              <tr>{columns.map((column) => <th key={column.key} className={cn('px-3 py-2', column.headerClassName)}>{column.label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRows.length ? visibleRows.map((row, index) => (
                <tr key={getRowKey(row)} className="bg-white text-slate-600 transition hover:bg-slate-50">
                  {columns.map((column) => <td key={column.key} className={cn('px-3 py-2', column.className)}>{column.render ? column.render(row, startIndex + index) : row[column.key]}</td>)}
                </tr>
              )) : (
                <tr><td className="px-4 py-10 text-center text-slate-500" colSpan={columns.length}>{empty}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>Showing {from} to {to} of {rows.length} entries</p>
        <div className="flex items-center gap-2">
          <button className="h-8 w-8 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-40" type="button" disabled={safePage === 1} onClick={() => setPage(1)}>&laquo;</button>
          <button className="h-8 w-8 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-40" type="button" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>&lsaquo;</button>
          {pageButtons.map((pageNumber) => (
            <button key={pageNumber} className={cn('h-8 w-8 rounded text-sm font-bold', pageNumber === safePage ? 'bg-[#28a99a] text-white' : 'bg-slate-100 text-slate-600')} type="button" onClick={() => setPage(pageNumber)}>{pageNumber}</button>
          ))}
          <button className="h-8 w-8 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-40" type="button" disabled={safePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>&rsaquo;</button>
          <button className="h-8 w-8 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-40" type="button" disabled={safePage === totalPages} onClick={() => setPage(totalPages)}>&raquo;</button>
        </div>
      </div>
    </Card>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-950">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Field({ label, required, children }) {
  return (
    <label className="block text-xs font-bold text-slate-950">
      {label}{required && <span className="text-ink-danger"> *</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function FormSection({ title, children, actions }) {
  return (
    <Card className="mb-4 overflow-hidden">
      <div className="flex min-h-11 items-center justify-between border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-bold text-slate-950">{title}</h2>
        {actions}
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </Card>
  );
}

export function LoadingState() {
  return <div className="flex h-48 items-center justify-center text-slate-500"><Loader2 className="mr-2 animate-spin" size={18} />Loading</div>;
}
