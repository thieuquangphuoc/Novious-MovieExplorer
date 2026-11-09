import { Link } from "react-router-dom";

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const NO_POSTER = "https://placehold.co/500x750/1c1c1c/555?text=No+Image";

/*
 * The Top 10 row — deliberately a different design from the two rows above.
 *
 * Each entry is a huge hollow numeral sitting BEHIND the poster. The number
 * is filled with transparent and outlined with -webkit-text-stroke, so the
 * page shows through the body of the digit.
 *
 * -ml-6 pulls the poster over the tail of the number; the poster carries
 * z-10 and sits on top, the number stays underneath. The digits use the
 * default bold face rather than Bebas Neue: Bebas is so narrow that the
 * poster covered almost all of each digit and they became unreadable.
 *
 * This row does not auto-scroll like the other two. A Top 10 is something
 * people read in order, and numbers drifting past make that hard to follow,
 * so it scrolls horizontally by mouse or swipe instead.
 */
const TopTenRow = ({ title, movies }) => {
  if (movies.length === 0) return null;

  return (
    <section className="py-6">
      <h2 className="mx-auto mb-4 max-w-7xl px-4 text-xl font-bold text-white sm:px-6 lg:px-8">
        {title}
      </h2>

      <div className="mx-auto max-w-7xl overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {movies.slice(0, 10).map((movie, index) => (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              className="group flex shrink-0 items-end"
            >
              <span
                className="select-none text-[7rem] font-black leading-[0.75] text-transparent sm:text-[9rem]"
                style={{ WebkitTextStroke: "3px #6e6e6e" }}
              >
                {index + 1}
              </span>

              <img
                src={movie.poster_path ? `${POSTER_BASE}${movie.poster_path}` : NO_POSTER}
                alt={movie.title}
                className="relative z-10 -ml-6 w-28 rounded-md object-cover shadow-xl shadow-black/60 transition-transform duration-300 group-hover:scale-105 sm:w-32"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopTenRow;
