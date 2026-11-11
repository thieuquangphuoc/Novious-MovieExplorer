const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

const SORTS = [
  { id: "popularity.desc", label: "Most popular" },
  { id: "vote_average.desc", label: "Highest rated" },
  { id: "primary_release_date.desc", label: "Newest first" },
  { id: "primary_release_date.asc", label: "Oldest first" },
  { id: "revenue.desc", label: "Biggest box office" },
];

const RATINGS = [0, 6, 7, 8];

const LABEL = "text-[10px] uppercase tracking-[0.18em] text-neutral-500";

const Block = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <span className={LABEL}>{label}</span>
    {children}
  </div>
);

const CONTROL =
  "h-10 border border-white/15 bg-[#161616] px-3 text-sm text-neutral-200 outline-none transition-colors hover:border-white/30 focus:border-[#E50914]";

const SELECT = `${CONTROL} select-field min-w-[11rem] cursor-pointer`;

const ShuffleIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"
    />
  </svg>
);

const FilterBar = ({
  value,
  onChange,
  genres,
  searching,
  resultCount,
  onClear,
  onShuffle,
  shuffling,
}) => {
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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        <div className="flex flex-wrap items-end gap-x-5 gap-y-5">
          <Block label="Sort by">
            <select
              value={value.sortBy}
              onChange={(event) => set({ sortBy: event.target.value })}
              disabled={searching}
              className={`${SELECT} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {SORTS.map((sort) => (
                <option key={sort.id} value={sort.id}>
                  {sort.label}
                </option>
              ))}
            </select>
          </Block>

          <Block label="Decade">
            <select
              value={value.decade || ""}
              onChange={(event) =>
                set({ decade: event.target.value ? Number(event.target.value) : null })
              }
              className={SELECT}
            >
              <option value="">Any decade</option>
              {DECADES.map((decade) => (
                <option key={decade} value={decade}>
                  {decade}s
                </option>
              ))}
            </select>
          </Block>

          <Block label="Minimum score">
            <select
              value={value.minRating}
              onChange={(event) => set({ minRating: Number(event.target.value) })}
              className={SELECT}
            >
              {RATINGS.map((rating) => (
                <option key={rating} value={rating}>
                  {rating === 0 ? "Any score" : `${rating}.0 and up`}
                </option>
              ))}
            </select>
          </Block>

          <div className="hidden h-10 self-end border-l border-white/10 lg:block" />

          <Block label="Matches">
            <p className="flex h-10 items-center text-lg font-semibold tabular-nums text-white">
              {resultCount.toLocaleString("en-US")}
              <span className="ml-1.5 text-xs font-normal text-neutral-500">
                film{resultCount === 1 ? "" : "s"}
              </span>
            </p>
          </Block>

          <Block label="Feeling lucky">
            <button
              onClick={onShuffle}
              disabled={shuffling || resultCount === 0}
              title="Jump to a random page of these results and reorder them"
              className={`${CONTROL} inline-flex items-center gap-2 font-semibold text-white hover:border-[#E50914] hover:bg-[#E50914] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:bg-[#161616]`}
            >
              <ShuffleIcon />
              {shuffling ? "Shuffling…" : "Shuffle"}
            </button>
          </Block>

          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="h-10 self-end text-xs text-neutral-400 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
            >
              Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
            </button>
          )}
        </div>

        <div className="mt-6 border-t border-white/10 pt-5">
          <p className={`${LABEL} mb-2.5`}>Genre</p>

          <div className="flex flex-wrap gap-1.5">
            {genres.map((genre) => {
              const on = value.genres.includes(genre.id);
              return (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  aria-pressed={on}
                  className={`border px-3 py-1.5 text-xs tracking-wide transition-colors ${
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
        </div>

        {searching && (
          <p className="mt-5 border-l-2 border-[#E50914] pl-3 text-xs leading-relaxed text-neutral-500">
            You are searching by title. TMDB&apos;s search endpoint takes no filters, so
            genre, decade and score are being applied to the results here in the browser
            — sorting is left to the search engine&apos;s own relevance ranking, and
            Shuffle only reorders what is already on screen. Clear the search box to
            filter the whole catalogue instead.
          </p>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
