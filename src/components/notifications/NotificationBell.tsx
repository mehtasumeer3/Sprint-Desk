import { useEffect, useMemo, useRef, useState } from "react";
import { useNotificationStore } from "../../stores/notificationStore";
import { Button } from "../ui/Button";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);

  const items = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  const unread = items.filter((notification) => !notification.read).length;

  const perPage = 20;

  const pageItems = useMemo(
    () => items.slice((page - 1) * perPage, page * perPage),
    [items, page],
  );

  const pages = Math.max(1, Math.ceil(items.length / perPage));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleMarkAllRead = () => {
    markAllRead();
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications, ${unread} unread`}
      >
        <span aria-hidden="true">🔔</span>

        {unread > 0 && (
          <span className="ml-1 rounded-full bg-rose-600 px-1.5 text-xs text-white">
            {unread}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed left-4 right-4 top-16 z-50 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96"
        >
          <div className="mb-2 flex items-center justify-between">
            <strong>Notifications</strong>

            <button
              type="button"
              className="text-xs font-semibold text-brand-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleMarkAllRead}
              disabled={unread === 0}
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-96 space-y-1 overflow-auto">
            {pageItems.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">
                No notifications yet.
              </p>
            ) : (
              pageItems.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => markRead(notification.id)}
                  className={`w-full rounded-xl p-3 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    notification.read
                      ? "bg-transparent"
                      : "bg-brand-50 dark:bg-slate-800"
                  }`}
                >
                  <div className="text-sm font-semibold">
                    {notification.title}
                  </div>

                  <div className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {notification.message}
                  </div>
                </button>
              ))
            )}
          </div>

          {pages > 1 && (
            <div className="mt-3 flex items-center justify-between">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() =>
                  setPage((currentPage) => Math.max(1, currentPage - 1))
                }
              >
                Previous
              </Button>

              <span className="text-xs">
                {page}/{pages}
              </span>

              <Button
                variant="secondary"
                disabled={page === pages}
                onClick={() =>
                  setPage((currentPage) => Math.min(pages, currentPage + 1))
                }
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
