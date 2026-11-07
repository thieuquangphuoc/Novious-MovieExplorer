import heroMovieIds from "../data/heroMovies";

const KEY = import.meta.env.VITE_TMDB_KEY;
const BASE = "https://api.themoviedb.org/3";

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
 * Thông tin đầy đủ của một phim: runtime, ngân sách, doanh thu, tagline,
 * tên thể loại... Những trường này KHÔNG có trong /trending hay /search,
 * bắt buộc phải gọi riêng theo id.
 */
export const getMovieDetails = async (id) => {
  try {
    const res = await fetch(`${BASE}/movie/${id}?api_key=${KEY}`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return data;
  } catch (error) {
    console.log("getMovieDetails error:", error);
    return null;
  }
};

// Dàn diễn viên của một phim: name, character, profile_path.
export const getMovieCredits = async (id) => {
  try {
    const res = await fetch(`${BASE}/movie/${id}/credits?api_key=${KEY}`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return data.cast;
  } catch (error) {
    console.log("getMovieCredits error:", error);
    return [];
  }
};

/*
 * Danh sách phim cho hero slideshow ở trang chủ.
 *
 * Phim do người dùng tự chọn trong src/data/heroMovies.js — file đó chỉ
 * chứa id, xem hướng dẫn lấy id ngay trong file.
 *
 * Promise.all gọi song song tất cả, nhanh hơn nhiều so với chờ từng phim
 * một. Phim nào lỗi thì getMovieDetails trả về null, lọc bỏ ở bước cuối
 * để một id gõ sai không làm trống cả hero.
 */
export const getHeroMovies = async () => {
  const movies = await Promise.all(heroMovieIds.map((id) => getMovieDetails(id)));
  return movies.filter((movie) => movie !== null && movie.backdrop_path && movie.poster_path);
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