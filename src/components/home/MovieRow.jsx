import { Link } from "react-router-dom";

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const NO_POSTER = "https://placehold.co/500x750/1c1c1c/555?text=No+Image";

const MovieCardInRow = ({ movie }) => (
  <div className="group/card relative w-40 shrink-0 transition-transform duration-300 hover:z-20 hover:scale-110 sm:w-44">
    <img
      src={movie.poster_path ? `${POSTER_BASE}${movie.poster_path}` : NO_POSTER}
      alt={movie.title}
      className="aspect-[2/3] w-full rounded-md object-cover"
    />

    {/* overlay appears only for the card being hovered */}
    <div className="absolute inset-0 flex flex-col justify-end rounded-md bg-gradient-to-t from-black via-black/80 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
      <p className="mb-1 text-xs font-semibold text-[#E50914]">
        ★ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
      </p>

      <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white">{movie.title}</h3>

      <p className="mt-1 line-clamp-3 text-[11px] leading-snug text-neutral-300">
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
);

/*
 * A row of films scrolling left forever.
 *
 * The list is printed TWICE as two identical halves, and the track slides
 * exactly 50% of its own width. The moment the first half has passed, the
 * animation restarts at 0, and because the second half is identical the eye
 * never catches the seam.
 *
 * The two halves must be EXACTLY the same width, otherwise every loop jumps
 * by the difference. That is why the outer track carries no gap: each half
 * spaces itself with an inner gap-4 plus a trailing pr-4, so either half is
 * precisely "n cards + n gaps".
 *
 * The second half is aria-hidden so a screen reader does not read the whole
 * film list out a second time.
 */
const MovieRow = ({ title, movies, duration = "45s" }) => {
  if (movies.length === 0) return null;

  const half = (
    <div className="flex shrink-0 gap-4 pr-4">
      {movies.map((movie) => (
        <MovieCardInRow key={movie.id} movie={movie} />
      ))}
    </div>
  );

  return (
    <section className="py-6">
      <h2 className="mx-auto mb-2 max-w-7xl px-4 text-xl font-bold text-white sm:px-6 lg:px-8">
        {title}
      </h2>

      {/* py-8 leaves room for the scaled-up card; without it overflow-hidden clips it */}
      <div className="marquee-row overflow-hidden py-8">
        <div className="marquee-track flex" style={{ "--marquee-duration": duration }}>
          {half}
          <div aria-hidden="true" className="flex shrink-0">
            {half}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MovieRow;
