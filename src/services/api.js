const KEY = import.meta.env.VITE_TMDB_KEY;
const BASE = "https://api.themoviedb.org/3";

export const getTrending = async () => {
    try {
        const res = await fetch(`${BASE}/trending/movie/week?api_key=${KEY}`);
        if (!res.ok) {
            throw new Error(res.status);
        }
        const data = await res.json();
        return data.results;

    } catch (error) {
        console.log(error)
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