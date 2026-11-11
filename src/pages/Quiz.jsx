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

const modes = [
  { id: "daily", label: "Daily challenge", description: "One film a day, shared by everyone." },
  { id: "unlimited", label: "Unlimited", description: "A fresh film every round." },
];

const caption = "font-mono text-[11px] font-medium uppercase tracking-[0.18em]";
const outlineButton = "inline-flex min-h-11 items-center justify-center gap-2 border border-white/20 px-4 py-2 text-sm font-medium text-[#e5e5e5] transition-colors hover:border-[#e5e5e5] hover:bg-white/5";

const Stat = ({ value, label }) => (
  <div className="border-t border-white/10 py-3">
    <dt className={`${caption} text-neutral-400`}>{label}</dt>
    <dd className="mt-1 font-display text-4xl leading-none text-[#ededed]">{value}</dd>
  </div>
);

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

  const [result, setResult] = useState(null);

  const [stats, setStats] = useState(readStats);
  const [sound, setSound] = useState(readSoundPreference);
  const [dailyDone, setDailyDone] = useState(() => readDailyProgress());

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

  useEffect(() => {
    const shouldBeat = sound && !finished && !loading && movie && attemptsLeft === 1;

    if (shouldBeat && !stopHeartbeat.current) {
      stopHeartbeat.current = startHeartbeat();
    } else if (!shouldBeat) {
      quiet();
    }
  }, [sound, finished, loading, movie, attemptsLeft, quiet]);

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

  const modeDescription = modes.find((item) => item.id === mode).description;
  const roundStatus = finished
    ? "Frame revealed"
    : loading || failed
      ? "Waiting for a frame"
      : `${tilesOpen} / ${TILES} tiles open`;

  return (
    <div className="frame-quiz mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 sm:pt-24 lg:px-8">
      <header className="mb-4 grid gap-3 border-b border-white/15 pb-4 sm:mb-6 sm:gap-4 sm:pb-5 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className={`${caption} mb-2 flex items-center gap-3 text-[#ff515b]`}>
            <span aria-hidden="true" className="h-1.5 w-6 bg-[#E50914]" />
            Novious Film Club
          </p>
          <h1 className="font-display text-[clamp(3.25rem,8.3vw,7.75rem)] leading-[0.82] text-[#f5f5f5]">
            Frame by <span className="frame-title-outline">Frame</span>
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-neutral-300 md:max-w-[17rem] md:border-l md:border-white/20 md:pl-5">
          One still. Six tiles. How much of the picture do you need to name the film?
        </p>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <section aria-label="Mystery frame" className="min-w-0 border border-[#343434] bg-[#0e0e0e]">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2.5 sm:px-5">
            <p className={`${caption} flex items-center gap-2 text-[#ff515b]`}>
              <span aria-hidden="true" className="size-2 border border-current" />
              Screening room
            </p>
            <p className={`${caption} text-neutral-400`} aria-live="polite">{roundStatus}</p>
          </div>

          <div className="frame-perforations mx-3 mb-2 sm:mx-5" aria-hidden="true" />
          <div className="mx-3 sm:mx-5">
            {failed ? (
              <div className="grid min-h-44 place-content-center gap-2 border border-white/10 bg-[#1b1b1b] p-4 text-center sm:aspect-video">
                <p className="font-display text-3xl text-[#f5f5f5]">No frame to show</p>
                <p className="max-w-xs text-sm text-neutral-300">
                  The film couldn&apos;t load from TMDB. Check your connection and try again.
                </p>
                <button onClick={nextRound} className={`${outlineButton} mx-auto mt-2`}>Try again</button>
              </div>
            ) : loading ? (
              <div role="status" className="grid aspect-video place-content-center border border-white/10 bg-[#1b1b1b]">
                <p className={`${caption} text-[#ff515b]`}>Loading the frame…</p>
              </div>
            ) : (
              <FrameBoard
                movie={movie}
                openTiles={openTiles}
                solved={status === "won"}
                revealAll={finished}
              />
            )}
          </div>
          <div className="frame-perforations mx-3 mt-2 sm:mx-5" aria-hidden="true" />

          <div className="flex items-center justify-between gap-4 px-3 py-2.5 sm:px-5">
            <span className={`${caption} text-neutral-400`}>Frame exposure</span>
            <div className="flex gap-1.5" aria-hidden="true">
              {Array.from({ length: TILES }, (_, index) => (
                <span
                  key={index}
                  className={`h-2.5 w-3 border transition-colors motion-reduce:transition-none sm:w-5 ${
                    index < tilesOpen ? "border-[#E50914] bg-[#E50914]" : "border-white/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section aria-label="Play Frame by Frame" className="min-w-0 border border-[#373737] bg-[#1b1b1b] p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className={`${caption} text-[#ff515b]`}>Play mode</p>
            <button
              onClick={toggleSound}
              aria-pressed={sound}
              aria-label="Sound"
              className="flex min-h-11 items-center gap-2 px-2 text-xs text-neutral-300 transition-colors hover:text-white"
            >
              <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H3v6h3l5 4V5z" />
                {sound ? (
                  <path strokeLinecap="round" d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
                ) : (
                  <path strokeLinecap="round" d="M16 9l5 6M21 9l-5 6" />
                )}
              </svg>
              {sound ? "Sound on" : "Sound off"}
            </button>
          </div>

          <div className="grid grid-cols-2 border border-white/20">
            {modes.map((item) => (
              <button
                key={item.id}
                onClick={() => switchMode(item.id)}
                aria-pressed={mode === item.id}
                className={`min-h-11 px-2 py-2 text-sm font-semibold transition-colors ${
                  mode === item.id ? "bg-[#a5111b] text-white" : "text-neutral-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-2.5 hidden text-xs leading-relaxed text-neutral-300 sm:block">{modeDescription}</p>

          {!loading && !failed && (
            <div className="mt-4 border-t border-white/15 pt-4 sm:mt-5 sm:pt-5">
              {finished ? (
                <div className="challenge-rise">
                  <div className="flex items-start gap-3">
                    <img
                      src={`${POSTER_BASE}${movie.poster_path}`}
                      alt=""
                      className="aspect-[2/3] w-16 shrink-0 border border-white/15 object-cover"
                    />
                    <div className="min-w-0">
                      <p role="status" className={`${caption} text-[#ff515b]`}>
                        {result.won
                          ? `Solved on ${result.tiles} tile${result.tiles === 1 ? "" : "s"} · ${result.score} pts`
                          : "Out of guesses"}
                      </p>
                      <h2 className="mt-1 break-words font-display text-4xl leading-none text-[#f5f5f5]">{movie.title}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-300">
                        <span>{movie.release_date?.slice(0, 4)}</span>
                        {movie.runtime > 0 && (
                          <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                        )}
                        <span className="flex items-center gap-1">
                          <StarRating value={movie.vote_average} className="text-xs [&>span[aria-hidden=true]]:text-[#ff515b]" />
                          {movie.vote_average?.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {movie.genres?.length > 0 && (
                    <p className="mt-3 text-xs text-neutral-300">
                      {movie.genres.map((genre) => genre.name).join(" · ")}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to={`/movie/${movie.id}`} className={outlineButton}>Movie details</Link>
                    <button
                      onClick={() => {
                        if (sound) playClick();
                        if (mode === "daily") setMode("unlimited");
                        else nextRound();
                      }}
                      className="min-h-11 bg-[#c7121b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e01822]"
                    >
                      Next movie <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className="font-display text-4xl leading-none text-[#f5f5f5]">Name the film</h2>
                    <p
                      className={`${caption} ${attemptsLeft === 1 ? "text-[#ff8087]" : "text-neutral-300"}`}
                      aria-live="polite"
                    >
                      {attemptsLeft === 1 ? "Last guess" : `${attemptsLeft} guesses left`}
                    </p>
                  </div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={handleHint}
                      className={`${outlineButton} border-[#8a3439] ${tilesOpen === 0 ? "bg-[#3d1a1d]" : ""}`}
                    >
                      <svg aria-hidden="true" className="size-4 text-[#ff515b]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16">
                        <path d="M2.5 2.5h11v11h-11zM8 2.5v11M2.5 8H8" />
                      </svg>
                      Reveal a tile
                    </button>
                    <p className="text-xs text-neutral-300">
                      <span className="font-mono font-semibold text-[#ff515b]">{scoreFor(Math.max(tilesOpen, 1))}</span> pts if solved now
                    </p>
                  </div>

                  <GuessInput onGuess={handleGuess} danger={attemptsLeft === 1} />

                  {alreadyPlayedToday && (
                    <p className="mt-4 border-l-2 border-[#8a3439] pl-3 text-xs leading-relaxed text-neutral-300">
                      Today&apos;s film was already played. Switch to Unlimited for a fresh puzzle.
                    </p>
                  )}

                  {guesses.length > 0 && (
                    <ul aria-label="Round history" className="mt-4 max-h-28 divide-y divide-white/10 overflow-y-auto border-y border-white/10">
                      {guesses.map((guess, index) => (
                        <li key={index} className="flex items-baseline gap-2 py-1.5 text-xs text-neutral-300">
                          <span aria-hidden="true" className="w-4 shrink-0 font-mono text-[#ff515b]">
                            {guess.hint ? "+" : "×"}
                          </span>
                          {guess.hint ? "Tile revealed" : <><span className="sr-only">Incorrect guess: </span>{guess.title}</>}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </div>

      <section aria-labelledby="screening-record" className="mt-10 border-y border-white/15 py-5">
        <div className="grid gap-x-8 gap-y-4 md:grid-cols-[auto_1fr] md:items-center">
          <h2 id="screening-record" className="font-display text-3xl text-[#f5f5f5]">Your screening record</h2>
          <dl className="grid grid-cols-2 gap-x-5 sm:grid-cols-4">
            <Stat value={stats.streak} label="Daily streak" />
            <Stat value={stats.solved} label="Films solved" />
            <Stat value={stats.bestScore} label="Best score" />
            <Stat value={`${winRate}%`} label="Win rate" />
          </dl>
        </div>
      </section>

      <div className="mt-7 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-12">
        <section aria-labelledby="how-to-play">
          <h2 id="how-to-play" className="font-display text-3xl text-[#f5f5f5]">How to play</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-neutral-300 marker:font-mono marker:text-[#ff515b]">
            <li>Type a title, choose a film from the suggestions and submit your guess.</li>
            <li>Each wrong guess or hint opens one tile. The round ends when all six open.</li>
            <li>Solve early for more points. Daily resets at midnight UTC and counts toward your streak.</li>
          </ol>
        </section>

        <section aria-labelledby="quiz-achievements">
          <h2 id="quiz-achievements" className="font-display text-3xl text-[#f5f5f5]">Achievements</h2>
          <ul className="mt-2 divide-y divide-white/10 border-y border-white/10">
            {achievements.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className={`text-sm font-semibold ${item.earned ? "text-[#ff515b]" : "text-[#f5f5f5]"}`}>
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">{item.detail}</p>
                </div>
                <span className="shrink-0 text-right font-mono text-xs text-neutral-300">
                  {item.earned && <span className="block text-[#ff515b]">Unlocked</span>}
                  {item.progress}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Quiz;
