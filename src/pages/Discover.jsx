import { useState, useEffect } from "react";
import { searchMovies, discoverMovies, getTrending, getGenres } from "../services/api";
import MovieCard from "../components/movie/MovieCard";
import PosterWall from "../components/discover/PosterWall";
import FilterBar from "../components/discover/FilterBar";

const shuffled = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const EMPTY_FILTERS = {
  genres: [],
  decade: null,
  minRating: 0,
  sortBy: "popularity.desc",
};

function Discover() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [page, setPage] = useState(1);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [shuffling, setShuffling] = useState(false);
  const [wallPosters, setWallPosters] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // the wall and the genre list never change; fetched once, not per search
  useEffect(() => {
    const load = async () => {
      const [trending, genreList] = await Promise.all([getTrending("week", 3), getGenres()]);
      setWallPosters(trending.filter((m) => m.poster_path).map((m) => m.poster_path));
      setGenres(genreList);
    };
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);

      const decadeFrom = filters.decade;
      const decadeTo = filters.decade ? filters.decade + 9 : null;

      if (submitted) {
        const found = await searchMovies(submitted);
        if (cancelled) return;

        const narrowed = found.filter((movie) => {
          if (filters.genres.length > 0) {
            const ids = movie.genre_ids || [];
            if (!filters.genres.some((id) => ids.includes(id))) return false;
          }
          if (filters.minRating > 0 && (movie.vote_average || 0) < filters.minRating) {
            return false;
          }
          if (decadeFrom) {
            const year = movie.release_date ? Number(movie.release_date.slice(0, 4)) : null;
            if (!year || year < decadeFrom || year > decadeTo) return false;
          }
          return true;
        });

        setMovies(shuffleKey > 0 ? shuffled(narrowed) : narrowed);
        setTotal(narrowed.length);
        setTotalPages(1);
      } else {
        const { results, total: count, totalPages: pages } = await discoverMovies({
          genres: filters.genres,
          yearFrom: decadeFrom,
          yearTo: decadeTo,
          minRating: filters.minRating,
          sortBy: filters.sortBy,
          page,
        });
        if (cancelled) return;

        setMovies(shuffleKey > 0 ? shuffled(results) : results);
        setTotal(count);
        setTotalPages(pages);
      }

      setLoading(false);
      setShuffling(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [submitted, filters, page, shuffleKey]);

  // any new question starts from the top of the results, unshuffled
  const restart = () => {
    setPage(1);
    setShuffleKey(0);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    restart();
    setSubmitted(query.trim());
  };

  const clearSearch = () => {
    setQuery("");
    setSubmitted("");
    restart();
  };

  const changeFilters = (next) => {
    restart();
    setFilters(next);
  };

  const handleShuffle = () => {
    setShuffling(true);
    setShuffleKey((key) => key + 1);
    if (!submitted && totalPages > 1) {
      setPage(1 + Math.floor(Math.random() * totalPages));
    }
  };

  const heading = submitted
    ? `Results for “${submitted}”`
    : filters.genres.length > 0 || filters.decade || filters.minRating > 0
      ? "Filtered catalogue"
      : "Popular right now";

  return (
    <div className="min-h-screen bg-[#141414]">
      
      <section className="relative flex min-h-[32rem] items-center overflow-hidden pt-24">
        <PosterWall posters={wallPosters} />

        <div className="absolute inset-0 bg-[#0d0d0d]/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/90 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#141414] to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#E50914]">
              The whole catalogue
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Find the one
              <br />
              you haven&apos;t seen
            </h1>

            <p className="mt-5 text-sm leading-relaxed text-neutral-400 sm:text-base">
              Search by title, or narrow the whole of TMDB by genre, decade and score
              until something you have never heard of turns up.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex gap-2">
              <div className="relative flex-1">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search a title…"
                  aria-label="Search for a film by title"
                  className="w-full border border-white/20 bg-black/60 px-4 py-3 pr-10 text-white placeholder-neutral-500 outline-none backdrop-blur transition-colors focus:border-[#E50914]"
                />

                {query && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear the search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-500 transition-colors hover:text-white"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="bg-[#E50914] px-7 py-3 font-semibold text-white transition duration-200 hover:scale-105 hover:bg-[#f6121d]"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <FilterBar
        value={filters}
        onChange={changeFilters}
        genres={genres}
        searching={Boolean(submitted)}
        resultCount={total}
        onClear={() => changeFilters(EMPTY_FILTERS)}
        onShuffle={handleShuffle}
        shuffling={shuffling}
      />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-bold text-white">{heading}</h2>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((unused, index) => (
              <div key={index} className="decoded-skeleton aspect-[2/3] w-full rounded-md" />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-neutral-400">Nothing matches all of that.</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
              {submitted
                ? "Try a shorter title, or clear the filters — a search this narrow can rule out the film you are after."
                : "Loosen one of the filters: a high score combined with a single decade and a narrow genre leaves very little standing."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Discover;
