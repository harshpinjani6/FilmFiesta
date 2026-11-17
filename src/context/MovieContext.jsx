
import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { socket } from "../socket";
import { useAuth } from "./AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export const MovieContext = createContext({
  movies: [],
  favorites: [],
  search: "",
  setSearch: () => {},
  toggleFavorite: () => {},
  isFavorite: () => false,
  darkMode: true,
  toggleDarkMode: () => {},
  loading: true,
  error: "",
  notifications: [],
  notificationsLoading: false,
  notificationError: "",
  markNotificationRead: async () => {},
  markAllNotificationsRead: async () => {},
  favoritesReady: false,
  favoritesError: "",
  favoriteBusyIds: [],
});

export function MovieProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id || user?._id || null;
  const isNormalUser = user?.role === "user";

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] =
    useState(false);
  const [notificationError, setNotificationError] =
    useState("");

  const [favorites, setFavorites] = useState([]);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [favoritesError, setFavoritesError] = useState("");
  const [favoriteBusyIds, setFavoriteBusyIds] = useState([]);

  const [search, setSearch] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("filmfiesta-theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/movies`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch movies (${response.status})`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid movies API response");
        }

        setMovies(data);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Unable to load movies. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Load saved notifications from MongoDB
  useEffect(() => {
    if (authLoading) return;

    if (!isNormalUser || !userId) {
      setNotifications([]);
      setNotificationError("");
      setNotificationsLoading(false);
      return;
    }

    const controller = new AbortController();
    const token = sessionStorage.getItem("filmfiesta-token");

    const fetchNotifications = async () => {
      setNotifications([]);
      setNotificationsLoading(true);
      setNotificationError("");

      try {
        const response = await fetch(
          `${API_URL}/api/notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch notifications (${response.status})`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid notification response");
        }

        if (!controller.signal.aborted) {
          setNotifications((previous) => {
            const byId = new Map();

            for (const item of [...previous, ...data]) {
              byId.set(String(item._id), item);
            }

            return [...byId.values()].sort(
              (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
            );
          });
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setNotificationError(
            "Unable to load notifications."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setNotificationsLoading(false);
        }
      }
    };

    if (token) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setNotificationsLoading(false);
      setNotificationError("Please log in again.");
    }

    return () => controller.abort();
  }, [userId, isNormalUser, authLoading]);

  const refreshMovies = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/movies`);

      if (!response.ok) {
        throw new Error("Failed to refresh movies");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid movies response");
      }

      setMovies(data);
    } catch (error) {
      console.error("Real-time movie refresh failed:", error);
    }
  }, []);

  // Authenticated Socket.IO notifications
  useEffect(() => {
    if (authLoading || !isNormalUser || !userId) {
      socket.disconnect();
      return;
    }

    const token = sessionStorage.getItem("filmfiesta-token");

    if (!token) {
      socket.disconnect();
      return;
    }

    socket.auth = { token };

    const handleConnect = () => {
      console.log("Notification socket connected:", socket.id);
    };

    const handleConnectError = (err) => {
      console.error("Notification socket error:", err.message);
    };

    const handleMovieEvent = (data) => {
      if (!data?._id) return;

      // Add new notification without duplicates
      setNotifications((previous) => {
        if (
          previous.some(
            (item) => String(item._id) === String(data._id)
          )
        ) {
          return previous;
        }

        return [data, ...previous]
          .sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          )
          .slice(0, 100);
      });

      // Fetch latest movie list automatically
      refreshMovies();
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("movie:created", handleMovieEvent);
    socket.on("movie:updated", handleMovieEvent);
    socket.on("movie:deleted", handleMovieEvent);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("movie:created", handleMovieEvent);
      socket.off("movie:updated", handleMovieEvent);
      socket.off("movie:deleted", handleMovieEvent);
      socket.disconnect();
    };
  }, [userId, isNormalUser, authLoading, refreshMovies]);

  // Mark one notification as read in MongoDB
  const markNotificationRead = useCallback(
    async (notificationId) => {
      if (!isNormalUser) return false;

      const token = sessionStorage.getItem("filmfiesta-token");
      if (!token) return false;

      try {
        const response = await fetch(
          `${API_URL}/api/notifications/${notificationId}/read`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to mark notification read");
        }

        setNotifications((previous) =>
          previous.map((item) =>
            String(item._id) === String(notificationId)
              ? { ...item, isRead: true }
              : item
          )
        );

        return true;
      } catch (err) {
        console.error(err);
        setNotificationError(
          "Unable to update notification."
        );
        return false;
      }
    },
    [isNormalUser]
  );

  // Mark all unread notifications as read
  const markAllNotificationsRead = useCallback(async () => {
    const unread = notifications.filter(
      (item) => !item.isRead
    );

    const results = await Promise.all(
      unread.map((item) => markNotificationRead(item._id))
    );

    return results.every(Boolean);
  }, [notifications, markNotificationRead]);

  // Load favorites from MongoDB for logged-in users
  useEffect(() => {
    if (authLoading) return;

    const controller = new AbortController();
    setFavoritesReady(false);
    setFavoritesError("");
    setFavorites([]);

    if (!isNormalUser || !userId) {
      // Guest favorites stay local.
      // Admin does not use normal-user favorites.
      if (!userId) {
        try {
          const saved = localStorage.getItem(
            "filmfiesta-favorites-guest"
          );
          setFavorites(saved ? JSON.parse(saved) : []);
        } catch {
          setFavorites([]);
        }
      }

      setFavoritesReady(true);
      return;
    }

    const token = sessionStorage.getItem("filmfiesta-token");

    if (!token) {
      setFavoritesError("Please log in again.");
      return;
    }

    const loadFavorites = async () => {
      try {
        const response = await fetch(`${API_URL}/api/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }

        const records = await response.json();

        if (!Array.isArray(records)) {
          throw new Error("Invalid favorites response");
        }

        const movieIds = new Set(
          records.map((record) => String(record.movieId))
        );

        setFavorites(
          movies.filter((movie) => movieIds.has(String(movie.id)))
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
          setFavoritesError("Unable to load favorites.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setFavoritesReady(true);
        }
      }
    };

    loadFavorites();

    return () => controller.abort();
  }, [userId, isNormalUser, authLoading, movies]);

  // Save only guest favorites to localStorage
  useEffect(() => {
    if (authLoading || !favoritesReady || userId) return;

    localStorage.setItem(
      "filmfiesta-favorites-guest",
      JSON.stringify(favorites)
    );
  }, [favorites, userId, authLoading, favoritesReady]);

  // Save theme
  useEffect(() => {
    localStorage.setItem(
      "filmfiesta-theme",
      darkMode ? "dark" : "light"
    );

    document.body.classList.toggle(
      "light-mode",
      !darkMode
    );
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((current) => !current);
  }, []);

  const toggleFavorite = useCallback(
    async (movie) => {
      const movieId = Number(movie.id);

      if (!Number.isInteger(movieId) || movieId <= 0) {
        return false;
      }

      if (!favoritesReady) return false;

      if (!isNormalUser) {
        if (userId) return false;

        setFavorites((current) => {
          const exists = current.some(
            (item) => String(item.id) === String(movieId)
          );

          return exists
            ? current.filter(
                (item) => String(item.id) !== String(movieId)
              )
            : [...current, movie];
        });

        return true;
      }

      if (favoriteBusyIds.includes(movieId)) return false;

      const token = sessionStorage.getItem("filmfiesta-token");
      if (!token) return false;

      const exists = favorites.some(
        (item) => String(item.id) === String(movieId)
      );

      setFavoriteBusyIds((current) => [...current, movieId]);
      setFavoritesError("");

      try {
        const response = await fetch(
          `${API_URL}/api/favorites/${movieId}`,
          {
            method: exists ? "DELETE" : "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update favorite");
        }

        setFavorites((current) =>
          exists
            ? current.filter(
                (item) => String(item.id) !== String(movieId)
              )
            : current.some(
                  (item) => String(item.id) === String(movieId)
                )
              ? current
              : [...current, movie]
        );

        return true;
      } catch (error) {
        console.error(error);
        setFavoritesError("Unable to update favorite.");
        return false;
      } finally {
        setFavoriteBusyIds((current) =>
          current.filter((id) => id !== movieId)
        );
      }
    },
    [
      favorites,
      favoritesReady,
      favoriteBusyIds,
      isNormalUser,
      userId,
    ]
  );

  const isFavorite = useCallback(
    (movieId) =>
      favorites.some(
        (movie) =>
          String(movie.id) === String(movieId)
      ),
    [favorites]
  );

  return (
    <MovieContext.Provider
      value={{
        movies,
        favorites,
        search,
        setSearch,
        toggleFavorite,
        isFavorite,
        darkMode,
        toggleDarkMode,
        loading,
        error,
        notifications,
        notificationsLoading,
        notificationError,
        markNotificationRead,
        markAllNotificationsRead,
        favoritesReady,
        favoritesError,
        favoriteBusyIds,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
}