import { useMemo } from "react";
import { Link } from "react-router-dom";
import { hiddenGems } from "../../services/insights";
import StarRating from "../common/StarRating";

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

const HiddenGems = ({ movies }) => {
  const { gems, voteThreshold } = useMemo(() => hiddenGems(movies, { limit: 7 }), [movies]);

  if (gems.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-neutral-500">
        Nothing in this set is both highly rated and little seen — everything good here
        has already been found.
      </p>
    );
  }

  const [lead, ...rest] = gems;

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
        
        <Link to={`/movie/${lead.id}`} className="group block">
          <div className="relative overflow-hidden">
            <img
              src={`${POSTER_BASE}${lead.poster}`}
              alt={lead.title}
              className="aspect-[2/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-[#E50914]">
                Most overlooked
              </p>
              <h3 className="text-2xl font-bold leading-tight text-white">{lead.title}</h3>
              <div className="mt-2 flex items-center gap-3 text-sm text-neutral-300">
                <StarRating value={lead.rating} className="text-xs" />
                <span className="tabular-nums">{lead.rating.toFixed(1)}</span>
                <span className="text-neutral-500">
                  {lead.votes.toLocaleString("en-US")} votes
                </span>
              </div>
            </div>
          </div>
        </Link>

        <div>
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {rest.map((movie, index) => (
              <li key={movie.id}>
                <Link
                  to={`/movie/${movie.id}`}
                  className="group flex items-center gap-4 py-3 transition-colors hover:bg-white/[0.03]"
                >
                  <span className="w-6 shrink-0 text-xs tabular-nums text-neutral-600">
                    {String(index + 2).padStart(2, "0")}
                  </span>

                  <img
                    src={`${POSTER_BASE}${movie.poster}`}
                    alt=""
                    className="h-16 w-11 shrink-0 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white group-hover:text-[#E50914]">
                      {movie.title}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {movie.year} · {movie.genres.slice(0, 2).join(", ")}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-white">
                      {movie.rating.toFixed(1)}
                    </p>
                    <p className="text-[11px] tabular-nums text-neutral-500">
                      {movie.votes.toLocaleString("en-US")}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-sm leading-relaxed text-neutral-400">
            These scored{" "}
            <span className="text-white">7.5 or better</span> on fewer than{" "}
            <span className="text-white">{voteThreshold.toLocaleString("en-US")}</span>{" "}
            votes — the bottom four in ten of this set. A high score on a small sample is
            softer evidence than the same score on fifty thousand votes, which is exactly
            why these films stay invisible: nothing pushes them in front of anyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HiddenGems;
