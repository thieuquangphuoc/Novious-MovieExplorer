import { useState, useEffect, useRef } from "react";
import { getMoviesWithTrailers } from "../services/api";
import TrailerModal from "./TrailerModal";

const BACKDROP_BASE = "https://image.tmdb.org/t/p/w780";

/*
 * TMDB has no "for rent" or "on TV" list for films, so the tabs are the
 * four film lists it does publish. Each one answers a different question a
 * visitor actually asks: what is everyone watching, what is on at the
 * cinema, what is coming, and what is worth it.
 */
const TABS = [
  { id: "popular", label: "Popular" },
  { id: "now_playing", label: "In Theaters" },
  { id: "upcoming", label: "Upcoming" },
  { id: "top_rated", label: "Top Rated" },
];

const PlayIcon = () => (
  <svg className="h-7 w-7 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

/*
 * The Latest Trailers strip.
 *
 * Switching tab refetches, because a film's trailer needs its own request
 * and pulling all four lists up front would mean roughly fifty requests on
 * a page the visitor may never scroll to.
 *
 * Results are cached per tab in state, so going back to a tab already seen
 * is instant and costs nothing.
 */
const TrailerSection = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);

  // the cache is kept in a ref as well, so the effect can check it without
  // listing it as a dependency and re-running every time it is written to
  const loaded = useRef({});

  useEffect(() => {
    if (loaded.current[activeTab]) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      const movies = await getMoviesWithTrailers(activeTab, 12);
      // the visitor may have changed tab while this was in flight
      if (cancelled) return;
      loaded.current[activeTab] = movies;
      setCache({ ...loaded.current });
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const movies = cache[activeTab] || [];

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          <h2 className="text-xl font-bold text-white">Latest Trailers</h2>

          <div className="flex flex-wrap gap-1 rounded-full border border-neutral-700 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#E50914] text-white"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="no-scrollbar mx-auto flex max-w-7xl gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
        {loading
          ? // placeholders of the same size, so the strip does not collapse while loading
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="w-72 shrink-0 sm:w-80">
                <div className="aspect-video w-full animate-pulse rounded-lg bg-[#1c1c1c]" />
              </div>
            ))
          : movies.map((movie) => (
              <button
                key={movie.id}
                onClick={() => setPlaying(movie)}
                className="group w-72 shrink-0 text-left sm:w-80"
              >
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={`${BACKDROP_BASE}${movie.backdrop_path}`}
                    alt={movie.title}
                    className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/10" />

                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#E50914] group-hover:text-white">
                      <PlayIcon />
                    </span>
                  </span>
                </div>

                <h3 className="mt-3 truncate text-center text-base font-semibold text-white group-hover:text-[#E50914]">
                  {movie.title}
                </h3>
                <p className="truncate text-center text-sm text-neutral-400">
                  {movie.release_date ? movie.release_date.slice(0, 4) : "—"} · Watch trailer
                </p>
              </button>
            ))}

        {!loading && movies.length === 0 && (
          <p className="py-10 text-neutral-400">No trailers available for this list right now.</p>
        )}
      </div>

      <TrailerModal
        trailerKey={playing?.trailerKey}
        title={playing?.title}
        onClose={() => setPlaying(null)}
      />
    </section>
  );
};

export default TrailerSection;
