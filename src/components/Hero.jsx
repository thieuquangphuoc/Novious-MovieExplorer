import { Link } from "react-router-dom";
import StarRating from "./StarRating";

const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

/*
 * One card of the hero carousel on the home page.
 *
 * The card fills whatever box Home gives it (h-full w-full) and rounds its
 * own corners, because Home keeps the neighbouring cards peeking in at the
 * edges and each of them has to read as a separate panel.
 *
 * isActive is about more than brightness. The centred card needs a heavy
 * dark gradient down its left side so white text stays readable over the
 * artwork — but that same gradient is what the visitor sees in the sliver
 * of the NEXT card, since a sliver on the right shows the left edge of the
 * card behind it. Painting it on every card made the right-hand peek look
 * like a black bar, as though the carousel had failed to load. The cards
 * off to the side therefore carry only a flat dim, so what peeks through
 * is the artwork itself.
 *
 * Inside, a three-column grid: the portrait poster takes the left column,
 * the text takes the two right ones. The poster is sized as a share of the
 * card height, so it keeps the same proportion on every screen.
 *
 * Below lg the poster is hidden — on a phone it would swallow the whole
 * space meant for the title and the overview.
 */
const Hero = ({ movie, isActive = true }) => {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      <img
        src={`${BACKDROP_BASE}${movie.backdrop_path}`}
        alt={movie.title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {isActive ? (
        <>
          {/* darken the left so the poster and the text stand out */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/80 to-transparent" />
          {/* darken the bottom so the card does not fight the page background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/90 via-transparent to-transparent" />
        </>
      ) : (
        /* flat dim only, so the peeking edge still shows colour */
        <div className="absolute inset-0 bg-black/40" />
      )}

      <div
        className={`relative grid h-full grid-cols-1 items-center gap-8 px-6 transition-opacity duration-500 sm:px-10 lg:grid-cols-3 lg:px-14 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* left column: portrait poster */}
        <div className="hidden self-stretch lg:flex lg:items-center lg:justify-center">
          <img
            src={`${POSTER_BASE}${movie.poster_path}`}
            alt={`Poster ${movie.title}`}
            className="h-[64%] w-auto rounded-lg object-contain shadow-2xl shadow-black/70"
          />
        </div>

        {/* two right columns: title and overview */}
        <div className="lg:col-span-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#E50914]">
            Trending now
          </p>

          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {movie.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-300">
            <StarRating value={movie.vote_average} />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</span>
            <span>{year}</span>
          </div>

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
    </div>
  );
};

export default Hero;
