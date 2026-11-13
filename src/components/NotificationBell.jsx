
import { useContext, useState } from "react";
import { MovieContext } from "../context/MovieContext";

function NotificationBell() {
  const { notifications, setNotifications } =
    useContext(MovieContext);

  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Mark individual notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  return (
    <div className="relative">

      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl text-[#b89236] hover:bg-[#d1b36b] hover:text-white transition"
        aria-label="Notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-[100] w-80 max-w-[90vw] overflow-hidden rounded-xl border border-slate-600 bg-[#172033] text-white shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-600 p-4">

            <h3 className="font-bold text-[#d1b36b]">
              Notifications
            </h3>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Mark all as read
              </button>
            )}

          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">

            {notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-400">
                No notifications yet
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`cursor-pointer border-b border-slate-700 p-4 transition hover:bg-slate-700/60 ${
                    !notification.read
                      ? "bg-slate-700/40"
                      : ""
                  }`}
                >

                  <div className="flex items-start gap-3">

                    <span className="text-xl">
                      {notification.type === "created"
                        ? "🟢"
                        : notification.type === "updated"
                        ? "🔵"
                        : "🔴"}
                    </span>

                    <div className="flex-1">

                      <p className="text-sm">
                        {notification.message}
                      </p>

                      <p className="mt-1 text-xs capitalize text-gray-400">
                        Movie {notification.type}
                      </p>

                    </div>

                    {!notification.read && (
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                    )}

                  </div>

                </div>
              ))
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default NotificationBell;