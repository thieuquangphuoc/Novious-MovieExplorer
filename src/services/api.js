const KEY = import.meta.env.VITE_TMDB_KEY;
const BASE = "https://api.themoviedb.org/3";

// id thể loại Horror của TMDB — hero không bao giờ dùng phim kinh dị
const HORROR_ID = 27;

export const getTrending = async (timeWindow = "week") => {
  try {
    const res = await fetch(`${BASE}/trending/movie/${timeWindow}?api_key=${KEY}`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.log("getTrending error:", error);
    return [];
  }
};

export const searchMovies = async (query) => {
    try {
        const res = await fetch(`${BASE}/search/movie?query=${encodeURIComponent(query)}&api_key=${KEY}`);
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        return data.results;

    } catch (error) {
        console.log(error);
        return []
    }
};

/*
 * Danh sách phim cho hero slideshow ở trang chủ.
 *
 * Lấy trending của tuần, bỏ phim kinh dị và phim thiếu ảnh (backdrop hoặc
 * poster null thì hero sẽ vỡ layout), rồi ghim Spider-Man lên đầu. Tuần nào
 * Spider-Man rớt khỏi trending thì tìm riêng bằng searchMovies, để hero luôn
 * có phim này.
 */
export const getHeroMovies = async (count = 6) => {
  const trending = await getTrending("week");

  const usable = trending.filter(
    (movie) =>
      !movie.genre_ids.includes(HORROR_ID) && movie.backdrop_path && movie.poster_path
  );

  let spiderMan = usable.find((movie) => movie.title.includes("Spider-Man"));

  if (!spiderMan) {
    const results = await searchMovies("Spider-Man");
    spiderMan = results.find(
      (movie) =>
        !movie.genre_ids.includes(HORROR_ID) && movie.backdrop_path && movie.poster_path
    );
  }

  if (!spiderMan) return usable.slice(0, count);

  const others = usable.filter((movie) => movie.id !== spiderMan.id);
  return [spiderMan, ...others].slice(0, count);
};

export const getGenres = async () => {
  try {
    const res = await fetch(`${BASE}/genre/movie/list?api_key=${KEY}`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return data.genres;           // [{ id, name }]
  } catch (error) {
    console.log("getGenres error:", error);
    return [];
  }
};