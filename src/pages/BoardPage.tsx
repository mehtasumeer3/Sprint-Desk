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
import { Modal } from "../components/ui/Modal";
import { TaskForm } from "../features/board/TaskForm";
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
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: getTasks });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const commentsQuery = useQuery({
    queryKey: ["comments"],
    queryFn: getComments,
  });
  const tasks = useBoardStore((s) => s.tasks);
  const hydrate = useBoardStore((s) => s.hydrate);
  const addTask = useBoardStore((s) => s.addTask);
  const deleteTask = useBoardStore((s) => s.deleteTask);
  const moveTask = useBoardStore((s) => s.moveTask);
  const undo = useBoardStore((s) => s.undoLastMove);
  const lastSnapshot = useBoardStore((s) => s.lastSnapshot);
  const toast = useToast();
  const [selected, setSelected] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [priority, setPriority] = useState<"all" | Priority>("all");
  const [assignee, setAssignee] = useState("all");
  useEffect(() => {
    if (tasksQuery.data && commentsQuery.data)
      hydrate(tasksQuery.data, commentsQuery.data);
  }, [tasksQuery.data, commentsQuery.data, hydrate]);
  const users = usersQuery.data ?? [];
  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (priority === "all" || t.priority === priority) &&
          (assignee === "all" || t.assigneeId === Number(assignee)),
      ),
    [tasks, priority, assignee],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const onDragEnd = (e: DragEndEvent) => {
    const activeId = Number(e.active.id);

    if (!e.over) return;

    const overId = String(e.over.id);

    // Dropped onto itself — nothing to do
    if (String(activeId) === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overTask = tasks.find((t) => String(t.id) === overId);

    const targetStatus = (
      columns.some((c) => c.id === overId) ? overId : overTask?.status
    ) as TaskStatus | undefined;

    if (!targetStatus) return;

    let newIndex: number;

    if (activeTask.status === targetStatus && overTask) {
      // Same-column reorder:
      // Calculate indexes BEFORE removing the active task.
      const columnTasks = tasks
        .filter((t) => t.status === targetStatus)
        .sort((a, b) => a.order - b.order);

      const overIndex = columnTasks.findIndex((t) => t.id === overTask.id);

      if (overIndex === -1) return;

      newIndex = overIndex;
    } else {
      // Moving to another column
      const targetTasks = tasks
        .filter((t) => t.status === targetStatus && t.id !== activeId)
        .sort((a, b) => a.order - b.order);

      if (overTask) {
        const overIndex = targetTasks.findIndex((t) => t.id === overTask.id);

        newIndex = overIndex >= 0 ? overIndex : targetTasks.length;
      } else {
        // Dropped directly onto empty column / column area
        newIndex = targetTasks.length;
      }
    }

    moveTask(activeId, targetStatus, newIndex);
    toast("Task moved", "success");
  };
  if (tasksQuery.isLoading || usersQuery.isLoading)
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <Skeleton key={n} className="h-96" />
        ))}
      </div>
    );
  if (tasksQuery.error)
    return (
      <div className="rounded-xl bg-rose-50 p-4 text-rose-700">
        Unable to load board data.
      </div>
    );
  return (
    <div>
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">
            Sprint management
          </p>
          <h1 className="text-2xl font-extrabold">Kanban board</h1>
          <p className="mt-1 text-sm text-slate-500">
            Drag, reorder, edit and persist sprint tasks.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as "all" | Priority)}
            options={[
              { value: "all", label: "All priorities" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]}
          />
          <Select
            label="Assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            options={[
              { value: "all", label: "All assignees" },
              ...users.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
          <div className="flex items-end gap-2">
            <Button variant="secondary" disabled={!lastSnapshot} onClick={undo}>
              Undo move
            </Button>
            <Button onClick={() => setCreateOpen(true)}>+ Add task</Button>
          </div>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4">
          {columns.map((col) => {
            const colTasks = filtered
              .filter((t) => t.status === col.id)
              .sort((a, b) => a.order - b.order);
            return (
              <section
                key={col.id}
                id={col.id}
                className="min-w-[calc(100vw-3rem)] rounded-2xl bg-slate-100 p-3 dark:bg-slate-900 sm:min-w-[320px] lg:min-w-0"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="font-bold">{col.label}</h2>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold dark:bg-slate-800">
                    {colTasks.length}
                  </span>
                </div>
                <SortableContext
                  items={colTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="max-h-[calc(100vh-290px)] space-y-3 overflow-y-auto pr-1">
                    {colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        user={users.find((u) => u.id === task.assigneeId)}
                        onOpen={(t) => setSelected(t)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </section>
            );
          })}
        </div>
      </DndContext>
      <TaskDrawer
        task={(selected && tasks.find((t) => t.id === selected.id)) || null}
        users={users}
        onClose={() => setSelected(null)}
        onDelete={(t) => {
          setDeleteTarget(t);
          setSelected(null);
        }}
      />
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
              id: Math.max(0, ...tasks.map((t) => t.id)) + 1,
              title: values.title,
              description: values.description,
              status: "backlog",
              priority: values.priority,
              assigneeId: values.assigneeId,
              dueDate: values.dueDate,
              sprintId: 3,
              order: tasks.filter((t) => t.status === "backlog").length + 1,
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
