import { getMovieList, getTrending, getMovieDetails, getGenres } from "./api";

// THE DATASET BEHIND CINEMA DECODED

const TOP_RATED_PAGES = 2;
const POPULAR_PAGES = 2;

export const MIN_CREDIBLE_BUDGET = 1_000_000;

export const MIN_CREDIBLE_REVENUE = 100_000;

// Films whose money figures can be plotted without distorting the scale.
export const hasCredibleMoney = (movie) =>
  Boolean(movie.revenue) && movie.revenue >= MIN_CREDIBLE_REVENUE;

let cache = null;

const shape = (movie) => {
  const year = movie.release_date ? Number(movie.release_date.slice(0, 4)) : null;

  return {
    id: movie.id,
    title: movie.title,
    year,
    decade: year ? Math.floor(year / 10) * 10 : null,
    poster: movie.poster_path,
    backdrop: movie.backdrop_path,
    rating: movie.vote_average || 0,
    votes: movie.vote_count || 0,
    popularity: movie.popularity || 0,
    runtime: movie.runtime || null,
    // 0 means "nobody has filled this in", not "this film earned nothing"
    budget: movie.budget > 0 ? movie.budget : null,
    revenue: movie.revenue > 0 ? movie.revenue : null,
    genres: (movie.genres || []).map((genre) => genre.name),
    countries: (movie.production_countries || []).map((country) => country.name),
    overview: movie.overview || "",
  };
};

export const loadInsightDataset = () => {
  if (cache) return cache;

  cache = (async () => {
    const [topRated, popular, trending, genreList] = await Promise.all([
      getMovieList("top_rated", TOP_RATED_PAGES),
      getMovieList("popular", POPULAR_PAGES),
      getTrending("week", 1),
      getGenres(),
    ]);

    const seen = new Set();
    const ids = [];
    [...topRated, ...popular, ...trending].forEach((movie) => {
      if (!seen.has(movie.id)) {
        seen.add(movie.id);
        ids.push(movie.id);
      }
    });

    const details = await Promise.all(ids.map((id) => getMovieDetails(id)));
    const movies = details.filter(Boolean).map(shape);

    if (movies.length === 0) throw new Error("empty dataset");

    return { movies, genreList };
  })();

  // a failed build must not be cached, or the page can never recover
  cache.catch(() => {
    cache = null;
  });

  return cache;
};

// DERIVED STATISTICS

export const headlineStats = (movies) => {
  const withMoney = movies.filter((m) => m.revenue);
  const rated = movies.filter((m) => m.rating > 0);

  const grossTotal = withMoney.reduce((sum, m) => sum + m.revenue, 0);
  const averageRating =
    rated.reduce((sum, m) => sum + m.rating, 0) / Math.max(rated.length, 1);

  const years = movies.map((m) => m.year).filter(Boolean);
  const runtimes = movies.map((m) => m.runtime).filter(Boolean);

  return {
    filmCount: movies.length,
    averageRating,
    grossTotalBillions: grossTotal / 1_000_000_000,
    medianRuntime: median(runtimes),
    earliestYear: Math.min(...years),
    latestYear: Math.max(...years),
    // how much of the set TMDB actually has money for — stated, not hidden
    moneyCoverage: Math.round((withMoney.length / movies.length) * 100),
  };
};

const median = (numbers) => {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

// Every genre present in the set, most common first — drives the filters.
export const genresInSet = (movies) => {
  const counts = new Map();
  movies.forEach((movie) =>
    movie.genres.forEach((name) => counts.set(name, (counts.get(name) || 0) + 1))
  );
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
};

export const withReturnMultiple = (movies) =>
  movies
    .filter(
      (m) =>
        m.budget &&
        m.budget >= MIN_CREDIBLE_BUDGET &&
        m.revenue &&
        m.revenue >= MIN_CREDIBLE_REVENUE
    )
    .map((m) => ({ ...m, multiple: m.revenue / m.budget }))
    .sort((a, b) => b.multiple - a.multiple);

export const hiddenGems = (movies, { minRating = 7.5, limit = 8 } = {}) => {
  const voteCounts = movies.map((m) => m.votes).filter(Boolean);
  if (voteCounts.length === 0) return { gems: [], voteThreshold: 0 };

  const sorted = [...voteCounts].sort((a, b) => a - b);
  const voteThreshold = sorted[Math.floor(sorted.length * 0.4)];

  const gems = movies
    .filter((m) => m.rating >= minRating && m.votes > 0 && m.votes <= voteThreshold)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);

  return { gems, voteThreshold };
};

export const genreByDecade = (movies, genreNames) => {
  const decades = [...new Set(movies.map((m) => m.decade).filter(Boolean))].sort(
    (a, b) => a - b
  );

  return decades.map((decade) => {
    const inDecade = movies.filter((m) => m.decade === decade);
    const totalTags = inDecade.reduce((sum, m) => sum + m.genres.length, 0);

    const row = { decade, label: `${decade}s`, films: inDecade.length };

    genreNames.forEach((name) => {
      const tagged = inDecade.filter((m) => m.genres.includes(name)).length;
      row[name] = totalTags > 0 ? Math.round((tagged / totalTags) * 1000) / 10 : 0;
    });

    return row;
  });
};
