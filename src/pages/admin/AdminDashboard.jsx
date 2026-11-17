
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MovieContext } from "../../context/MovieContext";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:5000"
).replace(/\/+$/, "");

const PIE_COLORS = ["#d1b36b", "#3b82f6"];

function AdminDashboard() {
  const { movies, loading, error } = useContext(MovieContext);

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Analytics states
  const [analytics, setAnalytics] = useState(null);
  const [topMovies, setTopMovies] = useState(null);
  const [dailyViews, setDailyViews] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  // Fetch all analytics from MongoDB
  useEffect(() => {
    const controller = new AbortController();

    const fetchAnalytics = async () => {
      const token = sessionStorage.getItem("filmfiesta-token");

      if (!token) {
        setAnalyticsError("Admin login required.");
        setAnalyticsLoading(false);
        return;
      }

      setAnalyticsLoading(true);
      setAnalyticsError("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const endpoints = [
          "/api/analytics/overview",
          "/api/analytics/top-movies",
          "/api/analytics/daily-views",
        ];

        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(`${API_URL}${endpoint}`, {
              headers,
              signal: controller.signal,
            })
          )
        );

        if (responses.some((response) => !response.ok)) {
          throw new Error("Failed to load admin analytics.");
        }

        const [
          overviewData,
          topMoviesData,
          dailyViewsData,
        ] = await Promise.all(
          responses.map((response) => response.json())
        );

        if (!controller.signal.aborted) {
          setAnalytics(overviewData);
          setTopMovies(topMoviesData);
          setDailyViews(dailyViewsData.dailyViews || []);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Analytics fetch error:", err);
          setAnalyticsError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setAnalyticsLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => controller.abort();
  }, []);

  // Existing dashboard statistics
  const totalMovies = movies.length;

  const upcomingMovies = movies.filter(
    (movie) => movie.type === "upcoming"
  ).length;

  const totalGenres = new Set(
    movies.map((movie) => movie.genre).filter(Boolean)
  ).size;

  // Search movies
  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  // Delete movie
  const handleDelete = async (movie) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${movie.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    const token = sessionStorage.getItem("filmfiesta-token");

    if (!token) {
      alert("Please login as admin first.");
      return;
    }

    try {
      setDeletingId(movie.id);

      const response = await fetch(
        `${API_URL}/api/movies/${movie.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to delete movie"
        );
      }

      alert(`"${movie.title}" deleted successfully!`);
      window.location.reload();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Analytics cards
  const analyticsCards = analytics
    ? [
        ["👥 Total Users", analytics.stats.totalUsers],
        ["🎬 Total Movies", analytics.stats.totalMovies],
        ["👁️ Movie Views", analytics.stats.totalViews],
        ["❤️ Favorites", analytics.stats.totalFavorites],
        ["✅ Watched Movies", analytics.stats.totalWatched],
      ]
    : [];

  // Top movies sections
  const topMovieSections = topMovies
    ? [
        ["👁️ Most Viewed", topMovies.mostViewed],
        ["❤️ Most Favorited", topMovies.mostFavorited],
        ["🎬 Most Watched", topMovies.mostWatched],
      ]
    : [];

  // Bar chart data
  const viewsChartData = (topMovies?.mostViewed || [])
    .slice(0, 5)
    .map((movie) => ({
      name: movie.title,
      views: movie.count,
    }));

  // Pie chart data
  const engagementChartData = [
    {
      name: "Favorites",
      value: analytics?.stats?.totalFavorites || 0,
    },
    {
      name: "Watched",
      value: analytics?.stats?.totalWatched || 0,
    },
  ];

  // Line chart data
  const dailyViewsChartData = dailyViews.map((item) => ({
    date: item.date,
    views: item.views,
  }));

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "N/A"
      : parsedDate.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#111827] px-4 py-10 text-white md:px-10">

      {/* Dashboard Heading */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#d1b36b]">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-gray-400">
            Manage your FilmFiesta movie collection
          </p>
        </div>

        <Link
          to="/admin/add-movie"
          className="rounded-lg bg-[#b89236] px-5 py-3 font-semibold text-white transition hover:bg-[#d1b36b]"
        >
          + Add Movie
        </Link>
      </div>

      {/* Existing Statistics Cards */}
      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          ["Total Movies", totalMovies],
          ["Upcoming Movies", upcomingMovies],
          ["Total Genres", totalGenres],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl bg-[#1f2937] p-6 shadow-lg"
          >
            <h2 className="text-gray-400">{label}</h2>

            <p className="mt-3 text-3xl font-bold text-[#d1b36b]">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Admin Analytics */}
      <section className="mb-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#d1b36b]">
            📊 User Engagement Analytics
          </h2>

          <p className="mt-2 text-gray-400">
            Statistics from MongoDB
          </p>
        </div>

        {analyticsLoading ? (
          <div className="rounded-xl bg-[#1f2937] p-8 text-center text-gray-400">
            Loading analytics...
          </div>
        ) : analyticsError ? (
          <div className="rounded-xl border border-red-500 bg-[#1f2937] p-6 text-red-400">
            {analyticsError}
          </div>
        ) : analytics && topMovies ? (
          <>
            {/* Analytics Summary Cards */}
            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {analyticsCards.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl bg-[#1f2937] p-5 shadow-lg"
                >
                  <p className="text-sm text-gray-400">
                    {label}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-[#d1b36b]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Bar and Pie Charts */}
            <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

              {/* Most Viewed Bar Chart */}
              <div className="min-w-0 rounded-xl bg-[#1f2937] p-6 shadow-lg">
                <h3 className="mb-6 text-xl font-bold text-[#d1b36b]">
                  📊 Most Viewed Movies
                </h3>

                {viewsChartData.length > 0 ? (
                  <div className="h-80 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={viewsChartData}
                        margin={{
                          top: 10,
                          right: 10,
                          left: 0,
                          bottom: 45,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#374151"
                        />

                        <XAxis
                          dataKey="name"
                          stroke="#9ca3af"
                          tick={{ fontSize: 11 }}
                          angle={-25}
                          textAnchor="end"
                          interval={0}
                          tickFormatter={(name) =>
                            name.length > 12
                              ? `${name.slice(0, 12)}...`
                              : name
                          }
                        />

                        <YAxis
                          stroke="#9ca3af"
                          allowDecimals={false}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111827",
                            border: "1px solid #374151",
                            color: "#ffffff",
                          }}
                        />

                        <Bar
                          dataKey="views"
                          name="Views"
                          fill="#d1b36b"
                          radius={[5, 5, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-400">
                    No movie views recorded yet.
                  </p>
                )}
              </div>

              {/* Favorites vs Watched Pie Chart */}
              <div className="min-w-0 rounded-xl bg-[#1f2937] p-6 shadow-lg">
                <h3 className="mb-6 text-xl font-bold text-[#d1b36b]">
                  ❤️ Favorites vs Watched
                </h3>

                {engagementChartData.some(
                  (item) => item.value > 0
                ) ? (
                  <div className="h-80 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={engagementChartData}
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                          nameKey="name"
                          label
                        >
                          {engagementChartData.map(
                            (entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={PIE_COLORS[index]}
                              />
                            )
                          )}
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111827",
                            border: "1px solid #374151",
                            color: "#ffffff",
                          }}
                        />

                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-400">
                    No favorites or watched movies recorded yet.
                  </p>
                )}
              </div>
            </div>

            {/* Daily Movie Views Line Chart */}
            <div className="mb-8 min-w-0 rounded-xl bg-[#1f2937] p-6 shadow-lg">
              <h3 className="mb-2 text-xl font-bold text-[#d1b36b]">
                📈 Daily Movie Views
              </h3>

              <p className="mb-6 text-sm text-gray-400">
                Movie views recorded over the last 7 days (UTC)
              </p>

              {dailyViewsChartData.length > 0 ? (
                <div className="h-80 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyViewsChartData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                      />

                      <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) =>
                          value.slice(5)
                        }
                      />

                      <YAxis
                        stroke="#9ca3af"
                        allowDecimals={false}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111827",
                          border: "1px solid #374151",
                          color: "#ffffff",
                        }}
                      />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="views"
                        name="Daily Views"
                        stroke="#d1b36b"
                        strokeWidth={3}
                        dot={{
                          r: 5,
                          fill: "#d1b36b",
                        }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-400">
                  No daily views data available.
                </p>
              )}
            </div>

            {/* Top Performing Movies */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {topMovieSections.map(([title, items]) => (
                <div
                  key={title}
                  className="min-w-0 rounded-xl bg-[#1f2937] p-6 shadow-lg"
                >
                  <h3 className="mb-5 text-xl font-bold text-[#d1b36b]">
                    {title}
                  </h3>

                  {items?.length > 0 ? (
                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div
                          key={String(item.movieId)}
                          className="flex items-center gap-3 border-b border-gray-700 pb-3"
                        >
                          <span className="w-5 text-sm text-gray-400">
                            {index + 1}.
                          </span>

                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-14 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-10 items-center justify-center rounded bg-gray-700">
                              🎬
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">
                              {item.title}
                            </p>

                            <p className="text-sm text-gray-400">
                              {item.count} total
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">
                      No activity recorded yet.
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Recent User Activities */}
            <div className="rounded-xl bg-[#1f2937] p-6 shadow-lg">
              <h3 className="mb-5 text-xl font-bold text-[#d1b36b]">
                🕒 Recent User Activities
              </h3>

              {analytics.recentActivities?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left">
                    <thead>
                      <tr className="border-b border-gray-600 text-[#d1b36b]">
                        <th className="p-3">User</th>
                        <th className="p-3">Movie ID</th>
                        <th className="p-3">Activity</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {analytics.recentActivities.map(
                        (activity) => (
                          <tr
                            key={activity._id}
                            className="border-b border-gray-700 hover:bg-[#374151]"
                          >
                            <td className="p-3">
                              {activity.userId?.name ||
                                "Deleted User"}
                            </td>

                            <td className="p-3">
                              {activity.movieId ?? "N/A"}
                            </td>

                            <td className="p-3 capitalize">
                              {(activity.action || "unknown")
                                .replaceAll("_", " ")}
                            </td>

                            <td className="p-3 text-sm text-gray-400">
                              {formatDate(activity.createdAt)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400">
                  No recent activities.
                </p>
              )}
            </div>
          </>
        ) : null}
      </section>

      {/* Manage Movies Section */}
      <div className="rounded-xl bg-[#1f2937] p-5 shadow-lg md:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#d1b36b]">
            Manage Movies
          </h2>

          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-[#111827] px-4 py-2 text-white outline-none focus:border-[#d1b36b] sm:w-72"
          />
        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-400">
            Loading movies...
          </p>
        ) : error ? (
          <p className="py-10 text-center text-red-400">
            {error}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-gray-600 text-[#d1b36b]">
                  <th className="p-4">Poster</th>
                  <th className="p-4">Movie Title</th>
                  <th className="p-4">Genre</th>
                  <th className="p-4">Year</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredMovies.map((movie) => (
                  <tr
                    key={movie._id || movie.id}
                    className="border-b border-gray-700 hover:bg-[#374151]"
                  >
                    <td className="p-4">
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className="h-16 w-12 rounded object-cover"
                      />
                    </td>

                    <td className="p-4 font-semibold">
                      {movie.title}
                    </td>

                    <td className="p-4">
                      {movie.genre}
                    </td>

                    <td className="p-4">
                      {movie.year}
                    </td>

                    <td className="p-4">
                      ⭐ {movie.rating}
                    </td>

                    <td className="p-4">
                      <div className="flex gap-3">
                        <Link
                          to={`/admin/edit-movie/${movie.id}`}
                          className="rounded-md bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(movie)}
                          disabled={deletingId !== null}
                          className="rounded-md bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === movie.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMovies.length === 0 && (
              <p className="py-8 text-center text-gray-400">
                No movies found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;