import heroMovieIds from "../data/heroMovies";

const KEY = import.meta.env.VITE_TMDB_KEY;
const BASE = "https://api.themoviedb.org/3";

const fetchPages = async (path, pages, extraParams = "") => {
  const requests = [];

  for (let page = 1; page <= pages; page++) {
    requests.push(
      fetch(`${BASE}${path}?api_key=${KEY}&page=${page}${extraParams}`)
        .then((res) => {
          if (!res.ok) throw new Error(res.status);
          return res.json();
        })
        .then((data) => data.results)
        .catch((error) => {
          console.log(`fetchPages ${path} page ${page} error:`, error);
          return [];
        })
    );
  }

  const all = (await Promise.all(requests)).flat();

  const seen = new Set();
  return all.filter((movie) => {
    if (seen.has(movie.id)) return false;
    seen.add(movie.id);
    return true;
  });
};

export const getTrending = async (timeWindow = "week", pages = 1) =>
  fetchPages(`/trending/movie/${timeWindow}`, pages);

export const getMoviesByDecade = async (startYear, pages = 2) => {
  const range =
    `&primary_release_date.gte=${startYear}-01-01` +
    `&primary_release_date.lte=${startYear + 9}-12-31`;
  const filters = "&sort_by=popularity.desc&vote_count.gte=30&include_adult=false";

  const movies = await fetchPages("/discover/movie", pages, range + filters);
  return movies.filter((movie) => movie.poster_path);
};

// category: popular | now_playing | upcoming | top_rated
export const getMovieList = async (category, pages = 1) =>
  fetchPages(`/movie/${category}`, pages);

// The highest rated films of all time, used by the second row on the home page.
export const getTopRated = async (pages = 1) => getMovieList("top_rated", pages);

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

export const getTrailerKey = async (id) => {
  try {
    const res = await fetch(`${BASE}/movie/${id}/videos?api_key=${KEY}`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();

    const youtube = data.results.filter((video) => video.site === "YouTube");

    const pick =
      youtube.find((video) => video.type === "Trailer" && video.official) ||
      youtube.find((video) => video.type === "Trailer") ||
      youtube.find((video) => video.type === "Teaser") ||
      youtube[0];

    return pick ? pick.key : null;
  } catch (error) {
    console.log("getTrailerKey error:", error);
    return null;
  }
};

export const getMoviesWithTrailers = async (category, count = 12) => {
  const movies = await getMovieList(category, 1);
  const shortlist = movies.filter((movie) => movie.backdrop_path).slice(0, count);

  const keys = await Promise.all(shortlist.map((movie) => getTrailerKey(movie.id)));

  return shortlist
    .map((movie, index) => ({ ...movie, trailerKey: keys[index] }))
    .filter((movie) => movie.trailerKey !== null);
};

const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const getHeroMovies = async (count = 10) => {
  const chosen = shuffle(heroMovieIds).slice(0, count + 4);

  const movies = await Promise.all(chosen.map((id) => getMovieDetails(id)));

  return movies
    .filter((movie) => movie !== null && movie.backdrop_path && movie.poster_path)
    .slice(0, count);
};

export const discoverOneMovie = async ({ genres, maxRuntime, safe, exclude = [] }) => {
  const parts = [
    `${BASE}/discover/movie?api_key=${KEY}`,
    "&include_adult=false&vote_average.gte=6.8",
    genres.length ? `&with_genres=${genres.join("%7C")}` : "",
    maxRuntime ? `&with_runtime.lte=${maxRuntime}` : "",
    safe
      ? "&vote_count.gte=800&sort_by=popularity.desc"
      : "&vote_count.gte=150&vote_count.lte=1500&sort_by=vote_average.desc",
  ];
  const query = parts.join("");

  try {
    const first = await fetch(`${query}&page=1`);
    if (!first.ok) throw new Error(first.status);
    const head = await first.json();

    if (head.total_results === 0) return null;

    // stay inside the pages worth reading; past five the quality falls away
    const lastPage = Math.min(head.total_pages, 5);
    const page = 1 + Math.floor(Math.random() * lastPage);

    let pool = head.results;
    if (page !== 1) {
      const res = await fetch(`${query}&page=${page}`);
      if (!res.ok) throw new Error(res.status);
      pool = (await res.json()).results;
    }

    const usable = pool.filter(
      (movie) => movie.backdrop_path && movie.poster_path && !exclude.includes(movie.id)
    );
    const choices = usable.length > 0 ? usable : pool.filter((movie) => movie.poster_path);
    if (choices.length === 0) return null;

    return choices[Math.floor(Math.random() * choices.length)];
  } catch (error) {
    console.log("discoverOneMovie error:", error);
    throw error;
  }
};

export const discoverMovies = async ({
  genres = [],
  yearFrom = null,
  yearTo = null,
  minRating = 0,
  minVotes = null,
  sortBy = "popularity.desc",
  page = 1,
} = {}) => {
  const parts = [
    `${BASE}/discover/movie?api_key=${KEY}&include_adult=false`,
    `&page=${page}`,
    `&sort_by=${sortBy}`,
    genres.length ? `&with_genres=${genres.join("%7C")}` : "",
    yearFrom ? `&primary_release_date.gte=${yearFrom}-01-01` : "",
    yearTo ? `&primary_release_date.lte=${yearTo}-12-31` : "",
    minRating > 0 ? `&vote_average.gte=${minRating}` : "",
    minVotes
      ? `&vote_count.gte=${minVotes}`
      : sortBy.startsWith("vote_average")
        ? "&vote_count.gte=300"
        : "&vote_count.gte=20",
  ];

  try {
    const res = await fetch(parts.join(""));
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return {
      results: data.results,
      total: data.total_results,
      // TMDB refuses any page above 500, whatever it reports here
      totalPages: Math.min(data.total_pages || 1, 500),
    };
  } catch (error) {
    console.log("discoverMovies error:", error);
    return { results: [], total: 0, totalPages: 1 };
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
