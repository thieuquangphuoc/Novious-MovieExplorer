import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovieDetails, getMovieCredits } from "../services/api";

const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const PROFILE_BASE = "https://image.tmdb.org/t/p/w185";
const NO_PHOTO = "https://placehold.co/185x278/1c1c1c/555?text=No+Photo";
const NO_POSTER = "https://placehold.co/500x750/1c1c1c/555?text=No+Image";

const CAST_LIMIT = 12;

// 149 -> "2h 29m"
const formatRuntime = (minutes) => {
  if (!minutes) return "—";
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

// 125000000 -> "$125,000,000"; TMDB thường trả 0 khi không có dữ liệu
const formatMoney = (amount) => {
  if (!amount) return "Không có dữ liệu";
  return `$${amount.toLocaleString("en-US")}`;
};

/*
 * Trang chi tiết của một bộ phim: /movie/:id
 *
 * useParams đọc id từ URL. Hai lời gọi API chạy song song bằng Promise.all
 * vì chúng độc lập nhau — chờ lần lượt sẽ chậm gấp đôi không vì lý do gì.
 *
 * Dependency array là [id]: khi người xem bấm sang phim khác, id đổi thì
 * effect chạy lại và nạp dữ liệu phim mới. Nếu để [] thì trang sẽ đứng yên
 * với dữ liệu của phim đầu tiên.
 */
const MovieDetail = () => {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [details, credits] = await Promise.all([
        getMovieDetails(id),
        getMovieCredits(id),
      ]);
      setMovie(details);
      setCast(credits);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return <p className="py-32 text-center text-neutral-400">Đang tải...</p>;
  }

  if (!movie) {
    return (
      <div className="py-32 text-center">
        <p className="text-neutral-400">Không tìm thấy phim này.</p>
        <Link to="/discover" className="mt-4 inline-block text-[#E50914] hover:underline">
          Quay lại Discover
        </Link>
      </div>
    );
  }

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const mainCast = cast.slice(0, CAST_LIMIT);

  return (
    <div>
      {/* ===== PHẦN ĐẦU: ảnh nền + poster + thông tin chính ===== */}
      <section className="relative">
        {movie.backdrop_path && (
          <img
            src={`${BACKDROP_BASE}${movie.backdrop_path}`}
            alt={movie.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/90 to-[#141414]/70" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row lg:px-8">
          <img
            src={movie.poster_path ? `${POSTER_BASE}${movie.poster_path}` : NO_POSTER}
            alt={`Poster ${movie.title}`}
            className="w-48 shrink-0 self-center rounded-lg shadow-2xl shadow-black/70 md:w-64 md:self-start"
          />

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="mt-2 italic text-neutral-400">{movie.tagline}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-300">
              <span className="font-semibold text-[#E50914]">★ {rating}</span>
              <span>{movie.vote_count?.toLocaleString("en-US")} lượt đánh giá</span>
              <span>{year}</span>
              <span>{formatRuntime(movie.runtime)}</span>
            </div>

            {/* tên thể loại chỉ có trong response chi tiết, không có ở /trending */}
            <div className="mt-4 flex flex-wrap gap-2">
              {movie.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full border border-neutral-600 px-3 py-1 text-xs text-neutral-300"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <h2 className="mt-8 text-lg font-semibold text-white">Nội dung</h2>
            <p className="mt-2 max-w-3xl leading-relaxed text-neutral-300">
              {movie.overview || "Chưa có mô tả cho phim này."}
            </p>

            <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-neutral-500">Ngân sách</dt>
                <dd className="text-white">{formatMoney(movie.budget)}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Doanh thu</dt>
                <dd className="text-white">{formatMoney(movie.revenue)}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Trạng thái</dt>
                <dd className="text-white">{movie.status || "—"}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Hãng sản xuất</dt>
                <dd className="text-white">
                  {movie.production_companies?.length
                    ? movie.production_companies.map((company) => company.name).join(", ")
                    : "—"}
                </dd>
              </div>
            </dl>

            <Link
              to="/discover"
              className="mt-8 inline-block rounded border border-neutral-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Tìm phim khác
            </Link>
          </div>
        </div>
      </section>

      {/* ===== DÀN DIỄN VIÊN ===== */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-bold text-white">Dàn diễn viên</h2>

        {mainCast.length === 0 ? (
          <p className="text-neutral-400">TMDB chưa có thông tin diễn viên cho phim này.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {mainCast.map((person) => (
              <div key={person.id}>
                <img
                  src={person.profile_path ? `${PROFILE_BASE}${person.profile_path}` : NO_PHOTO}
                  alt={person.name}
                  className="aspect-[2/3] w-full rounded-md object-cover"
                />
                <p className="mt-2 truncate text-sm font-medium text-white">{person.name}</p>
                <p className="truncate text-xs text-neutral-500">{person.character}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MovieDetail;
