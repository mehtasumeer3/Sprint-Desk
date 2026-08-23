import { useEffect, useMemo, useState } from "react";
import type { Task, User } from "../../types";
import { useBoardStore } from "../../stores/boardStore";
import { Button } from "../../components/ui/Button";
import { TaskForm } from "./TaskForm";
import { useToast } from "../../hooks/useToast";

type TaskDrawerProps = {
  task: Task | null;
  users: User[];
  onClose: () => void;
  onDelete: (task: Task) => void;
};

export function TaskDrawer({
  task,
  users,
  onClose,
  onDelete,
}: TaskDrawerProps) {
  const updateTask = useBoardStore((s) => s.updateTask);
  const comments = useBoardStore((s) => s.comments);
  const addComment = useBoardStore((s) => s.addComment);

  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setEditing(false);
    setMessage("");
  }, [task?.id]);

  useEffect(() => {
    if (!task) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [task, onClose]);

  const taskComments = useMemo(
    () =>
      comments
        .filter((comment) => comment.taskId === task?.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [comments, task?.id],
  );

  if (!task) return null;

  const submitComment = () => {
    const text = message.trim();

    if (!text) return;

    addComment({
      id: Date.now(),
      taskId: task.id,
      authorId: users[0]?.id ?? 1,
      message: text,
      createdAt: new Date().toISOString(),
    });

    setMessage("");
    toast("Comment added", "success");
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-950/40"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside
        className="ml-auto h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-title"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Task #{task.id}
            </div>

            <h2 id="task-title" className="mt-1 text-xl font-bold">
              {task.title}
            </h2>
          </div>

          <Button
            variant="ghost"
            onClick={onClose}
            aria-label="Close task details"
          >
            ✕
          </Button>
        </div>

        {editing ? (
          <TaskForm
            users={users}
            initial={task}
            submitLabel="Save changes"
            onSubmit={(values) => {
              updateTask(task.id, values);
              setEditing(false);
              toast("Task updated", "success");
              onClose();
            }}
          />
        ) : (
          <>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {task.description || "No description provided."}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800">
              <div>
                <dt className="text-slate-500">Priority</dt>
                <dd className="mt-1 font-semibold capitalize">
                  {task.priority}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="mt-1 font-semibold capitalize">
                  {task.status.replace("-", " ")}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Assignee</dt>
                <dd className="mt-1 font-semibold">
                  {users.find((user) => user.id === task.assigneeId)?.name}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Due date</dt>
                <dd className="mt-1 font-semibold">
                  {new Date(task.dueDate).toLocaleDateString()}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex gap-2">
              <Button onClick={() => setEditing(true)}>Edit task</Button>

              <Button variant="danger" onClick={() => onDelete(task)}>
                Delete
              </Button>
            </div>
          </>
        )}

        <section className="mt-8 border-t border-slate-200 pt-5 dark:border-slate-700">
          <h3 className="font-bold">Comments</h3>

          <div className="mt-3 space-y-3">
            {taskComments.length === 0 ? (
              <p className="text-sm text-slate-500">No comments yet.</p>
            ) : (
              taskComments.map((comment) => {
                const author = users.find(
                  (user) => user.id === comment.authorId,
                );

                return (
                  <div
                    key={comment.id}
                    className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"
                  >
                    <div className="text-xs font-semibold">
                      {author?.name ?? "Team member"} ·{" "}
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {comment.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          <label className="mt-4 block text-sm font-medium">
            Add comment

            <textarea
              className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-950"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>

          <Button className="mt-2" onClick={submitComment}>
            Add comment
          </Button>
        </section>
      </aside>
    </div>
  );
}