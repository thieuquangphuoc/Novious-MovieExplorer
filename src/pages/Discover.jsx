import { useState, useEffect } from "react";
import { searchMovies, getTrending } from "../services/api";
import MovieCard from "../components/MovieCard";

const IMG_ORIGINAL = "https://image.tmdb.org/t/p/original";

function Discover() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [heroBackdrop, setHeroBackdrop] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // chạy 1 lần khi mở trang: lấy trending cho lưới mặc định + ảnh nền hero
  useEffect(() => {
    const loadTrending = async () => {
      setLoading(true);
      const results = await getTrending();
      setMovies(results);
      if (results.length > 0 && results[0].backdrop_path) {
        setHeroBackdrop(`${IMG_ORIGINAL}${results[7].backdrop_path}`);
      }
      setLoading(false);
    };
    loadTrending();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (query.trim() === "") return;
    setLoading(true);
    const results = await searchMovies(query);
    setMovies(results);
    setSearched(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#141414]">

      {/* ===== HERO: ảnh phim làm nền + thanh search ở giữa ===== */}
      <section
        className="relative flex h-[55vh] min-h-[360px] items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: heroBackdrop ? `url(${heroBackdrop})` : "none" }}
      >
        {/* lớp phủ tối, tan dần xuống màu nền trang */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-[#141414]" />

        <div className="relative z-10 mx-auto w-full max-w-2xl px-4 text-center">
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Discover <span className="text-[#E50914]">Movies</span>
          </h1>
          <p className="mb-7 text-sm text-neutral-300 sm:text-base">
            Search thousands of films, powered by TMDB.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a movie..."
              className="flex-1 rounded-md border border-neutral-600 bg-black/60 px-4 py-3 text-white placeholder-neutral-400 outline-none backdrop-blur focus:border-[#E50914]"
            />
            <button
              type="submit"
              className="rounded-md bg-[#E50914] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#f6121d]"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ===== LƯỚI KẾT QUẢ ===== */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-bold text-white">
          {searched ? `Results for "${query}"` : "Trending this week"}
        </h2>

        {loading ? (
          <p className="py-20 text-center text-neutral-400">Loading...</p>
        ) : movies.length === 0 ? (
          <p className="py-20 text-center text-neutral-400">No movies found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Discover;