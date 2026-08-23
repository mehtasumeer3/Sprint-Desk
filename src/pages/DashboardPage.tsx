import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getComments, getSprints, getTasks, getUsers } from '../api/mockDataService';
import { useBoardStore } from '../stores/boardStore';
import { DataTable, type Column } from '../components/ui/DataTable';
import type { Task } from '../types';

export default function DashboardPage(){
 const tq=useQuery({queryKey:['tasks'],queryFn:getTasks}); const uq=useQuery({queryKey:['users'],queryFn:getUsers}); const cq=useQuery({queryKey:['comments'],queryFn:getComments}); const sq=useQuery({queryKey:['sprints'],queryFn:getSprints});
 const hydrate=useBoardStore((s)=>s.hydrate); const tasks=useBoardStore((s)=>s.tasks);
 useEffect(()=>{if(tq.data&&cq.data)hydrate(tq.data,cq.data)},[tq.data,cq.data,hydrate]);
 const users=uq.data??[]; const current=sq.data?.find((s)=>s.id===3);
 const stats=useMemo(()=>({total:tasks.length,done:tasks.filter(t=>t.status==='done').length,progress:tasks.filter(t=>t.status==='in-progress').length,overdue:tasks.filter(t=>t.status!=='done'&&new Date(t.dueDate)<new Date()).length}),[tasks]);
 const columns:Column<Task>[]=[{key:'task',header:'Task',render:(t)=><div><strong>{t.title}</strong><div className="text-xs text-slate-500">#{t.id}</div></div>},{key:'assignee',header:'Assignee',render:(t)=>users.find(u=>u.id===t.assigneeId)?.name??'—'},{key:'status',header:'Status',render:(t)=><span className="capitalize">{t.status.replace('-',' ')}</span>},{key:'due',header:'Due',render:(t)=>new Date(t.dueDate).toLocaleDateString()}];
 return <div className="space-y-6"><div><p className="text-sm font-semibold text-brand-600">Overview</p><h1 className="text-2xl font-extrabold">Sprint dashboard</h1><p className="mt-1 text-sm text-slate-500">{current?`${current.name} · ${new Date(current.startDate).toLocaleDateString()} – ${new Date(current.endDate).toLocaleDateString()}`:'Current sprint'}</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Tasks',stats.total],['Completed',stats.done],['In progress',stats.progress],['Overdue',stats.overdue]].map(([label,value])=><div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-extrabold">{value}</div></div>)}</div><section><div className="mb-3"><h2 className="text-lg font-bold">Recently updated</h2><p className="text-sm text-slate-500">Latest activity from the board state.</p></div><DataTable rows={[...tasks].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,8)} columns={columns} getKey={(t)=>t.id}/></section></div>;
}
