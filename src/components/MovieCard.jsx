
import { useContext } from "react";
import { Link } from "react-router-dom";
import { MovieContext } from "../context/MovieContext";

function MovieCard({ movie }) {
  const { toggleFavorite, isFavorite } = useContext(MovieContext);

  const liked = isFavorite(movie.id);

  return (
    <div className="group flex h-full min-w-0 w-full flex-col overflow-hidden rounded-xl bg-[#1f2937] shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">

      {/* Movie Poster */}
      <Link to={`/movie/${movie.id}`} className="block w-full">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#111827]">

          <img
            src={movie.image}
            alt={movie.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          {/* Rating */}
          <div className="absolute right-2 top-2 rounded-md bg-black/75 px-2 py-1 text-xs font-semibold text-white">
            ⭐ {movie.rating}
          </div>

          {/* Genre */}
          <div className="absolute left-2 top-2 max-w-[55%] truncate rounded-md bg-[#b89236] px-2 py-1 text-xs font-semibold text-white">
            {movie.genre}
          </div>

        </div>
      </Link>

      {/* Movie Information */}
      <div className="flex flex-1 flex-col p-4">

        {/* Movie Title */}
        <Link to={`/movie/${movie.id}`}>
          <h3
            className="min-h-14 overflow-hidden text-lg font-bold leading-7 text-white transition hover:text-[#d1b36b]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {movie.title}
          </h3>
        </Link>

        {/* Movie Metadata */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
          <span>{movie.year}</span>
          <span>•</span>
          <span>{movie.language}</span>
          <span>•</span>
          <span>{movie.genre}</span>
        </div>

        {/* Buttons */}
        <div className="mt-auto flex gap-2 pt-4">

          <Link
            to={`/movie/${movie.id}`}
            className="flex min-w-0 flex-1 items-center justify-center rounded-md bg-[#b89236] px-2 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#d1b36b]"
          >
            View Details
          </Link>

          <button
            type="button"
            onClick={() => toggleFavorite(movie)}
            aria-label={
              liked
                ? `Remove ${movie.title} from favorites`
                : `Add ${movie.title} to favorites`
            }
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-xl transition hover:bg-gray-200 ${
              liked ? "text-red-500" : "text-black"
            }`}
          >
            {liked ? "♥" : "♡"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default MovieCard;