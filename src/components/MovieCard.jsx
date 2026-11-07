import { Link } from "react-router-dom";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

const MovieCard = ({ movie }) => {
  const poster = movie.poster_path
    ? `${IMG_BASE}${movie.poster_path}`
    : "https://placehold.co/500x750/141414/555?text=No+Image";

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  return (
    <Link to={`/movie/${movie.id}`} className="group block cursor-pointer">
      {/* khung poster */}
      <div className="relative overflow-hidden rounded-md transition-transform duration-300 ease-out group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/60">
        <img
          src={poster}
          alt={movie.title}
          className="aspect-[2/3] w-full object-cover"
        />

        {/* lớp phủ hiện khi hover */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/70 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="mb-1 text-xs font-semibold text-[#E50914]">★ {rating}</p>
          <p className="line-clamp-3 text-[11px] leading-snug text-neutral-300">
            {movie.overview || "No description available."}
          </p>
        </div>
      </div>

      {/* tên phim dưới poster */}
      <h3 className="mt-2 truncate text-sm font-medium text-white group-hover:text-[#E50914]">
        {movie.title}
      </h3>
      <p className="text-xs text-neutral-500">{year}</p>
    </Link>
  );
}

export default MovieCard;