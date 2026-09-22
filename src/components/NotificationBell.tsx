import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getListData } from "../api/client";
import type { ChronoNotification } from "../api/types";

const POLL_INTERVAL_MS = 30000;

export function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ChronoNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  async function cargarContador() {
    try {
      const { data } = await api.get<{ unread_count: number }>(
        "/api/notifications/unread-count/",
      );
      setUnreadCount(data.unread_count);
    } catch {
      // Falla silenciosa: no interrumpir la UI por un polling fallido.
    }
  }

  async function cargarNotificaciones() {
    try {
      const { data } = await api.get<ChronoNotification[] | { results: ChronoNotification[] }>(
        "/api/notifications/",
      );
      setNotifications(getListData(data));
    } catch {
      // Falla silenciosa.
    }
  }

  useEffect(() => {
    cargarContador();
    const interval = setInterval(cargarContador, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function alClicFuera(event: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", alClicFuera);
    return () => document.removeEventListener("mousedown", alClicFuera);
  }, []);

  async function alAbrir() {
    const next = !open;
    setOpen(next);
    if (next) {
      await cargarNotificaciones();
    }
  }

  async function marcarLeida(notification: ChronoNotification) {
    if (!notification.read) {
      try {
        await api.post(`/api/notifications/${notification.id}/read/`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Falla silenciosa.
      }
    }
    setOpen(false);
    if (notification.link) navigate(notification.link);
  }

  async function marcarTodasLeidas() {
    try {
      await api.post("/api/notifications/read-all/");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Falla silenciosa.
    }
  }

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={alAbrir}
        className="relative rounded-md border border-line bg-white p-2 text-ink/70 hover:bg-surface"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-alert px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-lg border border-line bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <p className="text-sm font-medium">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={marcarTodasLeidas}
                className="text-xs text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-4 text-sm text-ink/50">No notifications.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => marcarLeida(notification)}
                  className={`block w-full border-b border-line px-4 py-3 text-left text-sm last:border-0 hover:bg-surface ${
                    notification.read ? "text-ink/50" : "font-medium text-ink"
                  }`}
                >
                  <p>{notification.message}</p>
                  <p className="mt-1 text-xs text-ink/40">
                    {new Date(notification.created_at).toLocaleString("en-US")}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}