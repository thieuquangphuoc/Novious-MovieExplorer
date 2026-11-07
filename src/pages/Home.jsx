import { useState, useEffect } from "react";
import { getHeroMovies, getTrending, getTopRated } from "../services/api";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";
import TopTenRow from "../components/TopTenRow";

const SLIDE_MS = 4000;   // 4 giây tự chuyển một lần

const Home = () => {
  const [heroMovies, setHeroMovies] = useState([]);
  const [index, setIndex] = useState(0);

  const [trendingWeek, setTrendingWeek] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [trendingDay, setTrendingDay] = useState([]);

  /*
   * Nạp dữ liệu cho cả trang, chỉ một lần khi mở.
   *
   * Bốn lời gọi chạy song song bằng Promise.all vì chúng không phụ thuộc
   * nhau — chờ lần lượt sẽ lâu gấp bốn mà chẳng được gì.
   */
  useEffect(() => {
    const load = async () => {
      const [hero, week, rated, day] = await Promise.all([
        getHeroMovies(),
        getTrending("week"),
        getTopRated(),
        getTrending("day"),
      ]);
      setHeroMovies(hero);
      setTrendingWeek(week);
      setTopRated(rated);
      setTrendingDay(day);
    };
    load();
  }, []);

  /*
   * Đồng hồ tự chuyển slide.
   *
   * index nằm trong dependency array nên mỗi lần người dùng bấm mũi tên,
   * effect chạy lại: đồng hồ cũ bị clearInterval và đếm lại từ đầu 4 giây.
   * Nếu không làm vậy, bấm mũi tên xong có thể bị nhảy tiếp ngay lập tức
   * vì đồng hồ cũ sắp hết giờ.
   */
  useEffect(() => {
    if (heroMovies.length === 0) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroMovies.length);
    }, SLIDE_MS);

    return () => clearInterval(timer);
  }, [heroMovies.length, index]);

  const goPrev = () => setIndex((index - 1 + heroMovies.length) % heroMovies.length);
  const goNext = () => setIndex((index + 1) % heroMovies.length);

  return (
    <div>
      {/* ===== HERO SLIDESHOW ===== */}
      {heroMovies.length === 0 ? (
        // khung xám giữ đúng chiều cao hero để trang không bị giật khi ảnh về
        <div className="h-[60vh] max-h-[600px] min-h-[420px] w-full animate-pulse bg-[#1c1c1c]" />
      ) : (
        <div className="relative overflow-hidden">
          {/* track chứa tất cả slide, trượt ngang bằng translateX */}
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {heroMovies.map((movie) => (
              <Hero key={movie.id} movie={movie} />
            ))}
          </div>

          <button
            onClick={goPrev}
            aria-label="Previous movie"
            className="absolute bottom-4 left-4 rounded-full bg-black/50 p-2 text-white opacity-60 transition hover:bg-[#E50914] hover:opacity-100 focus:opacity-100 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:p-3"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goNext}
            aria-label="Next movie"
            className="absolute bottom-4 right-4 rounded-full bg-black/50 p-2 text-white opacity-60 transition hover:bg-[#E50914] hover:opacity-100 focus:opacity-100 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:p-3"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* chấm tròn cho biết đang ở slide nào, bấm được để nhảy thẳng */}
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {heroMovies.map((movie, i) => (
              <button
                key={movie.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to ${movie.title}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-[#E50914]" : "w-4 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ===== CÁC HÀNG PHIM ===== */}
      <MovieRow title="Trending this week" movies={trendingWeek} duration="60s" />
      <MovieRow title="Top rated of all time" movies={topRated} duration="75s" />
      <TopTenRow title="Top 10 today" movies={trendingDay} />
    </div>
  );
};

export default Home;
