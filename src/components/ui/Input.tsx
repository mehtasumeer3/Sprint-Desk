import type { InputHTMLAttributes } from 'react';
type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };
export function Input({ label, error, id, className = '', ...props }: Props) {
  const inputId = id ?? props.name;
  return <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor={inputId}>{label}<input id={inputId} className={`mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${className}`} {...props}/>{error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}</label>;
}
