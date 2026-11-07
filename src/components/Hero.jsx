import { Link } from "react-router-dom";

const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

/*
 * One slide of the hero slideshow on the home page.
 *
 * Layout: a three-column grid — the portrait poster takes the left column,
 * the text takes the two right ones. The poster derives its height from the
 * hero (h-full minus padding) and its width follows from the 2:3 ratio, so
 * it stays in proportion whatever the screen size.
 *
 * Below lg the poster is hidden: on a phone it would swallow the whole
 * space meant for the title and the overview.
 *
 * shrink-0 is required. Home lays the Hero slides side by side in a flex
 * track and slides it with translateX; letting flex shrink them would
 * collapse every slide into a single frame.
 */
const Hero = ({ movie }) => {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  return (
    <section className="relative h-[60vh] max-h-[600px] min-h-[420px] w-full shrink-0 overflow-hidden">
      <img
        src={`${BACKDROP_BASE}${movie.backdrop_path}`}
        alt={movie.title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* darken the left so the poster and the text stand out */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/85 to-transparent" />
      {/* darken the bottom so the slide meets the page background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

      <div className="relative mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-3 lg:px-20">
        {/* left column: portrait poster */}
        <div className="hidden self-stretch py-6 lg:flex lg:items-center lg:justify-center">
          <img
            src={`${POSTER_BASE}${movie.poster_path}`}
            alt={`Poster ${movie.title}`}
            className="h-full w-auto rounded-lg object-contain shadow-2xl shadow-black/70"
          />
        </div>

        {/* two right columns: title and overview */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-3 text-sm text-neutral-300">
            <span className="font-semibold text-[#E50914]">★ {rating}</span>
            <span>{year}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Trending now
            </span>
          </div>

          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {movie.title}
          </h1>

          <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base">
            {movie.overview || "No description available."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {/* opens the detail page of whichever film is on screen */}
            <Link
              to={`/movie/${movie.id}`}
              className="rounded bg-[#E50914] px-6 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-105 hover:bg-[#f6121d]"
            >
              Watch now
            </Link>

            <Link
              to="/discover"
              className="rounded border border-neutral-500 px-6 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-105 hover:border-white hover:bg-white/10"
            >
              Read more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
