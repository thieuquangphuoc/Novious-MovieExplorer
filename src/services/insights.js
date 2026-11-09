import { getMovieList, getTrending, getMovieDetails, getGenres } from "./api";

/*
 * ====================================================================
 *  THE DATASET BEHIND CINEMA DECODED
 * ====================================================================
 *
 * Everything the Insights page draws comes from one dataset, built once
 * and reused. This file assembles it and derives the statistics; the
 * components only lay them out.
 *
 * Why it has to be built rather than fetched:
 *
 * TMDB's list endpoints (/popular, /top_rated, /trending) return twenty
 * films each with a summary — title, poster, rating, vote count. They do
 * NOT return budget, revenue, runtime or production countries. Those four
 * only exist on /movie/{id}, one request per film. Half of this page is
 * about money, so the page has no choice but to make that call for every
 * film in the set.
 *
 * Eighty-odd requests is a lot to repeat, so the whole thing is cached in
 * a module-level promise: the first component to ask starts the work, and
 * every later visit to the page — including navigating away and back —
 * gets the same resolved array without touching the network again.
 */

const TOP_RATED_PAGES = 2;
const POPULAR_PAGES = 2;

/*
 * Films with a recorded budget below this are excluded from anything that
 * divides by budget.
 *
 * TMDB's budget field is community-entered and frequently wrong at the low
 * end — a film will carry a placeholder of a few thousand dollars against
 * a real worldwide gross, which produces a "return multiple" of 700x and
 * swamps every honest number on the chart. One million is low enough to
 * keep genuinely cheap films and high enough to drop the typos.
 */
export const MIN_CREDIBLE_BUDGET = 1_000_000;

/*
 * The same problem at the other end: a recorded worldwide gross this
 * small is a placeholder, not a result.
 *
 * One film in this set carries a gross of seven dollars. On a logarithmic
 * money axis that single point drags the scale down three decades, so the
 * fifty-six real films are squeezed into the top third of the chart and
 * the rest is empty space. A hundred thousand is below any film that
 * actually reached a cinema and above every typo.
 */
export const MIN_CREDIBLE_REVENUE = 100_000;

// Films whose money figures can be plotted without distorting the scale.
export const hasCredibleMoney = (movie) =>
  Boolean(movie.revenue) && movie.revenue >= MIN_CREDIBLE_REVENUE;

let cache = null;

/*
 * Normalise one TMDB detail response into the shape the charts want.
 *
 * Done once here rather than in each chart: a scatter plot should not be
 * parsing dates, and a tooltip should not have to know that `genres` is a
 * list of objects on a detail response but a list of ids on a list one.
 */
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

/*
 * Build the dataset.
 *
 * Three lists are merged — the best rated of all time, what is popular now
 * and what is trending this week — because any one of them alone skews the
 * answers. Top rated is all old classics with modest budgets; popular is
 * all current blockbusters. Together they cover seventy years and both
 * ends of the money.
 */
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

/* ====================================================================
 *  DERIVED STATISTICS
 *  Pure functions over the dataset. No fetching, no React.
 * ==================================================================== */

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

/*
 * Return multiple: worldwide gross divided by production budget.
 *
 * This is NOT profit. It ignores marketing, which on a wide release can
 * match the production budget, and the roughly half of every ticket that
 * stays with the cinema. A film needs somewhere above 2x just to break
 * even, which is why the chart draws that line rather than 1x.
 */
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

/*
 * Hidden gems: rated well, seen by comparatively few.
 *
 * The vote threshold is a quartile of the set rather than a fixed number,
 * so the definition travels — on a dataset of blockbusters "few votes"
 * means something very different than on a dataset of festival films.
 */
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

/*
 * Share of each genre, decade by decade.
 *
 * Counted by tag, not by film: a film listed as Action and Adventure adds
 * one to each. So the percentages answer "of all the genre labels in this
 * decade, how many were Action", which is the honest reading of a dataset
 * where films carry several genres at once.
 */
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
