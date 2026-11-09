const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

const COLUMNS = 6;

/*
 * Durations deliberately unequal and not multiples of each other, so the
 * columns never line up into a single sliding block.
 */
const DURATIONS = ["74s", "96s", "82s", "110s", "88s", "102s"];

/*
 * The wall of posters behind the Discover hero.
 *
 * Six columns of real posters drifting vertically, every other one going
 * the opposite way. They are left unblurred on purpose — everywhere else
 * on this site a backdrop is softened into texture, but here the point is
 * that you recognise the films, so the page reads as a catalogue before
 * you have read a single word of it.
 *
 * Each column prints its posters twice and travels exactly -50% of its
 * own height. The loop therefore lands on a frame identical to its start
 * and there is no visible seam; it is the same trick the home page rows
 * use, turned on its side.
 *
 * Columns are dealt round-robin rather than sliced, so a short list still
 * fills all six instead of leaving the last ones empty.
 *
 * aria-hidden on the whole thing: it is wallpaper. A screen reader should
 * reach the heading and the search box, not forty poster images.
 */
const PosterWall = ({ posters }) => {
  if (posters.length < 12) return null;

  const columns = Array.from({ length: COLUMNS }, (unused, columnIndex) =>
    posters.filter((item, index) => index % COLUMNS === columnIndex)
  );

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="flex h-full gap-3 px-3">
        {columns.map((column, index) => (
          <div
            key={index}
            /* the last columns only appear when there is width for them,
               so narrow screens get bigger posters rather than slivers */
            className={`h-full flex-1 overflow-hidden ${
              index >= 3 ? "hidden sm:block" : ""
            } ${index >= 4 ? "hidden lg:block" : ""}`}
          >
            <div
              className={index % 2 === 0 ? "poster-up" : "poster-down"}
              style={{ "--dur": DURATIONS[index % DURATIONS.length] }}
            >
              {[...column, ...column].map((path, copy) => (
                <img
                  key={`${path}-${copy}`}
                  src={`${POSTER_BASE}${path}`}
                  alt=""
                  loading="lazy"
                  className="mb-3 w-full rounded-sm object-cover"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PosterWall;
