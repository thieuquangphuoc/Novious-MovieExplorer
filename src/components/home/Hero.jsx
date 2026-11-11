import { Link } from "react-router-dom";
import StarRating from "../common/StarRating";

const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

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
          
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/80 to-transparent" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/90 via-transparent to-transparent" />
        </>
      ) : (
        // flat dim only, so the peeking edge still shows colour
        <div className="absolute inset-0 bg-black/40" />
      )}

      <div
        className={`relative grid h-full grid-cols-1 items-center gap-8 px-6 transition-opacity duration-500 sm:px-10 lg:grid-cols-3 lg:px-14 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      >
        
        <div className="hidden self-stretch lg:flex lg:items-center lg:justify-center">
          <img
            src={`${POSTER_BASE}${movie.poster_path}`}
            alt={`Poster ${movie.title}`}
            className="h-[64%] w-auto rounded-lg object-contain shadow-2xl shadow-black/70"
          />
        </div>

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
