
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function EditMovie() {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    image: "",
    rating: "",
    genre: "",
    year: "",
    language: "",
    type: "movie",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing movie details
  useEffect(() => {
    const controller = new AbortController();

    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/movies/${id}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Movie not found"
          );
        }

        setFormData({
          title: data.title || "",
          image: data.image || "",
          rating: data.rating ?? "",
          genre: data.genre || "",
          year: data.year ?? "",
          language: data.language || "",
          type: data.type || "movie",
        });

      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchMovie();

    return () => controller.abort();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update movie
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const token = sessionStorage.getItem(
        "filmfiesta-token"
      );

      if (!token) {
        throw new Error(
          "Please login as admin first."
        );
      }

      const updatedMovie = {
        ...formData,
        rating: formData.rating === ""
          ? 0
          : Number(formData.rating),
        year: Number(formData.year),
      };

      const response = await fetch(
        `${API_URL}/api/movies/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedMovie),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          "Failed to update movie"
        );
      }

      alert("Movie updated successfully!");

      // Reload dashboard to fetch updated movies
      window.location.assign("/admin");

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-600 " +
    "bg-[#111827] px-4 py-3 text-white " +
    "outline-none focus:border-[#d1b36b]";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] p-10 text-center text-white">
        Loading movie details...
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-[#111827] p-10 text-center text-red-400">
        <p>{error}</p>
        <Link
          to="/admin"
          className="mt-4 inline-block text-[#d1b36b]"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

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
            Edit Movie
          </h1>

          <p className="mb-8 text-gray-400">
            Update existing movie details.
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

              {/* Movie ID - Read Only */}
              <div>
                <label className="mb-2 block">
                  Movie ID
                </label>
                <input
                  type="text"
                  value={id}
                  disabled
                  className={`${inputClass} cursor-not-allowed opacity-60`}
                />
              </div>

              {/* Movie Title */}
              <div>
                <label htmlFor="edit-title" className="mb-2 block">
                  Movie Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  name="title"
                  required
                  minLength="2"
                  maxLength="150"
                  value={formData.title}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Poster URL */}
              <div className="md:col-span-2">
                <label htmlFor="edit-image" className="mb-2 block">
                  Poster Image URL
                </label>
                <input
                  id="edit-image"
                  type="url"
                  name="image"
                  required
                  value={formData.image}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Poster Preview */}
              {formData.image && (
                <div className="md:col-span-2">
                  <p className="mb-2 text-gray-400">
                    Current Poster Preview
                  </p>
                  <img
                    src={formData.image}
                    alt={formData.title}
                    className="h-40 w-28 rounded-lg object-cover"
                  />
                </div>
              )}

              {/* Rating */}
              <div>
                <label htmlFor="edit-rating" className="mb-2 block">
                  Rating (0–10)
                </label>
                <input
                  id="edit-rating"
                  type="number"
                  name="rating"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Genre */}
              <div>
                <label htmlFor="edit-genre" className="mb-2 block">
                  Genre
                </label>
                <input
                  id="edit-genre"
                  type="text"
                  name="genre"
                  required
                  value={formData.genre}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Year */}
              <div>
                <label htmlFor="edit-year" className="mb-2 block">
                  Release Year
                </label>
                <input
                  id="edit-year"
                  type="number"
                  name="year"
                  min="1888"
                  max="2100"
                  step="1"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Language */}
              <div>
                <label htmlFor="edit-language" className="mb-2 block">
                  Language
                </label>
                <input
                  id="edit-language"
                  type="text"
                  name="language"
                  required
                  value={formData.language}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Movie Type */}
              <div className="md:col-span-2">
                <label htmlFor="edit-type" className="mb-2 block">
                  Movie Type
                </label>
                <select
                  id="edit-type"
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
                disabled={saving}
                className="rounded-lg bg-[#b89236] px-8 py-3 font-semibold text-white hover:bg-[#d1b36b] disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Movie"}
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

export default EditMovie;
