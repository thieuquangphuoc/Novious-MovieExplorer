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

/*
 * Films released inside one decade, most popular first.
 *
 * /discover is the only endpoint that filters by release date, and it takes
 * a full date on both ends rather than a year, hence the 1st of January to
 * the 31st of December.
 *
 * vote_count.gte keeps out the long tail of titles nobody has rated, which
 * on the older decades is most of what /discover returns. The threshold is
 * deliberately low: a 1920s film with forty votes is a classic, while the
 * same number in the 2020s would be nothing — sorting by popularity sorts
 * that difference out on its own.
 */
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

/*
 * One film for The ONE Movie Challenge.
 *
 * Everything the questionnaire asks becomes a /discover filter, so the
 * answer really is drawn from films that match — not a popular title with
 * a label stuck on it afterwards.
 *
 * Genre ids are joined with a pipe, not a comma: a comma means AND, which
 * for Thrilled would demand a film that is Thriller *and* Action and throw
 * away three quarters of the catalogue.
 *
 * `safe` is the Play It Safe / Surprise Me switch. Safe asks for films with
 * a large audience behind them and sorts by popularity. Surprise narrows to
 * a band of modest vote counts — enough that the score means something, few
 * enough that the film is not famous — and sorts by rating instead.
 *
 * That band starts at 150 rather than a few dozen. Lower down it fills with
 * shorts and direct-to-video oddities that technically carry the right
 * genre and a flattering average from a handful of votes; the point of
 * Surprise Me is an overlooked film, not an obscure one.
 *
 * A random page is picked so that asking twice does not return the same
 * twenty films, and `exclude` drops anything already shown in this session.
 */
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

/*
 * The Discover page's filtered browse.
 *
 * /discover is the only endpoint that takes filters — genre, year, score,
 * sort order. /search takes none of them: it matches a title and returns
 * whatever it finds, which is why the page falls back to filtering search
 * results in the browser and says so on screen.
 *
 * Genre ids are joined with a pipe (OR) rather than a comma (AND), so
 * picking Action and Comedy means "either", not "a film that is both".
 *
 * vote_count.gte is not something the page exposes. Without it, sorting
 * by score returns obscure films with a single ten-star vote; with it,
 * the ordering means something. It scales with the sort so that browsing
 * by popularity is not needlessly narrowed.
 */
export const discoverMovies = async ({
  genres = [],
  yearFrom = null,
  yearTo = null,
  minRating = 0,
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
    sortBy.startsWith("vote_average") ? "&vote_count.gte=300" : "&vote_count.gte=20",
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
