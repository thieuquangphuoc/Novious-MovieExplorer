import { useRef } from "react";
import PosterCard from "./PosterCard";

// Tuned against the poster height so a numeral stands as tall as the artwork.
const NUMBER_FONT_SIZE = "23rem";

const Arrow = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    aria-label={direction === -1 ? "Scroll left" : "Scroll right"}
    className={`absolute top-[45%] z-30 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white opacity-0 transition hover:bg-[#E50914] focus:opacity-100 group-hover/row:opacity-100 ${
      direction === -1 ? "left-0" : "right-0"
    }`}
  >
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === -1 ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      />
    </svg>
  </button>
);

/*
 * A horizontal row of films that the visitor steps through with arrows.
 *
 * The track is a plain overflow-x container, so a trackpad swipe or a touch
 * drag still works; the arrows just call scrollBy for people using a mouse.
 * Each press moves 85% of the visible width, leaving a sliver of the previous
 * card on screen so the eye keeps its place.
 *
 * py-6 inside the track is not decoration. overflow-x also clips vertically,
 * so without that padding the card would be cut off the moment it lifts on
 * hover.
 *
 * numbered renders the Top 10 variant: a hollow numeral behind each poster,
 * sized to stand as tall as the artwork, with the poster pulled back over its
 * tail. Cards come from the same PosterCard either way, so all three rows on
 * the home page are exactly the same size.
 */
const ScrollRow = ({ title, movies, numbered = false, limit }) => {
  const trackRef = useRef(null);
  const list = limit ? movies.slice(0, limit) : movies;

  if (list.length === 0) return null;

  const scrollByPage = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="py-6">
      <h2 className="mx-auto mb-1 max-w-7xl px-4 text-xl font-bold text-white sm:px-6 lg:px-8">
        {title}
      </h2>

      <div className="group/row relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={trackRef}
          className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth py-6"
        >
          {list.map((movie, index) =>
            numbered ? (
              <div key={movie.id} className="flex shrink-0 items-start">
                <span
                  className="select-none font-black text-transparent"
                  style={{
                    fontSize: NUMBER_FONT_SIZE,
                    lineHeight: 0.72,
                    WebkitTextStroke: "3px #6e6e6e",
                  }}
                >
                  {index + 1}
                </span>

                <div className="-ml-12">
                  <PosterCard movie={movie} />
                </div>
              </div>
            ) : (
              <PosterCard key={movie.id} movie={movie} />
            )
          )}
        </div>

        <Arrow direction={-1} onClick={() => scrollByPage(-1)} />
        <Arrow direction={1} onClick={() => scrollByPage(1)} />
      </div>
    </section>
  );
};

export default ScrollRow;
