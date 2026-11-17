
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function AddMovie() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    image: "",
    rating: "",
    genre: "",
    year: "",
    language: "",
    type: "movie",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem("filmfiesta-token");

      if (!token) {
        throw new Error("Please login as admin first.");
      }

      const movieData = {
        ...formData,
        id: Number(formData.id),
        rating: formData.rating === ""
          ? 0
          : Number(formData.rating),
        year: Number(formData.year),
      };

      const response = await fetch(`${API_URL}/api/movies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(movieData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to add movie"
        );
      }

      alert("Movie added successfully!");
      window.location.assign("/admin");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-600 bg-[#111827] " +
    "px-4 py-3 text-white outline-none focus:border-[#d1b36b]";

  return (
    <div className="min-h-screen bg-[#111827] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">

        <Link
          to="/admin"
          className="mb-6 inline-block text-[#d1b36b] hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <div className="rounded-xl bg-[#1f2937] p-6 shadow-lg md:p-10">

          <h1 className="mb-2 text-3xl font-bold text-[#d1b36b]">
            Add New Movie
          </h1>

          <p className="mb-8 text-gray-400">
            Enter movie details to add it to FilmFiesta.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-500 bg-red-900/30 p-4 text-red-300"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              <div>
                <label htmlFor="movie-id" className="mb-2 block">
                  Movie ID
                </label>
                <input
                  id="movie-id"
                  type="number"
                  name="id"
                  min="1"
                  step="1"
                  required
                  value={formData.id}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter unique movie ID"
                />
              </div>

              <div>
                <label htmlFor="movie-title" className="mb-2 block">
                  Movie Title
                </label>
                <input
                  id="movie-title"
                  type="text"
                  name="title"
                  minLength="2"
                  maxLength="150"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter movie title"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="movie-image" className="mb-2 block">
                  Poster Image URL
                </label>
                <input
                  id="movie-image"
                  type="url"
                  name="image"
                  required
                  value={formData.image}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://example.com/poster.jpg"
                />
              </div>

              <div>
                <label htmlFor="movie-rating" className="mb-2 block">
                  Rating (0–10)
                </label>
                <input
                  id="movie-rating"
                  type="number"
                  name="rating"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="8.5"
                />
              </div>

              <div>
                <label htmlFor="movie-genre" className="mb-2 block">
                  Genre
                </label>
                <input
                  id="movie-genre"
                  type="text"
                  name="genre"
                  required
                  value={formData.genre}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Action, Drama, Sci-Fi"
                />
              </div>

              <div>
                <label htmlFor="movie-year" className="mb-2 block">
                  Release Year
                </label>
                <input
                  id="movie-year"
                  type="number"
                  name="year"
                  min="1888"
                  max="2100"
                  step="1"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="2026"
                />
              </div>

              <div>
                <label htmlFor="movie-language" className="mb-2 block">
                  Language
                </label>
                <input
                  id="movie-language"
                  type="text"
                  name="language"
                  required
                  value={formData.language}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="English, Hindi"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="movie-type" className="mb-2 block">
                  Movie Type
                </label>
                <select
                  id="movie-type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="movie">Movie</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>

            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[#b89236] px-8 py-3 font-semibold text-white transition hover:bg-[#d1b36b] disabled:opacity-50"
              >
                {loading ? "Adding Movie..." : "+ Add Movie"}
              </button>

              <Link
                to="/admin"
                className="rounded-lg border border-gray-600 px-8 py-3 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddMovie;
