import heroMovieIds from "../data/heroMovies";

const KEY = import.meta.env.VITE_TMDB_KEY;
const BASE = "https://api.themoviedb.org/3";

/*
 * TMDB hands back twenty films per page, which is nowhere near enough for a
 * row the visitor is meant to keep dragging through. This helper asks for
 * several pages at once and glues the results together.
 *
 * The pages are fetched in parallel, so five pages cost about as much time
 * as one. A page that fails comes back as an empty list and is simply
 * skipped, rather than taking the whole row down with it.
 *
 * Deduplication matters: the same film can appear on more than one page as
 * TMDB reorders its lists between requests, and React would then warn about
 * two children sharing a key.
 */
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
 * The YouTube key of a film's trailer, or null when TMDB has no video.
 *
 * /movie/{id}/videos returns a mixed bag — trailers, teasers, clips,
 * featurettes, behind-the-scenes — in no useful order, and plenty of films
 * have everything except an actual trailer. So the list is searched in
 * order of preference: an official trailer first, then any trailer, then a
 * teaser, and only then whatever YouTube video is left.
 *
 * Anything not hosted on YouTube is dropped, because the player embedded in
 * TrailerModal is a YouTube iframe.
 */
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

/*
 * A category of films that definitely have a trailer to play.
 *
 * The video list lives behind a separate request per film, so the films are
 * fetched first and then their trailers all at once. Films TMDB has no
 * video for are dropped — a play button that plays nothing is worse than
 * one fewer card.
 */
export const getMoviesWithTrailers = async (category, count = 12) => {
  const movies = await getMovieList(category, 1);
  const shortlist = movies.filter((movie) => movie.backdrop_path).slice(0, count);

  const keys = await Promise.all(shortlist.map((movie) => getTrailerKey(movie.id)));

  return shortlist
    .map((movie, index) => ({ ...movie, trailerKey: keys[index] }))
    .filter((movie) => movie.trailerKey !== null);
};

/*
 * Fisher-Yates shuffle on a copy of the array.
 *
 * The copy matters: heroMovieIds is a module-level import shared by every
 * caller, and shuffling it where it lies would quietly reorder it for the
 * rest of the session.
 */
const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/*
 * The films shown in the hero carousel on the home page.
 *
 * The pool of candidates is chosen by hand in src/data/heroMovies.js; that
 * file holds nothing but TMDB ids. The pool is shuffled on every load and
 * only `count` films are kept, so the carousel is a different line-up each
 * time somebody opens the page.
 *
 * A few more than `count` are fetched, because a film can be dropped for
 * missing a backdrop or a poster; without that margin an unlucky draw
 * would leave the carousel short. The extras are discarded afterwards.
 *
 * Promise.all fetches them at once rather than one after another. A bad id
 * makes getMovieDetails return null and is filtered out, so a typo in the
 * pool cannot empty the carousel.
 */
export const getHeroMovies = async (count = 10) => {
  const chosen = shuffle(heroMovieIds).slice(0, count + 4);

  const movies = await Promise.all(chosen.map((id) => getMovieDetails(id)));

  return movies
    .filter((movie) => movie !== null && movie.backdrop_path && movie.poster_path)
    .slice(0, count);
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
