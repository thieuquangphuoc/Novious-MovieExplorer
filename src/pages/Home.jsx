import { useState, useEffect } from "react";
import { getHeroMovies } from "../services/api";
import Hero from "../components/Hero";

const SLIDE_MS = 4000;   // 4 giây tự chuyển một lần
const HERO_COUNT = 6;

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [index, setIndex] = useState(0);

  // nạp danh sách phim cho hero, chỉ một lần khi mở trang
  useEffect(() => {
    const load = async () => {
      const data = await getHeroMovies(HERO_COUNT);
      setMovies(data);
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
    if (movies.length === 0) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % movies.length);
    }, SLIDE_MS);

    return () => clearInterval(timer);
  }, [movies.length, index]);

  const goPrev = () => setIndex((index - 1 + movies.length) % movies.length);
  const goNext = () => setIndex((index + 1) % movies.length);

  // khung xám giữ đúng chiều cao hero để trang không bị giật khi ảnh về
  if (movies.length === 0) {
    return <div className="h-[80vh] min-h-[520px] w-full animate-pulse bg-[#1c1c1c]" />;
  }

  return (
    <div className="group relative overflow-hidden">
      {/* track chứa tất cả slide, trượt ngang bằng translateX */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {movies.map((movie) => (
          <Hero key={movie.id} movie={movie} />
        ))}
      </div>

      <button
        onClick={goPrev}
        aria-label="Phim trước"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white opacity-60 transition hover:bg-[#E50914] hover:opacity-100 focus:opacity-100"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goNext}
        aria-label="Phim tiếp theo"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white opacity-60 transition hover:bg-[#E50914] hover:opacity-100 focus:opacity-100"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* chấm tròn cho biết đang ở slide nào, bấm được để nhảy thẳng */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {movies.map((movie, i) => (
          <button
            key={movie.id}
            onClick={() => setIndex(i)}
            aria-label={`Chuyển tới ${movie.title}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-8 bg-[#E50914]" : "w-4 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
