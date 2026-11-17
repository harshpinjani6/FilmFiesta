
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useContext } from "react";
import { MovieContext } from "../context/MovieContext";
import Footer from "../components/Footer";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function WatchHistory() {
  const { user, loading: authLoading } = useAuth();
  const { movies } = useContext(MovieContext);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (user?.role !== "user") {
      setHistory([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const token = sessionStorage.getItem("filmfiesta-token");

    const fetchHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/api/watched`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch watch history");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid history response");
        }

        if (!controller.signal.aborted) {
          setHistory(data);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Unable to load watch history.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => controller.abort();
  }, [user?.id, user?._id, user?.role, authLoading]);

  const watchedMovies = history.map((record) => ({
    ...record,
    movie: movies.find(
      (movie) => Number(movie.id) === Number(record.movieId)
    ),
  }));

  return (
    <>
      <main className="min-h-screen bg-[#111827] px-5 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">🎬 Watch History</h1>
          <p className="mt-2 text-gray-400">
            Movies you have marked as watched.
          </p>

          {loading ? (
            <p className="mt-10 text-gray-400">
              Loading watch history...
            </p>
          ) : user?.role !== "user" ? (
            <p className="mt-10 text-gray-400">
              Please log in as a user to view your history.
            </p>
          ) : error ? (
            <p className="mt-10 text-red-400">{error}</p>
          ) : watchedMovies.length === 0 ? (
            <p className="mt-10 text-gray-400">
              No watched movies yet.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
              {watchedMovies.map(({ _id, movie, movieId, watchedAt }) => (
                <div
                  key={_id}
                  className="overflow-hidden rounded-xl bg-[#1f2937]"
                >
                  {movie ? (
                    <Link to={`/movie/${movie.id}`}>
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className="h-64 w-full object-cover"
                      />
                    </Link>
                  ) : (
                    <div className="flex h-64 items-center justify-center bg-gray-700 text-gray-300">
                      Movie unavailable
                    </div>
                  )}

                  <div className="p-4">
                    <h2 className="font-semibold">
                      {movie?.title || `Movie #${movieId}`}
                    </h2>

                    <p className="mt-2 text-sm text-gray-400">
                      Watched:{" "}
                      {new Date(watchedAt).toLocaleDateString()}
                    </p>

                    {movie && (
                      <Link
                        to={`/movie/${movie.id}`}
                        className="mt-3 inline-block text-sm text-[#d1b36b]"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default WatchHistory;