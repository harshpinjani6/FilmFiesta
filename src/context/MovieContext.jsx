
import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { socket } from "../socket";
import { useAuth } from "./AuthContext";

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
});

export function MovieProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id || user?._id || null;

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);

  const [favorites, setFavorites] = useState([]);
  const [favoritesReady, setFavoritesReady] = useState(false);

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

        const API_URL = (
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        ).replace(/\/+$/, "");

        const response = await fetch(`${API_URL}/api/movies`);

        if (!response.ok) {
          throw new Error(`Failed to fetch movies (${response.status})`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid movies API response");
        }

        setMovies(data);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setError("Unable to load movies. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Socket.IO
  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
    };

    const handleMovieEvent = (type) => (data) => {
      setNotifications((prev) => [
        {
          ...data,
          id: Date.now() + Math.random(),
          type,
          read: false,
        },
        ...prev,
      ]);
    };

    const created = handleMovieEvent("created");
    const updated = handleMovieEvent("updated");
    const deleted = handleMovieEvent("deleted");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("movie:created", created);
    socket.on("movie:updated", updated);
    socket.on("movie:deleted", deleted);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("movie:created", created);
      socket.off("movie:updated", updated);
      socket.off("movie:deleted", deleted);
      socket.disconnect();
    };
  }, []);

  // Load favorites belonging to the current user
  useEffect(() => {
    if (authLoading) return;

    setFavoritesReady(false);

    const storageKey = userId
      ? `filmfiesta-favorites-${userId}`
      : "filmfiesta-favorites-guest";

    try {
      const saved = localStorage.getItem(storageKey);
      setFavorites(saved ? JSON.parse(saved) : []);
    } catch {
      setFavorites([]);
    }

    setFavoritesReady(true);
  }, [userId, authLoading]);

  // Save favorites for the current user
  useEffect(() => {
    if (authLoading || !favoritesReady) return;

    const storageKey = userId
      ? `filmfiesta-favorites-${userId}`
      : "filmfiesta-favorites-guest";

    localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, userId, authLoading, favoritesReady]);

  // Save theme
  useEffect(() => {
    localStorage.setItem(
      "filmfiesta-theme",
      darkMode ? "dark" : "light"
    );

    document.body.classList.toggle("light-mode", !darkMode);
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((current) => !current);
  }, []);

  const toggleFavorite = useCallback((movie) => {
    setFavorites((current) => {
      const exists = current.some(
        (item) => String(item.id) === String(movie.id)
      );

      return exists
        ? current.filter(
            (item) => String(item.id) !== String(movie.id)
          )
        : [...current, movie];
    });
  }, []);

  const isFavorite = useCallback(
    (movieId) =>
      favorites.some(
        (movie) => String(movie.id) === String(movieId)
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
        setNotifications,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
}