import { Plus, Save, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';
import { Button, Card, DataTable, Field, Input, LoadingState, PageHeader, Select } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';
import { api } from '../services/api.js';

const roles = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE'];
const emptyForm = { label: '', path: '', icon: 'FileText', parentId: '', roles: ['COMPANY_ADMIN'], sortOrder: 0, isActive: true };

export default function PageMaster() {
  const pages = useApiQuery('pages', '/pages');
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const client = useQueryClient();
  const isEdit = Boolean(form.id);

  const mutation = useMutation((payload) => {
    const body = { ...payload, parentId: payload.parentId || null, sortOrder: Number(payload.sortOrder || 0) };
    return isEdit ? api.put(`/pages/${payload.id}`, body) : api.post('/pages', body);
  }, {
    onSuccess: () => {
      toast.success(isEdit ? 'Page updated' : 'Page created');
      setForm(emptyForm);
      setShowForm(false);
      client.invalidateQueries('pages');
      client.invalidateQueries('page-navigation');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to save page')
  });

  const toggleRole = (role) => {
    const selected = form.roles.includes(role) ? form.roles.filter((item) => item !== role) : [...form.roles, role];
    setForm({ ...form, roles: selected.length ? selected : [role] });
  };

  const columns = [
    { key: 'label', label: 'Page' },
    { key: 'path', label: 'Path' },
    { key: 'parentId', label: 'Parent', render: (row) => pages.data?.find((page) => page.id === row.parentId)?.label || '-' },
    { key: 'roles', label: 'Roles', render: (row) => row.roles?.join(', ') },
    { key: 'isActive', label: 'Status', render: (row) => row.isActive ? 'Active' : 'Inactive' },
    { key: 'actions', label: 'Action', render: (row) => <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={() => { setForm({ ...row, parentId: row.parentId || '' }); setShowForm(true); }}><Save size={14} />Edit</Button> }
  ];

  if (pages.isLoading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Page Master" subtitle="Create parent and child application pages for backend-driven navigation" actions={<Button type="button" onClick={() => { setForm(emptyForm); setShowForm(true); }}><Plus size={16} />Add Page</Button>} />
      <DataTable columns={columns} rows={pages.data || []} empty="No pages created" />
      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-3">
          <Card className="w-full max-w-3xl overflow-hidden bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div>
                <h2 className="text-base font-bold text-slate-950">{isEdit ? 'Edit Page' : 'Create Page'}</h2>
                <p className="text-xs text-slate-500">Configure route, parent, icon, role access, and status.</p>
              </div>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close page form" onClick={() => { setShowForm(false); setForm(emptyForm); }}><X size={16} /></button>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); mutation.mutate(form); }}>
              <div className="grid gap-4 p-5 md:grid-cols-2">
                <Field label="Page Name" required><Input required value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} placeholder="Employees" /></Field>
                <Field label="Route Path" required><Input required value={form.path} onChange={(event) => setForm({ ...form, path: event.target.value })} placeholder="/employees" /></Field>
                <Field label="Icon" required><Input required value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} placeholder="UsersRound" /></Field>
                <Field label="Parent Page"><Select value={form.parentId} onChange={(event) => setForm({ ...form, parentId: event.target.value })}>
                  <option value="">No Parent</option>
                  {(pages.data || []).filter((page) => page.id !== form.id).map((page) => <option key={page.id} value={page.id}>{page.label}</option>)}
                </Select></Field>
                <Field label="Sort Order"><Input type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} /></Field>
                <Field label="Status"><Select value={form.isActive ? 'ACTIVE' : 'INACTIVE'} onChange={(event) => setForm({ ...form, isActive: event.target.value === 'ACTIVE' })}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Select></Field>
                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-slate-950">Allowed Roles</p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {roles.map((role) => (
                      <label key={role} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <input type="checkbox" checked={form.roles.includes(role)} onChange={() => toggleRole(role)} />
                        {role}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 border-t border-slate-200 px-5 py-4">
                <button type="button" className="h-10 min-w-[108px] rounded-md border border-[#e52529] bg-white px-8 text-sm font-semibold text-[#e52529] transition hover:bg-red-50" onClick={() => setForm(emptyForm)}>
                  Reset
                </button>
                <button type="submit" className="inline-flex h-10 min-w-[126px] items-center justify-center gap-2 rounded-md bg-[#28a99a] px-8 text-sm font-semibold text-white transition hover:bg-[#218f83] disabled:cursor-not-allowed disabled:opacity-60" disabled={mutation.isLoading}>
                  <Plus size={16} />{isEdit ? 'Update Page' : 'Add Page'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
