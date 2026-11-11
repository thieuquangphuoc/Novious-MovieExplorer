import { discoverMovies, getMovieDetails } from "./api";
import frameDailyIds from "../data/frameDaily";

// FRAME BY FRAME — rules, film selection and saved progress

// Thriller and Adventure, as the brief asks. Joined with OR, not AND.
export const GAME_GENRES = [53, 12];
export const MIN_VOTES = 500;

export const TILES = 6;
export const MAX_ATTEMPTS = 6;

export const SCORES = [1000, 720, 500, 320, 180, 80];

export const scoreFor = (tilesOpen) => SCORES[Math.min(tilesOpen, SCORES.length) - 1] || 0;

// PICKING THE FILM

const playable = (movie) =>
  Boolean(movie) &&
  Boolean(movie.poster_path) &&
  Boolean(movie.backdrop_path) &&
  Boolean(movie.release_date) &&
  movie.release_date <= new Date().toISOString().slice(0, 10);

export const dayNumber = (date = new Date()) =>
  Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);

export const todayKey = (date = new Date()) => date.toISOString().slice(0, 10);

export const loadDailyMovie = async () => {
  const index = dayNumber() % frameDailyIds.length;
  const movie = await getMovieDetails(frameDailyIds[index]);

  if (playable(movie)) return movie;

  // a single dead id must not take the day's puzzle down with it
  for (let step = 1; step < frameDailyIds.length; step++) {
    const fallback = await getMovieDetails(
      frameDailyIds[(index + step) % frameDailyIds.length]
    );
    if (playable(fallback)) return fallback;
  }

  throw new Error("no playable daily film");
};

export const loadRandomMovie = async (exclude = []) => {
  for (let attempt = 0; attempt < 4; attempt++) {
    const page = 1 + Math.floor(Math.random() * 12);

    const { results } = await discoverMovies({
      genres: GAME_GENRES,
      minVotes: MIN_VOTES,
      sortBy: "popularity.desc",
      page,
    });

    const candidates = results.filter((m) => playable(m) && !exclude.includes(m.id));
    if (candidates.length === 0) continue;

    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    // the list response has no runtime or named genres; the reveal wants both
    const full = await getMovieDetails(pick.id);
    if (playable(full)) return full;
  }

  throw new Error("no playable film found");
};

// SAVED PROGRESS

const STATS_KEY = "novious-frame-stats";
const DAILY_KEY = "novious-frame-daily";
const SOUND_KEY = "novious-frame-sound";

const BLANK_STATS = {
  played: 0,
  solved: 0,
  bestScore: 0,
  streak: 0,
  bestStreak: 0,
  firstTryWins: 0,
  lastDailyDate: null,
};

export const readStats = () => {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? { ...BLANK_STATS, ...JSON.parse(raw) } : { ...BLANK_STATS };
  } catch {
    return { ...BLANK_STATS };
  }
};

const writeStats = (stats) => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // nothing to do; the session simply will not be remembered
  }
  return stats;
};

export const recordRound = ({ won, score, tilesOpen, isDaily }) => {
  const stats = readStats();

  const next = {
    ...stats,
    played: stats.played + 1,
    solved: won ? stats.solved + 1 : stats.solved,
    bestScore: Math.max(stats.bestScore, won ? score : 0),
    firstTryWins: won && tilesOpen === 1 ? stats.firstTryWins + 1 : stats.firstTryWins,
  };

  if (isDaily) {
    next.streak = won ? stats.streak + 1 : 0;
    next.bestStreak = Math.max(stats.bestStreak, next.streak);
    next.lastDailyDate = todayKey();
  }

  return writeStats(next);
};

export const readDailyProgress = () => {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // yesterday's result is not today's puzzle
    return saved.date === todayKey() ? saved : null;
  } catch {
    return null;
  }
};

export const writeDailyProgress = (progress) => {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify({ ...progress, date: todayKey() }));
  } catch {
    // ignored, as above
  }
};

export const readSoundPreference = () => {
  try {
    const saved = localStorage.getItem(SOUND_KEY);
    return saved === null ? true : saved === "on";
  } catch {
    return true;
  }
};

export const writeSoundPreference = (on) => {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    // ignored, as above
  }
};

// ACHIEVEMENTS

export const achievementsFor = (stats) => [
  {
    id: "first-frame",
    name: "First Frame Genius",
    detail: "Name a film from a single tile",
    earned: stats.firstTryWins > 0,
    progress: `${stats.firstTryWins} time${stats.firstTryWins === 1 ? "" : "s"}`,
  },
  {
    id: "detective",
    name: "Cinema Detective",
    detail: "Solve ten films",
    earned: stats.solved >= 10,
    progress: `${Math.min(stats.solved, 10)} / 10`,
  },
  {
    id: "perfect-streak",
    name: "Perfect Streak",
    detail: "Win the daily five days running",
    earned: stats.bestStreak >= 5,
    progress: `${Math.min(stats.bestStreak, 5)} / 5`,
  },
];
