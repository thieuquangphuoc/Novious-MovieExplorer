import { Link } from "react-router-dom";

const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

/*
 * Một slide của hero slideshow trên trang chủ.
 *
 * Bố cục: lưới 3 cột — poster dọc chiếm cột trái, phần chữ chiếm hai cột
 * phải. Poster lấy chiều cao từ hero (h-full trừ padding) rồi tự suy ra
 * chiều rộng theo tỉ lệ 2:3, nên nó luôn cân với khung dù màn hình to nhỏ.
 *
 * Từ màn hình nhỏ hơn lg thì ẩn poster đi: ở điện thoại nó sẽ chiếm hết chỗ
 * của tiêu đề và mô tả.
 *
 * shrink-0 là bắt buộc: Home xếp các Hero cạnh nhau trong một flex track và
 * trượt ngang bằng translateX, nếu để flex co lại thì mọi slide sẽ dồn vào
 * một khung hình.
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

      {/* tối bên trái để poster và chữ nổi lên */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/85 to-transparent" />
      {/* tối phía dưới để nối liền với nền trang */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

      <div className="relative mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-3 lg:px-20">
        {/* cột trái: poster dọc */}
        <div className="hidden self-stretch py-6 lg:flex lg:items-center lg:justify-center">
          <img
            src={`${POSTER_BASE}${movie.poster_path}`}
            alt={`Poster ${movie.title}`}
            className="h-full w-auto rounded-lg object-contain shadow-2xl shadow-black/70"
          />
        </div>

        {/* hai cột phải: tiêu đề và mô tả */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-3 text-sm text-neutral-300">
            <span className="font-semibold text-[#E50914]">★ {rating}</span>
            <span>{year}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Đang thịnh hành
            </span>
          </div>

          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {movie.title}
          </h1>

          <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base">
            {movie.overview || "Chưa có mô tả cho phim này."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {/* sang trang chi tiết của đúng phim đang hiện */}
            <Link
              to={`/movie/${movie.id}`}
              className="rounded bg-[#E50914] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#f6121d]"
            >
              Watch now
            </Link>

            <Link
              to="/discover"
              className="rounded border border-neutral-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
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
