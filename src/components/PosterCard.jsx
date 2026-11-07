import { Link } from "react-router-dom";
import StarRating from "./StarRating";

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const NO_POSTER = "https://placehold.co/500x750/1c1c1c/555?text=No+Image";

/*
 * The poster card used by every row on the home page.
 *
 * Fixed width so all three rows line up: the poster is a 2:3 box, and under
 * it sit the title, the release year and the star rating. Keeping the strip
 * outside the poster means it is readable without hovering, which matters on
 * touch screens where hover does not exist.
 *
 * Hovering lifts the card and reveals the synopsis and a Watch now button.
 * The parent row must leave vertical room for that lift, otherwise its own
 * overflow rule clips the enlarged card.
 */
const PosterCard = ({ movie }) => {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";

  return (
    <div className="group/card relative w-40 shrink-0 transition-transform duration-300 hover:z-20 hover:scale-105 sm:w-44">
      <div className="relative overflow-hidden rounded-md">
        <img
          src={movie.poster_path ? `${POSTER_BASE}${movie.poster_path}` : NO_POSTER}
          alt={movie.title}
          className="aspect-[2/3] w-full object-cover"
        />

        {/* synopsis and action, revealed on hover only */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/85 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
          <p className="line-clamp-4 text-[11px] leading-snug text-neutral-300">
            {movie.overview || "No description available."}
          </p>

          <Link
            to={`/movie/${movie.id}`}
            className="mt-2 block rounded bg-[#E50914] py-1.5 text-center text-[11px] font-semibold text-white transition duration-200 hover:scale-105 hover:bg-[#f6121d]"
          >
            Watch now
          </Link>
        </div>
      </div>

      {/* always-visible strip: title, year, rating */}
      <Link to={`/movie/${movie.id}`} className="mt-2 block">
        <h3 className="truncate text-sm font-medium text-white group-hover/card:text-[#E50914]">
          {movie.title}
        </h3>

        <div className="mt-1 flex items-center gap-2">
          <StarRating value={movie.vote_average} className="text-xs" />
          <span className="text-xs text-neutral-500">{year}</span>
        </div>
      </Link>
    </div>
  );
};

export default PosterCard;
