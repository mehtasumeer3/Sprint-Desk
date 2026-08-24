import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  rows: T[];
  columns: Column<T>[];
  getKey: (row: T) => string | number;
};

export function DataTable<T>({ rows, columns, getKey }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">
        No data available.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      {/* Mobile layout */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div
            key={getKey(row)}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
          >
            {columns.map((column, index) => (
              <div
                key={column.key}
                className={`grid grid-cols-[100px_minmax(0,1fr)] gap-3 px-4 py-3 ${
                  index !== columns.length - 1
                    ? "border-b border-slate-100 dark:border-slate-800"
                    : ""
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {column.header}
                </div>

                <div className="min-w-0 break-words text-sm text-slate-700 dark:text-slate-200">
                  {column.render(row)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Tablet / Desktop layout */}
      <div className="hidden w-full overflow-x-auto rounded-xl border border-slate-200 md:block dark:border-slate-800">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 font-semibold"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
            {rows.map((row) => (
              <tr
                key={getKey(row)}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/70"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-4 py-3 align-middle text-slate-700 dark:text-slate-200"
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
