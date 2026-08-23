import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { login } from '../api/authService';
import { useAuthStore } from '../stores/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const [username,setUsername]=useState('emilys');
  const [password,setPassword]=useState('emilyspass');
  const setSession=useAuthStore((s)=>s.setSession);
  const mutation=useMutation({ mutationFn:()=>login(username,password), onSuccess:setSession });
  const submit=(e:FormEvent)=>{e.preventDefault(); mutation.mutate();};
  return <div className="grid min-h-screen place-items-center bg-slate-950 p-4"><div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"><div className="mb-8"><div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-xl font-black text-white">S</div><h1 className="text-2xl font-extrabold">Welcome to SprintDesk</h1><p className="mt-2 text-sm text-slate-500">Sign in with a valid DummyJSON account.</p></div><form className="space-y-4" onSubmit={submit}><Input label="Username" name="username" autoComplete="username" value={username} onChange={(e)=>setUsername(e.target.value)} required/><Input label="Password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} required/>{mutation.error && <div role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{mutation.error.message}</div>}<Button type="submit" className="w-full" disabled={mutation.isPending}>{mutation.isPending?'Signing in…':'Sign in'}</Button></form><p className="mt-5 text-xs text-slate-500">Demo credentials are prefilled for reviewer convenience and are public DummyJSON test credentials.</p></div></div>;
}
