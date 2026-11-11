import { useState, useEffect, useRef } from "react";
import { getMoviesByDecade } from "../../services/api";
import decades from "../../data/decades";
import PosterCard from "../movie/PosterCard";
import ScrollProgressBar from "../common/ScrollProgressBar";

const DEFAULT_INDEX = decades.length - 1;

const Arrow = ({ direction, onClick, accent }) => (
  <button
    onClick={onClick}
    aria-label={direction === -1 ? "Scroll left" : "Scroll right"}
    style={{ "--accent": accent }}
    className={`absolute top-[42%] z-30 -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-3 text-white opacity-0 backdrop-blur transition hover:bg-[var(--accent)] hover:text-black focus:opacity-100 group-hover/strip:opacity-100 ${
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

const MovieMachine = () => {
  const [index, setIndex] = useState(DEFAULT_INDEX);
  const [touched, setTouched] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const trackRef = useRef(null);

  const decade = decades[index];

  const pickDecade = (next) => {
    setIndex(next);
    setTouched(true);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const results = await getMoviesByDecade(decade.start, 2);
      if (cancelled) return;
      setMovies(results);
      setLoading(false);
      // a new decade starts at its beginning, not where the last one ended
      if (trackRef.current) trackRef.current.scrollLeft = 0;
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [decade.start]);

  const scrollByPage = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section
      className="relative isolate overflow-hidden border-y border-white/10 py-14"
      style={{ "--accent": decade.accent }}
    >
      
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div
          key={decade.start}
          className="ambient-in absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(140deg, ${decade.from} 0%, ${decade.via} 50%, ${decade.to} 100%)`,
          }}
        />

        <div
          className="film-grain absolute inset-0 mix-blend-overlay transition-opacity duration-700"
          style={{ opacity: decade.grain }}
        />

        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#141414] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#141414] to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p
          className="mb-1.5 text-xs font-semibold uppercase tracking-[0.25em]"
          style={{ color: decade.accent, fontFamily: decade.bodyFont }}
        >
          The Movie Machine
        </p>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
          <h2
            className="text-3xl font-bold text-white sm:text-5xl"
            style={{ fontFamily: decade.font }}
          >
            {decade.label}
          </h2>
          <p className="text-lg text-neutral-300" style={{ fontFamily: decade.font }}>
            {decade.era}
          </p>
        </div>

        <p
          className="mt-2 max-w-2xl text-sm text-neutral-400"
          style={{ fontFamily: decade.bodyFont }}
        >
          {decade.blurb}
        </p>

        <div className="mt-7">
          
          <div
            className={`mb-2 flex items-center gap-2 text-xs transition-opacity duration-500 ${
              touched ? "opacity-30" : "opacity-100"
            }`}
            style={{ fontFamily: decade.bodyFont, color: decade.accent }}
          >
            <svg
              className={touched ? "h-4 w-4" : "nudge-x h-4 w-4"}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
            </svg>
            <span>Drag to travel through cinema — or pick a year below</span>
          </div>

          <input
            type="range"
            min={0}
            max={decades.length - 1}
            step={1}
            value={index}
            onChange={(event) => pickDecade(Number(event.target.value))}
            aria-label="Choose a decade"
            aria-valuetext={`${decade.label}, ${decade.era}`}
            className="decade-slider"
            style={{ "--accent": decade.accent }}
          />

          <div aria-hidden="true" className="-mt-1.5 flex justify-between px-[9px]">
            {decades.map((item, i) => (
              <span
                key={item.start}
                className="h-2 w-px transition-colors duration-300"
                style={{ background: i === index ? decade.accent : "rgba(255,255,255,0.22)" }}
              />
            ))}
          </div>

          <div className="mt-1 flex justify-between">
            {decades.map((item, i) => (
              <button
                key={item.start}
                onClick={() => pickDecade(i)}
                aria-label={`Jump to the ${item.label}`}
                style={{
                  fontFamily: decade.bodyFont,
                  color: i === index ? decade.accent : undefined,
                }}
                className={`-mx-1 rounded px-1.5 py-0.5 text-[11px] tabular-nums transition-colors sm:text-xs ${
                  i === index ? "font-bold" : "text-neutral-500 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.start}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="group/strip relative mt-8">
        <div
          ref={trackRef}
          className="no-scrollbar fade-edges mx-auto flex max-w-7xl gap-4 overflow-x-auto scroll-smooth px-4 py-4 sm:px-6 lg:px-8"
        >
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="w-40 shrink-0 sm:w-44">
                  <div className="aspect-[2/3] w-full animate-pulse rounded-md bg-white/5" />
                </div>
              ))
            : movies.map((movie) => <PosterCard key={movie.id} movie={movie} />)}

          {!loading && movies.length === 0 && (
            <p className="py-10 text-neutral-400" style={{ fontFamily: decade.bodyFont }}>
              TMDB has nothing to show for the {decade.label}.
            </p>
          )}
        </div>

        {!loading && movies.length > 0 && (
          <>
            <Arrow direction={-1} onClick={() => scrollByPage(-1)} accent={decade.accent} />
            <Arrow direction={1} onClick={() => scrollByPage(1)} accent={decade.accent} />

            <ScrollProgressBar
              trackRef={trackRef}
              watch={decade.start}
              className="mx-auto mt-2 max-w-7xl px-4 sm:px-6 lg:px-8"
            />
          </>
        )}
      </div>
    </section>
  );
};

export default MovieMachine;
