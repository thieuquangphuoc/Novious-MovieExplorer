const POSTER_BASE = "https://image.tmdb.org/t/p/w154";

const MovieTooltip = ({ active, payload, rows }) => {
  if (!active || !payload?.length) return null;

  const movie = payload[0].payload;
  if (!movie?.title) return null;

  return (
    <div className="pointer-events-none flex w-64 gap-3 border border-white/15 bg-[#0b0b0b]/95 p-3 backdrop-blur">
      {movie.poster ? (
        <img
          src={`${POSTER_BASE}${movie.poster}`}
          alt=""
          className="h-28 w-[4.7rem] shrink-0 object-cover"
        />
      ) : (
        <div className="h-28 w-[4.7rem] shrink-0 bg-white/5" />
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight text-white">{movie.title}</p>
        <p className="mt-0.5 text-xs text-neutral-500">{movie.year || "—"}</p>

        <dl className="mt-2 space-y-1">
          {rows(movie).map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-2">
              <dt className="text-[11px] uppercase tracking-wider text-neutral-500">
                {row.label}
              </dt>
              <dd className="text-xs font-semibold tabular-nums text-white">{row.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-2 text-[10px] uppercase tracking-wider text-[#E50914]">
          Click to open
        </p>
      </div>
    </div>
  );
};

export default MovieTooltip;
