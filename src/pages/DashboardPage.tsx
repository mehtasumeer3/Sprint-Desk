import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getComments,
  getSprints,
  getTasks,
  getUsers,
} from "../api/mockDataService";
import { useBoardStore } from "../stores/boardStore";
import { DataTable, type Column } from "../components/ui/DataTable";
import { Skeleton } from "../components/ui/Skeleton";
import type { Task } from "../types";

export default function DashboardPage() {
  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const commentsQuery = useQuery({
    queryKey: ["comments"],
    queryFn: getComments,
  });

  const sprintsQuery = useQuery({
    queryKey: ["sprints"],
    queryFn: getSprints,
  });

  const hydrate = useBoardStore((state) => state.hydrate);
  const tasks = useBoardStore((state) => state.tasks);

  useEffect(() => {
    if (tasksQuery.data && commentsQuery.data) {
      hydrate(tasksQuery.data, commentsQuery.data);
    }
  }, [tasksQuery.data, commentsQuery.data, hydrate]);

  const users = usersQuery.data ?? [];

  const currentSprint = sprintsQuery.data?.find((sprint) => sprint.id === 3);

  const stats = useMemo(() => {
    const now = new Date();

    return {
      total: tasks.length,
      done: tasks.filter((task) => task.status === "done").length,
      progress: tasks.filter((task) => task.status === "in-progress").length,
      overdue: tasks.filter(
        (task) => task.status !== "done" && new Date(task.dueDate) < now,
      ).length,
    };
  }, [tasks]);

  const columns: Column<Task>[] = [
    {
      key: "task",
      header: "Task",
      render: (task) => (
        <div>
          <strong>{task.title}</strong>
          <div className="text-xs text-slate-500">#{task.id}</div>
        </div>
      ),
    },
    {
      key: "assignee",
      header: "Assignee",
      render: (task) =>
        users.find((user) => user.id === task.assigneeId)?.name ?? "—",
    },
    {
      key: "status",
      header: "Status",
      render: (task) => (
        <span className="capitalize">{task.status.replace("-", " ")}</span>
      ),
    },
    {
      key: "due",
      header: "Due",
      render: (task) => new Date(task.dueDate).toLocaleDateString(),
    },
  ];

  const isLoading =
    tasksQuery.isLoading ||
    usersQuery.isLoading ||
    commentsQuery.isLoading ||
    sprintsQuery.isLoading;

  const hasError =
    tasksQuery.isError ||
    usersQuery.isError ||
    commentsQuery.isError ||
    sprintsQuery.isError;

  if (isLoading) {
    return (
      <div className="min-w-0 space-y-6">
        <Skeleton className="h-24" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-28" />
          ))}
        </div>

        <Skeleton className="h-72" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="rounded-xl bg-rose-50 p-4 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
        Unable to load dashboard data.
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-600">Overview</p>

        <h1 className="text-2xl font-extrabold">Sprint dashboard</h1>

        <p className="mt-1 text-sm text-slate-500">
          {currentSprint
            ? `${currentSprint.name} · ${new Date(
                currentSprint.startDate,
              ).toLocaleDateString()} – ${new Date(
                currentSprint.endDate,
              ).toLocaleDateString()}`
            : "Current sprint"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Tasks", stats.total],
          ["Completed", stats.done],
          ["In progress", stats.progress],
          ["Overdue", stats.overdue],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-sm text-slate-500">{label}</div>

            <div className="mt-2 text-3xl font-extrabold">{value}</div>
          </div>
        ))}
      </div>

      <section className="min-w-0">
        <div className="mb-3">
          <h2 className="text-lg font-bold">Recently updated</h2>

          <p className="text-sm text-slate-500">
            Latest activity from the board state.
          </p>
        </div>

        <DataTable
          rows={[...tasks]
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .slice(0, 8)}
          columns={columns}
          getKey={(task) => task.id}
        />
      </section>
    </div>
  );
}
