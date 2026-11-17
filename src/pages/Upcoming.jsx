
import { useContext, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import { useMovieSearch } from "../hooks/useMovieSearch";
import { MovieContext } from "../context/MovieContext";

function Upcoming() {
  const { movies } = useContext(MovieContext);

  const upcomingMovies = movies.filter(
    (movie) => movie.type === "upcoming"
  );

  const filteredMovies = useMovieSearch(upcomingMovies);

  useEffect(() => {
    document.title = "Upcoming Movies - FilmFiesta";
  }, []);

  return (
    <main className="min-h-screen w-full bg-[#111827] px-4 py-10 sm:px-6 lg:px-8">

      <div className="mx-auto w-full max-w-7xl">

        {/* Page Heading */}
        <p className="text-xs font-bold tracking-[3px] text-[#d1b36b]">
          FILMFiesta
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
          Upcoming Movies
        </h1>

        <p className="mt-3 text-gray-400">
          Movies coming soon.
        </p>

        {/* Upcoming Movie Cards */}
        {filteredMovies.length > 0 ? (

          <div className="mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
              />
            ))}

          </div>

        ) : (

          <div className="mt-10 rounded-2xl bg-[#1f2937] p-10 text-center">

            <p className="text-4xl">
              🎬
            </p>

            <h2 className="mt-4 text-xl font-bold text-white">
              No movies found
            </h2>

            <p className="mt-2 text-gray-400">
              Try searching for another movie.
            </p>

          </div>

        )}

      </div>
    </main>
  );
}

export default Upcoming;