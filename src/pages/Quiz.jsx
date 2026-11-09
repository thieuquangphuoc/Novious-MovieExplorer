import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  TILES,
  MAX_ATTEMPTS,
  scoreFor,
  loadDailyMovie,
  loadRandomMovie,
  readStats,
  recordRound,
  readDailyProgress,
  writeDailyProgress,
  readSoundPreference,
  writeSoundPreference,
  achievementsFor,
} from "../services/frameGame";
import {
  playClick,
  playWhoosh,
  playWrong,
  playCorrect,
  playImpact,
  startHeartbeat,
} from "../services/sound";
import FrameBoard from "../components/quiz/FrameBoard";
import GuessInput from "../components/quiz/GuessInput";
import StarRating from "../components/common/StarRating";

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

const shuffledTiles = () => {
  const order = Array.from({ length: TILES }, (unused, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

const Stat = ({ value, label }) => (
  <div>
    <p className="text-2xl font-bold tabular-nums text-white sm:text-3xl">{value}</p>
    <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-neutral-500">{label}</p>
  </div>
);

/*
 * FRAME BY FRAME — one frame, one movie.
 *
 * A still from a Thriller or Adventure film sits under six tiles. Every
 * wrong guess, and every hint asked for, removes one. Six tiles, six
 * guesses, and the score falls the longer it takes.
 *
 * Two things the implementation is careful about:
 *
 * - Guesses are matched on TMDB id, never on what was typed. Titles are
 *   a minefield of punctuation and re-releases, and GuessInput therefore
 *   makes the player pick from the list rather than trusting free text.
 * - The answer is never in the DOM while a round is live. The backdrop is
 *   loaded up front, but it is covered by opaque tiles, and the title,
 *   poster and year are not rendered at all until the round ends.
 *
 * Daily picks one film per UTC day from a fixed rota, so everybody gets
 * the same puzzle and a refresh cannot reroll it. Unlimited draws a
 * random film from a random page and remembers what it has already used.
 */
const Quiz = () => {
  const [mode, setMode] = useState("daily");
  // bumped to start a fresh film without changing mode
  const [round, setRound] = useState(0);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const [openTiles, setOpenTiles] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [status, setStatus] = useState("playing");   // playing | won | lost

  /*
   * The finished round, frozen at the moment it ended.
   *
   * It cannot be recomputed from openTiles afterwards: winning opens all
   * six tiles so the still can be seen, so reading the count back gives
   * six every time. A two-tile win was being announced as a six-tile one
   * worth eighty points while the saved score correctly said 720.
   */
  const [result, setResult] = useState(null);

  const [stats, setStats] = useState(readStats);
  const [sound, setSound] = useState(readSoundPreference);
  const [dailyDone, setDailyDone] = useState(() => readDailyProgress());

  // the order tiles open in, fixed for the round so a re-render cannot
  // change which one is next
  const tileOrder = useRef(shuffledTiles());
  const playedIds = useRef([]);
  const stopHeartbeat = useRef(null);

  const tilesOpen = openTiles.length;
  const attemptsLeft = MAX_ATTEMPTS - tilesOpen;
  const finished = status !== "playing";

  const quiet = useCallback(() => {
    if (stopHeartbeat.current) {
      stopHeartbeat.current();
      stopHeartbeat.current = null;
    }
  }, []);

  useEffect(() => quiet, [quiet]);

  /*
   * The heartbeat under the last guess, started and stopped in one
   * place. A loop like this left running after a round ends is the
   * classic way to turn a nice touch into a bug nobody can silence.
   */
  useEffect(() => {
    const shouldBeat = sound && !finished && !loading && movie && attemptsLeft === 1;

    if (shouldBeat && !stopHeartbeat.current) {
      stopHeartbeat.current = startHeartbeat();
    } else if (!shouldBeat) {
      quiet();
    }
  }, [sound, finished, loading, movie, attemptsLeft, quiet]);

  /*
   * Loading a round lives inside the effect rather than in a function the
   * effect calls, because the first thing it does is set state — and
   * state set synchronously in an effect body triggers a cascading
   * render. Nested in `run`, those calls happen a tick later, which is
   * both what React wants and what the loading state should do anyway.
   *
   * `round` is the handle the rest of the component pulls: bumping it
   * re-runs this and starts a fresh film without duplicating any of it.
   */
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      quiet();
      setLoading(true);
      setFailed(false);
      setMovie(null);
      setOpenTiles([]);
      setGuesses([]);
      setStatus("playing");
      setResult(null);
      tileOrder.current = shuffledTiles();

      try {
        const next =
          mode === "daily" ? await loadDailyMovie() : await loadRandomMovie(playedIds.current);
        if (cancelled) return;
        playedIds.current = [...playedIds.current, next.id];
        setMovie(next);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [mode, round, quiet]);

  const nextRound = () => setRound((n) => n + 1);

  const openNextTile = (count = 1) => {
    setOpenTiles((current) => {
      const next = [...current];
      for (let i = 0; i < count && next.length < TILES; i++) {
        next.push(tileOrder.current[next.length]);
      }
      return next;
    });
  };

  const endRound = (won, tilesAtEnd) => {
    quiet();
    const score = won ? scoreFor(tilesAtEnd) : 0;
    setStatus(won ? "won" : "lost");
    setResult({ won, tiles: tilesAtEnd, score });
    setStats(recordRound({ won, score, tilesOpen: tilesAtEnd, isDaily: mode === "daily" }));

    if (mode === "daily") {
      const progress = { finished: true, won, tiles: tilesAtEnd, score };
      writeDailyProgress(progress);
      setDailyDone(progress);
    }

    if (sound) {
      if (won) playCorrect();
      setTimeout(() => sound && playImpact(), won ? 260 : 120);
    }
  };

  const handleGuess = (picked) => {
    if (finished) return;

    const correct = picked.id === movie.id;
    setGuesses((current) => [...current, { id: picked.id, title: picked.title, correct }]);

    if (correct) {
      // the winning tile count is what is already open, plus the one this
      // guess would have cost — a first-guess win is worth a single tile
      endRound(true, Math.max(tilesOpen, 1));
      setOpenTiles(tileOrder.current.slice(0, TILES));
      return;
    }

    if (sound) playWrong();

    const nextCount = tilesOpen + 1;
    openNextTile();

    if (nextCount >= MAX_ATTEMPTS) endRound(false, TILES);
  };

  const handleHint = () => {
    if (finished || tilesOpen >= TILES) return;
    if (sound) playWhoosh();

    const nextCount = tilesOpen + 1;
    openNextTile();
    setGuesses((current) => [...current, { hint: true }]);

    if (nextCount >= MAX_ATTEMPTS) endRound(false, TILES);
  };

  const switchMode = (next) => {
    if (sound) playClick();
    setMode(next);
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    writeSoundPreference(next);
    if (!next) quiet();
    else playClick();
  };

  const winRate = stats.played > 0 ? Math.round((stats.solved / stats.played) * 100) : 0;
  const achievements = achievementsFor(stats);
  const alreadyPlayedToday = mode === "daily" && dailyDone && !finished && !loading;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      {/* ===== HERO ===== */}
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#E50914]">
          Novious Frame by Frame
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl">
          ONE FRAME.
          <br />
          <span className="text-neutral-600">ONE MOVIE.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-400">
          Six tiles hide a single still. Every wrong guess opens one — name the film
          before the picture does it for you.
        </p>
      </div>

      {/* ===== MODE + SOUND ===== */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <div className="flex border border-white/15">
          {["daily", "unlimited"].map((item) => (
            <button
              key={item}
              onClick={() => switchMode(item)}
              className={`px-5 py-2 text-sm font-medium capitalize transition-colors ${
                mode === item ? "bg-[#E50914] text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              {item === "daily" ? "Daily challenge" : "Unlimited"}
            </button>
          ))}
        </div>

        <button
          onClick={toggleSound}
          aria-pressed={sound}
          aria-label={sound ? "Turn sound off" : "Turn sound on"}
          className={`border px-3 py-2 transition-colors ${
            sound
              ? "border-[#E50914]/60 bg-[#E50914]/10 text-white"
              : "border-white/15 text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H3v6h3l5 4V5z" />
            {sound ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 9l5 6M21 9l-5 6" />
            )}
          </svg>
        </button>
      </div>

      {/* ===== STATS ===== */}
      <div className="mt-10 grid grid-cols-2 gap-6 border-y border-white/10 py-6 sm:grid-cols-4">
        <Stat value={stats.streak} label="Daily streak" />
        <Stat value={stats.solved} label="Films solved" />
        <Stat value={stats.bestScore} label="Best score" />
        <Stat value={`${winRate}%`} label="Win rate" />
      </div>

      {/* ===== GAME ===== */}
      <div className="mt-10">
        {failed ? (
          <div className="border border-[#E50914]/40 bg-[#E50914]/5 p-10 text-center">
            <p className="font-semibold text-white">No frame to show</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-400">
              TMDB could not be reached, so there is no still to hide. Check your
              connection and try again.
            </p>
            <button
              onClick={nextRound}
              className="mt-6 border border-neutral-500 px-5 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="decoded-skeleton aspect-video w-full rounded-sm" />
        ) : (
          <>
            {alreadyPlayedToday && (
              <p className="mb-4 border-l-2 border-[#E50914] pl-3 text-xs leading-relaxed text-neutral-500">
                You already played today&apos;s film —{" "}
                {dailyDone.won
                  ? `solved it on ${dailyDone.tiles} tile${dailyDone.tiles === 1 ? "" : "s"} for ${dailyDone.score} points.`
                  : "it beat you."}{" "}
                This replay will not change your streak. Unlimited has a fresh film
                whenever you want one.
              </p>
            )}

            <FrameBoard
              movie={movie}
              openTiles={openTiles}
              solved={status === "won"}
              revealAll={finished}
            />

            {/* ===== PROGRESS ===== */}
            <div className="mt-4 flex items-center gap-1.5">
              {Array.from({ length: TILES }).map((unused, index) => (
                <span
                  key={index}
                  className={`h-1 flex-1 transition-colors duration-500 ${
                    index < tilesOpen ? "bg-[#E50914]" : "bg-white/12"
                  }`}
                />
              ))}
              <span className="ml-3 shrink-0 text-xs tabular-nums text-neutral-500">
                {tilesOpen} / {TILES} clues
              </span>
            </div>

            {/* ===== PLAYING ===== */}
            {!finished && (
              <div className="mt-6">
                <GuessInput
                  onGuess={handleGuess}
                  disabled={finished}
                  attemptsLeft={attemptsLeft}
                  danger={attemptsLeft === 1}
                />

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <button
                    onClick={handleHint}
                    disabled={tilesOpen >= TILES}
                    className="border border-white/15 px-4 py-2 text-sm text-neutral-300 transition-colors hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Reveal a tile
                  </button>
                  <span className="text-xs text-neutral-600">
                    Worth {scoreFor(Math.max(tilesOpen, 1))} points if you get it now.
                  </span>
                </div>

                {guesses.filter((g) => !g.hint).length > 0 && (
                  <ul className="mt-5 space-y-1.5">
                    {guesses
                      .filter((g) => !g.hint)
                      .map((guess, index) => (
                        <li
                          key={`${guess.id}-${index}`}
                          className="flex items-center gap-2 border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-neutral-400"
                        >
                          <span className="text-[#E50914]">✕</span>
                          {guess.title}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}

            {/* ===== REVEAL ===== */}
            {finished && movie && (
              <div className="challenge-rise mt-8 border border-white/12 bg-[#0d0d0d] p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <img
                    src={`${POSTER_BASE}${movie.poster_path}`}
                    alt={`Poster ${movie.title}`}
                    style={{ animationDelay: "200ms" }}
                    className="challenge-rise w-32 shrink-0 self-start shadow-2xl shadow-black/70 sm:w-40"
                  />

                  <div className="min-w-0 flex-1">
                    <p
                      style={{ animationDelay: "320ms" }}
                      className={`challenge-rise text-[11px] uppercase tracking-[0.25em] ${
                        status === "won" ? "text-[#E50914]" : "text-neutral-500"
                      }`}
                    >
                      {result?.won
                        ? `Solved on ${result.tiles} tile${result.tiles === 1 ? "" : "s"} · ${result.score} points`
                        : "Out of guesses"}
                    </p>

                    <h2
                      style={{ animationDelay: "420ms" }}
                      className="challenge-rise mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl"
                    >
                      {movie.title}
                    </h2>

                    <div
                      style={{ animationDelay: "520ms" }}
                      className="challenge-rise mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-300"
                    >
                      <span className="flex items-center gap-2">
                        <StarRating value={movie.vote_average} className="text-xs" />
                        {movie.vote_average?.toFixed(1)}
                      </span>
                      <span>{movie.release_date?.slice(0, 4)}</span>
                      {movie.runtime > 0 && (
                        <span>
                          {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                        </span>
                      )}
                    </div>

                    <div
                      style={{ animationDelay: "600ms" }}
                      className="challenge-rise mt-3 flex flex-wrap gap-2"
                    >
                      {movie.genres?.map((genre) => (
                        <span
                          key={genre.id}
                          className="border border-white/20 px-2.5 py-0.5 text-xs text-neutral-300"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>

                    <div
                      style={{ animationDelay: "700ms" }}
                      className="challenge-rise mt-6 flex flex-wrap gap-3"
                    >
                      <Link
                        to={`/movie/${movie.id}`}
                        className="bg-[#E50914] px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-105 hover:bg-[#f6121d]"
                      >
                        View movie details
                      </Link>

                      <button
                        onClick={() => {
                          if (sound) playClick();
                          if (mode === "daily") setMode("unlimited");
                          else nextRound();
                        }}
                        className="border border-neutral-500 px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-105 hover:border-white hover:bg-white/10"
                      >
                        Next movie
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== ACHIEVEMENTS ===== */}
      <div className="mt-14 border-t border-white/10 pt-8">
        <p className="mb-4 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
          Achievements
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`border p-4 ${
                item.earned ? "border-[#E50914]/50 bg-[#E50914]/5" : "border-white/10"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  item.earned ? "text-white" : "text-neutral-500"
                }`}
              >
                {item.name}
              </p>
              <p className="mt-1 text-xs text-neutral-500">{item.detail}</p>
              <p className="mt-2 text-xs tabular-nums text-neutral-600">{item.progress}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== HOW TO PLAY ===== */}
      <div className="mt-10 border-t border-white/10 pt-8 text-xs leading-relaxed text-neutral-500">
        <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
          How to play
        </p>
        <p className="max-w-2xl">
          A still from a thriller or an adventure film sits under six tiles. Type a title,
          pick it from the list and submit — guesses are matched on the film itself, so
          spelling and punctuation do not matter. A wrong guess opens a tile, and so does
          asking for one. Six tiles is the end of the round. The fewer you open, the more
          the win is worth: {scoreFor(1)} points on the first tile down to {scoreFor(6)} on
          the last. Daily is the same film for everyone until midnight UTC and is the only
          mode that builds a streak; Unlimited never runs out.
        </p>
      </div>
    </div>
  );
};

export default Quiz;
