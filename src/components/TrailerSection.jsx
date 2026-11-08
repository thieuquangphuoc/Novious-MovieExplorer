import { useState, useEffect, useRef } from "react";
import { getMoviesWithTrailers } from "../services/api";
import TrailerModal from "./TrailerModal";
import StarRating from "./StarRating";
import ScrollProgressBar from "./ScrollProgressBar";

const CARD_BACKDROP = "https://image.tmdb.org/t/p/w780";
const AMBIENT_BACKDROP = "https://image.tmdb.org/t/p/w780";

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

const PlayIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const Arrow = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    aria-label={direction === -1 ? "Scroll left" : "Scroll right"}
    className={`absolute top-[42%] z-30 -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-3 text-white opacity-0 backdrop-blur transition hover:bg-[#E50914] focus:opacity-100 group-hover/strip:opacity-100 ${
      direction === -1 ? "left-2" : "right-2"
    }`}
  >
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === -1 ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      />
    </svg>
  </button>
);

/*
 * The Latest Trailers strip.
 *
 * This band is meant to feel like a different room from the poster rows
 * above it, without becoming a box pasted onto the page. Three things do
 * that work:
 *
 * - An ambient background: the backdrop of whichever film is under the
 *   pointer, blurred hard and dimmed almost to black, so the band quietly
 *   takes on the colour of what you are looking at. Before anything is
 *   hovered it borrows the first film's.
 * - Hairline borders top and bottom, plus a soft red glow, to mark the band
 *   as its own stretch of page.
 * - A mask on the strip, so cards fade out at the two ends instead of
 *   being chopped off. It has to be a mask rather than a coloured overlay:
 *   an overlay would have to match the background, and the background here
 *   changes with every film.
 *
 * Switching tab refetches, because a film's trailer needs its own request
 * and pulling all four lists up front would mean roughly fifty requests on
 * a page the visitor may never scroll to. Results are cached per tab, so
 * returning to one already seen is instant and costs nothing.
 */
const TrailerSection = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  // what is on screen right now — kept through a tab change, not cleared
  const [shown, setShown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);
  const [hovered, setHovered] = useState(null);

  const trackRef = useRef(null);

  // the cache is kept in a ref as well, so the effect can check it without
  // listing it as a dependency and re-running every time it is written to
  const loaded = useRef({});

  /*
   * Load the tab, but never empty the strip to do it.
   *
   * The obvious version rendered `cache[activeTab] || []`, which is empty
   * the instant an uncached tab is picked: the cards became grey blocks,
   * the ambient backdrop vanished, and the arrows and the scrollbar
   * unmounted — taking their height with them, so the rest of the page
   * jumped. It read as the whole section reloading, and it only stopped
   * once every tab had been visited and cached.
   *
   * So the previous tab's cards stay on screen, dimmed, until the new ones
   * are ready. Skeletons are now only for the very first load, when there
   * is genuinely nothing to keep.
   */
  useEffect(() => {
    const cached = loaded.current[activeTab];
    if (cached) {
      setShown(cached);
      setLoading(false);
      if (trackRef.current) trackRef.current.scrollLeft = 0;
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const movies = await getMoviesWithTrailers(activeTab, 12);
      // the visitor may have changed tab while this was in flight
      if (cancelled) return;
      loaded.current[activeTab] = movies;
      setShown(movies);
      setLoading(false);
      if (trackRef.current) trackRef.current.scrollLeft = 0;
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const ambient = hovered?.backdrop_path || shown[0]?.backdrop_path || null;

  const scrollByPage = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="relative isolate overflow-hidden border-y border-white/10 py-14">
      {/* ===== AMBIENT BACKGROUND ===== */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {ambient && (
          <img
            key={ambient}
            src={`${AMBIENT_BACKDROP}${ambient}`}
            alt=""
            className="ambient-in h-full w-full scale-110 object-cover blur-2xl"
          />
        )}

        {/* hold it back far enough that white text never has to fight it */}
        <div className="absolute inset-0 bg-[#141414]/70" />
        {/* a red glow in one corner, so the band is not a flat rectangle */}
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#E50914]/25 blur-[120px]" />

        {/* Melt only the two edges into the page colour.
            A single full-height gradient was covering the whole band, which
            left the ambient image showing through nothing but a thin strip
            in the middle — all that work for an effect nobody could see. */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#141414] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#141414] to-transparent" />
      </div>

      {/* ===== HEADER ===== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#E50914]">
              Straight from the projector
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Latest Trailers</h2>
          </div>

          <div className="flex flex-wrap gap-1 self-start rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur sm:self-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  // a film from the tab being left behind must not keep tinting the panel
                  setHovered(null);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== STRIP ===== */}
      <div className="group/strip relative mt-8">
        <div
          ref={trackRef}
          className={`no-scrollbar fade-edges mx-auto flex max-w-7xl gap-5 overflow-x-auto scroll-smooth px-4 py-2 transition-opacity duration-300 sm:px-6 lg:px-8 ${
            loading && shown.length > 0 ? "pointer-events-none opacity-40" : "opacity-100"
          }`}
        >
          {shown.length === 0
            ? // only on the very first load, when there is nothing to keep
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="w-[19rem] shrink-0 sm:w-[21rem]">
                  <div className="aspect-video w-full animate-pulse rounded-xl bg-white/5" />
                </div>
              ))
            : shown.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => setPlaying(movie)}
                  onMouseEnter={() => setHovered(movie)}
                  onFocus={() => setHovered(movie)}
                  className="group/card w-[19rem] shrink-0 text-left sm:w-[21rem]"
                >
                  <div className="relative overflow-hidden rounded-xl ring-1 ring-white/10 transition duration-500 group-hover/card:ring-2 group-hover/card:ring-[#E50914]/70">
                    <img
                      src={`${CARD_BACKDROP}${movie.backdrop_path}`}
                      alt={movie.title}
                      className="aspect-video w-full object-cover transition-transform duration-700 group-hover/card:scale-[1.08]"
                    />

                    {/* darkened by default, clears as the card is hovered */}
                    <div className="absolute inset-0 bg-black/35 transition-colors duration-500 group-hover/card:bg-black/10" />
                    {/* permanent scrim, so the caption is readable over any still */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/70 to-transparent" />

                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white backdrop-blur transition-all duration-500 group-hover/card:scale-110 group-hover/card:border-[#E50914] group-hover/card:bg-[#E50914]">
                        <PlayIcon className="h-6 w-6 translate-x-[1px]" />
                      </span>
                    </span>

                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="truncate text-base font-semibold text-white">{movie.title}</h3>

                      <div className="mt-1 flex items-center gap-2">
                        <StarRating value={movie.vote_average} className="text-xs" />
                        <span className="text-xs text-neutral-400">
                          {movie.release_date ? movie.release_date.slice(0, 4) : "—"}
                        </span>
                      </div>
                    </div>

                    {/* thin accent that wipes across the foot of the card on hover */}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#E50914] transition-transform duration-500 group-hover/card:scale-x-100" />
                  </div>
                </button>
              ))}

          {!loading && shown.length === 0 && (
            <p className="py-10 text-neutral-400">
              No trailers available for this list right now.
            </p>
          )}
        </div>

        {/* tied to shown, not to loading: unmounting these mid-load removed
            their height and shunted the rest of the page upwards */}
        {shown.length > 0 && (
          <>
            <Arrow direction={-1} onClick={() => scrollByPage(-1)} />
            <Arrow direction={1} onClick={() => scrollByPage(1)} />

            {/* sits outside the masked strip, or its own ends would fade too */}
            <ScrollProgressBar
              trackRef={trackRef}
              watch={activeTab}
              className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8"
            />
          </>
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
