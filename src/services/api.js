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
 * Everything TMDB holds about one film: runtime, budget, revenue, tagline,
 * genre names and so on. None of these fields appear in /trending or
 * /search, so this endpoint has to be called separately by id.
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

// The cast of one film: name, character, profile_path.
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
 * The films shown in the hero carousel on the home page.
 *
 * Which films they are is chosen by hand in src/data/heroMovies.js; that
 * file holds nothing but TMDB ids.
 *
 * Promise.all fetches them all at once rather than one after another. A bad
 * id makes getMovieDetails return null, and the filter at the end drops it,
 * so a single typo cannot empty the whole carousel.
 */
export const getHeroMovies = async () => {
  const movies = await Promise.all(heroMovieIds.map((id) => getMovieDetails(id)));
  return movies.filter((movie) => movie !== null && movie.backdrop_path && movie.poster_path);
};

// The highest rated films of all time, used by the second row on the home page.
export const getTopRated = async () => {
  try {
    const res = await fetch(`${BASE}/movie/top_rated?api_key=${KEY}`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.log("getTopRated error:", error);
    return [];
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