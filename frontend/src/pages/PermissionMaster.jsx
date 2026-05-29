import { CheckSquare, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Button, Card, Field, LoadingState, PageHeader, Select, StatCard } from '../components/ui.jsx';
import { useApiQuery } from '../hooks/useApiQuery.js';
import { api } from '../services/api.js';

export default function PermissionMaster() {
  const companies = useApiQuery('companies', '/companies');
  const pages = useApiQuery('pages', '/pages');
  const [companyId, setCompanyId] = useState('');
  const client = useQueryClient();

  const permission = useQuery(['page-permission', companyId], async () => (await api.get(`/pages/permissions/${companyId}`)).data, { enabled: Boolean(companyId) });
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (permission.data) setSelectedIds(permission.data.pageIds || []);
  }, [permission.data]);

  const mutation = useMutation(() => api.put(`/pages/permissions/${companyId}`, { pageIds: selectedIds }), {
    onSuccess: () => {
      toast.success('Page permissions saved');
      client.invalidateQueries(['page-permission', companyId]);
      client.invalidateQueries('page-navigation');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to save permissions')
  });

  const parentPages = (pages.data || []).filter((page) => !page.parentId && !page.roles?.includes('SUPER_ADMIN'));
  const assignablePageIds = (pages.data || []).filter((page) => !page.roles?.includes('SUPER_ADMIN')).map((page) => page.id);
  const childPages = (parentId) => (pages.data || []).filter((page) => page.parentId === parentId);
  const togglePage = (pageId) => setSelectedIds((current) => current.includes(pageId) ? current.filter((id) => id !== pageId) : [...current, pageId]);
  const toggleParentPage = (page) => {
    const children = childPages(page.id);
    if (!children.length) return togglePage(page.id);

    const childIds = children.map((child) => child.id);
    const hasSelectedChild = childIds.some((childId) => selectedIds.includes(childId));
    setSelectedIds((current) => {
      const next = new Set(current);
      if (hasSelectedChild) {
        next.delete(page.id);
        childIds.forEach((childId) => next.delete(childId));
      } else {
        next.add(page.id);
        childIds.forEach((childId) => next.add(childId));
      }
      return [...next];
    });
  };
  const toggleChildPage = (parentId, childId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(childId)) {
        next.delete(childId);
        const remainingSelectedChild = childPages(parentId).some((child) => child.id !== childId && next.has(child.id));
        if (!remainingSelectedChild) next.delete(parentId);
      } else {
        next.add(childId);
        next.add(parentId);
      }
      return [...next];
    });
  };
  const allSelected = assignablePageIds.length > 0 && assignablePageIds.every((pageId) => selectedIds.includes(pageId));
  const selectAll = () => setSelectedIds(assignablePageIds);
  const clearAll = () => setSelectedIds([]);

  if (companies.isLoading || pages.isLoading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Permission Master" subtitle="Assign parent and child pages to each institute/company" />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <StatCard icon={ShieldCheck} label="Assigned Pages" value={selectedIds.length} tone="teal" />
        <StatCard label="Available Pages" value={assignablePageIds.length} tone="blue" />
        <StatCard label="Institutes" value={companies.data?.length || 0} tone="green" />
      </div>
      <Card className="mb-4 p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <Field label="Select Institute / Company" required><Select value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
            <option value="">Choose company</option>
            {(companies.data || []).map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
          </Select></Field>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={!companyId || allSelected} onClick={selectAll}><CheckSquare size={16} />Select All</Button>
            <Button type="button" variant="outline" disabled={!companyId || selectedIds.length === 0} onClick={clearAll}><RotateCcw size={16} />Clear</Button>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {parentPages.map((page) => (
          <Card key={page.id} className="p-4">
            <label className="flex items-center gap-3 text-sm font-bold text-slate-950">
              <input type="checkbox" checked={selectedIds.includes(page.id) || childPages(page.id).some((child) => selectedIds.includes(child.id))} onChange={() => toggleParentPage(page)} disabled={!companyId} />
              {page.label}
              <span className="ml-auto text-xs font-semibold text-slate-400">{page.path}</span>
            </label>
            <div className="mt-3 space-y-2 border-l border-slate-200 pl-5">
              {childPages(page.id).map((child) => (
                <label key={child.id} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                  <input type="checkbox" checked={selectedIds.includes(child.id)} onChange={() => toggleChildPage(page.id, child.id)} disabled={!companyId} />
                  {child.label}
                  <span className="ml-auto text-xs text-slate-400">{child.path}</span>
                </label>
              ))}
              {childPages(page.id).length === 0 && <p className="text-xs font-semibold text-slate-400">No child pages</p>}
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-center gap-3">
        <button type="button" className="h-10 min-w-[108px] rounded-md border border-[#e52529] bg-white px-8 text-sm font-semibold text-[#e52529] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60" disabled={!companyId || selectedIds.length === 0} onClick={clearAll}>
          Reset
        </button>
        <button type="button" className="inline-flex h-10 min-w-[154px] items-center justify-center gap-2 rounded-md bg-[#28a99a] px-8 text-sm font-semibold text-white transition hover:bg-[#218f83] disabled:cursor-not-allowed disabled:opacity-60" disabled={!companyId || mutation.isLoading} onClick={() => mutation.mutate()}>
          <Save size={16} />Save Permissions
        </button>
      </div>
    </>
  );
}
