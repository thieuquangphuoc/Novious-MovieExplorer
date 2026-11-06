const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

/*
 * Một slide của hero slideshow trên trang chủ.
 *
 * Backdrop phủ kín nền, hai lớp gradient tối dần về bên trái và xuống đáy để
 * chữ trắng luôn đọc được dù ảnh nền sáng hay tối. Poster dọc chỉ hiện từ
 * màn hình lớn trở lên — ở điện thoại nó sẽ chiếm hết chỗ của phần chữ.
 *
 * shrink-0 là bắt buộc: Home xếp các Hero cạnh nhau trong một flex track và
 * trượt ngang bằng translateX, nếu để flex co lại thì mọi slide sẽ dồn vào
 * một khung hình.
 */
const Hero = ({ movie }) => {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  return (
    <section className="relative h-[80vh] min-h-[520px] w-full shrink-0 overflow-hidden">
      <img
        src={`${BACKDROP_BASE}${movie.backdrop_path}`}
        alt={movie.title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* tối bên trái để phần chữ nổi lên */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/85 to-transparent" />
      {/* tối phía dưới để nối liền với nền trang */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

      <div className="relative mx-auto flex h-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#E50914]">
            Đang thịnh hành
          </p>

          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {movie.title}
          </h1>

          <div className="mt-4 flex items-center gap-4 text-sm text-neutral-300">
            <span className="font-semibold text-[#E50914]">★ {rating}</span>
            <span>{year}</span>
            <span className="rounded border border-neutral-600 px-2 py-0.5 text-xs text-neutral-400">
              TMDB
            </span>
          </div>

          <p className="mt-5 line-clamp-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
            {movie.overview || "Chưa có mô tả cho phim này."}
          </p>
        </div>

        <img
          src={`${POSTER_BASE}${movie.poster_path}`}
          alt={`Poster ${movie.title}`}
          className="hidden w-56 rounded-lg shadow-2xl shadow-black/70 lg:block"
        />
      </div>
    </section>
  );
};

export default Hero;
