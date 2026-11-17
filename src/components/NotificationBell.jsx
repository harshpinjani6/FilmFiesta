
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MovieContext } from "../context/MovieContext";
import { useAuth } from "../context/AuthContext";

function NotificationBell() {
  const {
    notifications,
    notificationsLoading,
    notificationError,
    markNotificationRead,
    markAllNotificationsRead,
  } = useContext(MovieContext);

  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  // Admin should not see user movie notifications
  if (!user || user.role !== "user") {
    return null;
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const handleNotificationClick = async (notification) => {
    const success = await markNotificationRead(
      notification._id
    );

    if (!success) return;

    setIsOpen(false);

    // Deleted movies should not open a details page
    if (notification.type === "movie:deleted") return;

    // Change this path if your movie details route differs
    navigate(`/movie/${notification.movieId}`);
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);

    try {
      await markAllNotificationsRead();
    } finally {
      setMarkingAll(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "movie:created":
        return "🟢";
      case "movie:updated":
        return "🔵";
      case "movie:deleted":
        return "🔴";
      default:
        return "🔔";
    }
  };

  const getNotificationLabel = (type) => {
    switch (type) {
      case "movie:created":
        return "Movie Added";
      case "movie:updated":
        return "Movie Updated";
      case "movie:deleted":
        return "Movie Deleted";
      default:
        return "Notification";
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl text-[#b89236] transition hover:bg-[#d1b36b] hover:text-white"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-[100] w-80 max-w-[90vw] overflow-hidden rounded-xl border border-slate-600 bg-[#172033] text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-600 p-4">
            <h3 className="font-bold text-[#d1b36b]">
              Notifications
            </h3>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
              >
                {markingAll
                  ? "Updating..."
                  : "Mark all as read"}
              </button>
            )}
          </div>

          {notificationError && (
            <p className="px-4 py-2 text-xs text-red-400">
              {notificationError}
            </p>
          )}

          <div className="max-h-80 overflow-y-auto">
            {notificationsLoading ? (
              <p className="p-6 text-center text-sm text-gray-400">
                Loading notifications...
              </p>
            ) : notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-400">
                No notifications yet
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification._id}
                  onClick={() =>
                    handleNotificationClick(notification)
                  }
                  className={`block w-full border-b border-slate-700 p-4 text-left transition hover:bg-slate-700/60 ${
                    !notification.isRead
                      ? "bg-slate-700/40"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">
                      {getNotificationIcon(
                        notification.type
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        {notification.message}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {getNotificationLabel(
                          notification.type
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>

                    {!notification.isRead && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;