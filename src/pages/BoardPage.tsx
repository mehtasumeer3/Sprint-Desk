import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { getComments, getTasks, getUsers } from "../api/mockDataService";
import { useBoardStore } from "../stores/boardStore";
import type { Priority, Task, TaskStatus } from "../types";

import { TaskCard } from "../features/board/TaskCard";
import { TaskDrawer } from "../features/board/TaskDrawer";
import { TaskForm } from "../features/board/TaskForm";

import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { Skeleton } from "../components/ui/Skeleton";

import { useToast } from "../hooks/useToast";

const columns: { id: TaskStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "in-progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

export default function BoardPage() {
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

  const tasks = useBoardStore((state) => state.tasks);
  const hydrate = useBoardStore((state) => state.hydrate);
  const addTask = useBoardStore((state) => state.addTask);
  const deleteTask = useBoardStore((state) => state.deleteTask);
  const moveTask = useBoardStore((state) => state.moveTask);
  const undo = useBoardStore((state) => state.undoLastMove);
  const lastSnapshot = useBoardStore((state) => state.lastSnapshot);

  const toast = useToast();

  const [selected, setSelected] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const [priority, setPriority] = useState<"all" | Priority>("all");
  const [assignee, setAssignee] = useState("all");

  useEffect(() => {
    if (tasksQuery.data && commentsQuery.data) {
      hydrate(tasksQuery.data, commentsQuery.data);
    }
  }, [tasksQuery.data, commentsQuery.data, hydrate]);

  const users = usersQuery.data ?? [];

  const filtered = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (priority === "all" || task.priority === priority) &&
          (assignee === "all" || task.assigneeId === Number(assignee)),
      ),
    [tasks, priority, assignee],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const activeId = Number(event.active.id);

    if (!event.over) return;

    const overId = String(event.over.id);

    if (String(activeId) === overId) return;

    const activeTask = tasks.find((task) => task.id === activeId);

    if (!activeTask) return;

    const overTask = tasks.find((task) => String(task.id) === overId);

    const targetStatus = (
      columns.some((column) => column.id === overId) ? overId : overTask?.status
    ) as TaskStatus | undefined;

    if (!targetStatus) return;

    let newIndex: number;

    if (activeTask.status === targetStatus && overTask) {
      const columnTasks = tasks
        .filter((task) => task.status === targetStatus)
        .sort((a, b) => a.order - b.order);

      const overIndex = columnTasks.findIndex(
        (task) => task.id === overTask.id,
      );

      if (overIndex === -1) return;

      newIndex = overIndex;
    } else {
      const targetTasks = tasks
        .filter((task) => task.status === targetStatus && task.id !== activeId)
        .sort((a, b) => a.order - b.order);

      if (overTask) {
        const overIndex = targetTasks.findIndex(
          (task) => task.id === overTask.id,
        );

        newIndex = overIndex >= 0 ? overIndex : targetTasks.length;
      } else {
        newIndex = targetTasks.length;
      }
    }

    moveTask(activeId, targetStatus, newIndex);
    toast("Task moved", "success");
  };

  if (tasksQuery.isLoading || usersQuery.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-96" />
        ))}
      </div>
    );
  }

  if (tasksQuery.error) {
    return (
      <div className="rounded-xl bg-rose-50 p-4 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
        Unable to load board data.
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {/* Header + filters */}
      <div className="mb-5 flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-600">
            Sprint management
          </p>

          <h1 className="text-2xl font-extrabold">Kanban board</h1>

          <p className="mt-1 text-sm text-slate-500">
            Drag, reorder, edit and persist sprint tasks.
          </p>
        </div>

        <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[180px_220px_auto] xl:items-end">
          <div className="min-w-0">
            <Select
              label="Priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as "all" | Priority)
              }
              options={[
                { value: "all", label: "All priorities" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
            />
          </div>

          <div className="min-w-0">
            <Select
              label="Assignee"
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
              options={[
                { value: "all", label: "All assignees" },
                ...users.map((user) => ({
                  value: user.id,
                  label: user.name,
                })),
              ]}
            />
          </div>

          <div className="flex flex-wrap items-end gap-2 sm:col-span-2 xl:col-span-1">
            <Button variant="secondary" disabled={!lastSnapshot} onClick={undo}>
              Undo move
            </Button>

            <Button onClick={() => setCreateOpen(true)}>+ Add task</Button>
          </div>
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={onDragEnd}
      >
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-4">
          {columns.map((column) => {
            const columnTasks = filtered
              .filter((task) => task.status === column.id)
              .sort((a, b) => a.order - b.order);

            return (
              <section
                key={column.id}
                id={column.id}
                className="min-w-0 rounded-2xl bg-slate-100 p-3 dark:bg-slate-900"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="font-bold">{column.label}</h2>

                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold dark:bg-slate-800">
                    {columnTasks.length}
                  </span>
                </div>

                <SortableContext
                  items={columnTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 lg:max-h-[calc(100vh-290px)] lg:overflow-y-auto lg:pr-1">
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        user={users.find((user) => user.id === task.assigneeId)}
                        onOpen={(taskToOpen) => setSelected(taskToOpen)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </section>
            );
          })}
        </div>
      </DndContext>

      {/* Task drawer */}
      <TaskDrawer
        task={
          (selected && tasks.find((task) => task.id === selected.id)) || null
        }
        users={users}
        onClose={() => setSelected(null)}
        onDelete={(task) => {
          setDeleteTarget(task);
          setSelected(null);
        }}
      />

      {/* Create task */}
      <Modal
        open={createOpen}
        title="Create task"
        onClose={() => setCreateOpen(false)}
      >
        <TaskForm
          users={users}
          onSubmit={(values) => {
            const now = new Date().toISOString();

            const newTask: Task = {
              id: Math.max(0, ...tasks.map((task) => task.id)) + 1,
              title: values.title,
              description: values.description,
              status: "backlog",
              priority: values.priority,
              assigneeId: values.assigneeId,
              dueDate: values.dueDate,
              sprintId: 3,
              order:
                tasks.filter((task) => task.status === "backlog").length + 1,
              createdAt: now,
              completedAt: null,
              updatedAt: now,
            };

            addTask(newTask);
            setCreateOpen(false);
            toast("Task created", "success");
          }}
        />
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={Boolean(deleteTarget)}
        title="Delete task?"
        onClose={() => setDeleteTarget(null)}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This will permanently delete “{deleteTarget?.title}” and its comments.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={() => {
              if (deleteTarget) {
                deleteTask(deleteTarget.id);
                toast("Task deleted", "success");
              }

              setDeleteTarget(null);
            }}
          >
            Delete task
          </Button>
        </div>
      </Modal>
    </div>
  );
}
