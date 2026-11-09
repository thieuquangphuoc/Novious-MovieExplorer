/*
 * Decades offered in the year filter. Built from a fixed start rather
 * than from the data, because the filter asks TMDB for films rather than
 * narrowing a list already on screen — it has to be able to request a
 * decade the current results do not contain.
 */
const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

const SORTS = [
  { id: "popularity.desc", label: "Most popular" },
  { id: "vote_average.desc", label: "Highest rated" },
  { id: "primary_release_date.desc", label: "Newest first" },
  { id: "primary_release_date.asc", label: "Oldest first" },
  { id: "revenue.desc", label: "Biggest box office" },
];

const RATINGS = [0, 6, 7, 8];

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
      {label}
    </span>
    {children}
  </label>
);

const selectClass =
  "border border-white/15 bg-[#161616] px-3 py-2 text-sm text-neutral-200 outline-none transition-colors hover:border-white/30 focus:border-[#E50914]";

/*
 * The filter bar on Discover.
 *
 * Genres are multi-select chips rather than a dropdown: picking two or
 * three is the normal case, and a dropdown hides both the options and
 * what is currently on. Everything else is a select, because those are
 * one-of-many choices and a row of chips for eight decades would take
 * more room than the results.
 *
 * `searching` is true while a text search is on screen. TMDB's /search
 * endpoint accepts no filters at all, so in that mode the filters are
 * applied to the results in the browser instead, and the bar says so —
 * silently changing what a control means is worse than explaining it.
 */
const FilterBar = ({ value, onChange, genres, searching, resultCount, onClear }) => {
  const set = (patch) => onChange({ ...value, ...patch });

  const toggleGenre = (id) =>
    set({
      genres: value.genres.includes(id)
        ? value.genres.filter((g) => g !== id)
        : [...value.genres, id],
    });

  const activeCount =
    value.genres.length +
    (value.decade ? 1 : 0) +
    (value.minRating > 0 ? 1 : 0) +
    (value.sortBy !== "popularity.desc" ? 1 : 0);

  return (
    <div className="border-y border-white/10 bg-[#101010]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <Field label="Sort by">
            <select
              value={value.sortBy}
              onChange={(event) => set({ sortBy: event.target.value })}
              disabled={searching}
              className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {SORTS.map((sort) => (
                <option key={sort.id} value={sort.id}>
                  {sort.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Decade">
            <select
              value={value.decade || ""}
              onChange={(event) =>
                set({ decade: event.target.value ? Number(event.target.value) : null })
              }
              className={selectClass}
            >
              <option value="">Any decade</option>
              {DECADES.map((decade) => (
                <option key={decade} value={decade}>
                  {decade}s
                </option>
              ))}
            </select>
          </Field>

          <Field label="Minimum score">
            <select
              value={value.minRating}
              onChange={(event) => set({ minRating: Number(event.target.value) })}
              className={selectClass}
            >
              {RATINGS.map((rating) => (
                <option key={rating} value={rating}>
                  {rating === 0 ? "Any score" : `${rating}.0 and up`}
                </option>
              ))}
            </select>
          </Field>

          <div className="ml-auto flex items-center gap-4 pb-2">
            <span className="text-xs tabular-nums text-neutral-500">
              {resultCount.toLocaleString("en-US")} film
              {resultCount === 1 ? "" : "s"}
            </span>

            {activeCount > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-neutral-400 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
              >
                Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
              </button>
            )}
          </div>
        </div>

        {/* ===== GENRES ===== */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {genres.map((genre) => {
            const on = value.genres.includes(genre.id);
            return (
              <button
                key={genre.id}
                onClick={() => toggleGenre(genre.id)}
                aria-pressed={on}
                className={`border px-3 py-1 text-xs tracking-wide transition-colors ${
                  on
                    ? "border-[#E50914] bg-[#E50914] text-white"
                    : "border-white/15 text-neutral-400 hover:border-white/40 hover:text-white"
                }`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>

        {searching && (
          <p className="mt-4 border-l-2 border-[#E50914] pl-3 text-xs leading-relaxed text-neutral-500">
            You are searching by title. TMDB&apos;s search endpoint takes no filters, so
            genre, decade and score are being applied to the results here in the browser
            — and sorting is left to the search engine&apos;s own relevance ranking.
            Clear the search box to filter the whole catalogue instead.
          </p>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
