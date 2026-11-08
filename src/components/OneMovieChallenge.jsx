import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { discoverOneMovie, getMovieDetails, getTrailerKey } from "../services/api";
import { QUESTIONS, SEARCH_STAGES, SEARCH_DURATION, SPARKS } from "../data/challenge";
import StarRating from "./StarRating";
import TrailerModal from "./TrailerModal";
import { startSearchHum, playStageBlip, playReveal, playMiss } from "../services/sound";

const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

// every state of the right-hand column is held to this, so the panel does
// not resize between searching and the answer
const PANEL_HEIGHT = "min-h-[24rem]";

const SOUND_KEY = "novious-challenge-sound";

/*
 * Read the saved sound preference once, as the initial state.
 *
 * This used to be an effect that called setSound after mount, which meant
 * the section rendered with sound on and then corrected itself — and React
 * rightly complains about setting state synchronously in an effect. A lazy
 * initialiser runs once, before the first render, and never again.
 */
const readSoundPreference = () => {
  try {
    const saved = localStorage.getItem(SOUND_KEY);
    return saved === null ? true : saved === "on";
  } catch {
    // private browsing can refuse storage; sound stays on
    return true;
  }
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 149 -> "2h 29m"
const formatRuntime = (minutes) => {
  if (!minutes) return null;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const OptionButton = ({ option, selected, onClick }) => (
  <button
    onClick={onClick}
    aria-pressed={selected}
    className={`rounded-lg border px-3 py-2.5 text-left transition-all duration-200 ${
      selected
        ? "border-[#E50914] bg-[#E50914]/12 text-white"
        : "border-white/12 bg-white/[0.03] text-neutral-300 hover:border-white/30 hover:bg-white/[0.07]"
    }`}
  >
    <span className="block text-sm font-medium">{option.label}</span>
    {option.note && (
      <span className={`block text-xs ${selected ? "text-[#f08a90]" : "text-neutral-500"}`}>
        {option.note}
      </span>
    )}
  </button>
);

/*
 * The ONE Movie Challenge — three questions, one film, no scrolling.
 *
 * The point of the section is the wait. A recommendation that lands the
 * instant you click reads as a random pick; the same recommendation after
 * a few seconds of visible searching reads as a decision. So the search
 * always runs its full animation, and the film is revealed in pieces
 * afterwards: backdrop, then poster, then the words.
 *
 * Two rules keep that honest. The animation is a floor, not a fake: if
 * TMDB is slower than the animation, the search simply keeps running until
 * the data is in. And an error is never dressed up as a search — it breaks
 * the sequence immediately and says so.
 *
 * `seen` remembers everything already offered, so Give Me Another keeps
 * the same three answers but cannot return the same film twice.
 */
const OneMovieChallenge = () => {
  const [answers, setAnswers] = useState({ time: null, mood: null, style: null });
  const [phase, setPhase] = useState("form");   // form | searching | result | error
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [error, setError] = useState(null);
  const [seen, setSeen] = useState([]);
  const [sound, setSound] = useState(readSoundPreference);

  const toggleSound = () => {
    setSound((on) => {
      const next = !on;
      try {
        localStorage.setItem(SOUND_KEY, next ? "on" : "off");
      } catch {
        // nothing to do; the setting simply will not persist
      }
      return next;
    });
  };

  // every timer started by a search, so none of them can fire into a
  // component that has gone away or into a search already abandoned
  const timers = useRef([]);
  const runId = useRef(0);
  const stopHum = useRef(null);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      // a drone left running after the section unmounts would play forever
      if (stopHum.current) stopHum.current();
    };
  }, []);

  const ready = answers.time && answers.mood && answers.style;

  const choose = (questionId, option) =>
    setAnswers((previous) => ({ ...previous, [questionId]: option }));

  const search = async (exclude) => {
    const run = ++runId.current;

    timers.current.forEach(clearTimeout);
    timers.current = [];

    setPhase("searching");
    setStage(0);
    setError(null);

    if (stopHum.current) stopHum.current();
    if (sound) {
      // the click that got us here is the gesture browsers require
      stopHum.current = startSearchHum(SEARCH_DURATION / 1000);
      playStageBlip(0);
    }

    SEARCH_STAGES.forEach((item, i) => {
      if (i === 0) return;
      timers.current.push(
        setTimeout(() => {
          if (runId.current !== run) return;
          setStage(i);
          if (sound) playStageBlip(i);
        }, item.at)
      );
    });

    // the animation is a minimum, not a disguise: if TMDB takes longer the
    // search keeps running rather than cutting to an empty result
    const floor = wait(SEARCH_DURATION);

    try {
      const movie = await discoverOneMovie({
        genres: answers.mood.genres,
        maxRuntime: answers.time.maxRuntime,
        safe: answers.style.safe,
        exclude,
      });

      if (runId.current !== run) return;

      if (!movie) {
        if (stopHum.current) stopHum.current();
        if (sound) playMiss();
        setError("Nothing in the catalogue matches all three answers. Try loosening one.");
        setPhase("error");
        return;
      }

      const [details, key] = await Promise.all([
        getMovieDetails(movie.id),
        getTrailerKey(movie.id),
      ]);

      if (runId.current !== run) return;

      await floor;
      if (runId.current !== run) return;

      if (stopHum.current) stopHum.current();
      if (sound) playReveal();

      setResult({ ...movie, ...(details || {}) });
      setTrailerKey(key);
      setShowTrailer(false);
      setSeen((previous) => [...previous, movie.id]);
      setPhase("result");
    } catch {
      if (runId.current !== run) return;
      if (stopHum.current) stopHum.current();
      if (sound) playMiss();
      // an error is reported the moment it happens, not after the animation
      setError("TMDB could not be reached. Check your connection and try again.");
      setPhase("error");
    }
  };

  const reset = () => {
    runId.current++;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (stopHum.current) stopHum.current();
    setPhase("form");
    setResult(null);
    setTrailerKey(null);
    setShowTrailer(false);
    setError(null);
  };

  const runtime = formatRuntime(result?.runtime);

  return (
    <section className="relative isolate overflow-hidden border-y border-white/10 py-16">
      {/*
        ===== BACKGROUND =====
        Fixed on purpose. An earlier version blurred the chosen film's
        backdrop across the whole band, which meant the section changed
        colour with every answer — the page flickered between green, blue
        and orange as the visitor pressed Give me another, and the result
        card had to compete with a copy of its own artwork. The film's
        colour now belongs to the card alone; the band behind it stays put.
      */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-[#101010]">
        {/* three slow drifts on loops of 23s, 31s and 27s — lengths that do
            not divide into each other, so the pattern never visibly repeats */}
        <div className="drift-one absolute -left-40 top-[-20%] h-[26rem] w-[26rem] rounded-full bg-[#E50914]/25 blur-[130px]" />
        <div className="drift-two absolute right-[-10%] top-[10%] h-[24rem] w-[24rem] rounded-full bg-[#b4531a]/22 blur-[140px]" />
        <div className="drift-three absolute bottom-[-25%] left-[35%] h-[22rem] w-[22rem] rounded-full bg-[#2b4a63]/26 blur-[130px]" />

        {/* sparks: each one blooms and fades on its own clock, in its own
            corner, so there is no direction or rhythm to get used to */}
        {SPARKS.map((spark) => (
          <div
            key={spark.id}
            className="spark absolute rounded-full blur-2xl"
            style={{
              top: `${spark.top}%`,
              left: `${spark.left}%`,
              height: `${spark.size}rem`,
              width: `${spark.size}rem`,
              background: spark.tint,
              "--peak": spark.peak,
              "--dur": `${spark.dur}s`,
              "--delay": `${spark.delay}s`,
            }}
          />
        ))}

        <div className="film-grain absolute inset-0 opacity-[0.07]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#141414] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#141414] to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#E50914]">
          Stop scrolling. Start watching.
        </p>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">The ONE Movie Challenge</h2>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          Three questions, one film. No list to scroll, no second-guessing.
        </p>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* ===== LEFT: THE QUESTIONS ===== */}
          <div className="space-y-6 lg:col-span-1">
            {QUESTIONS.map((question, number) => (
              <fieldset key={question.id}>
                <legend className="mb-2.5 flex items-baseline gap-2 text-sm font-semibold text-white">
                  <span className="text-xs tabular-nums text-[#E50914]">0{number + 1}</span>
                  {question.title}
                </legend>

                <div
                  className={`grid gap-2 ${
                    question.options.length > 3 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
                  }`}
                >
                  {question.options.map((option) => (
                    <OptionButton
                      key={option.id}
                      option={option}
                      selected={answers[question.id]?.id === option.id}
                      onClick={() => choose(question.id, option)}
                    />
                  ))}
                </div>
              </fieldset>
            ))}

            <div className="flex gap-2">
              <button
                onClick={() => search(seen)}
                disabled={!ready || phase === "searching"}
                className="flex-1 rounded-lg bg-[#E50914] px-6 py-3.5 text-sm font-semibold text-white transition duration-200 hover:bg-[#f6121d] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-500"
              >
                {phase === "searching" ? "Searching…" : "Find My Movie"}
              </button>

              <button
                onClick={toggleSound}
                aria-pressed={sound}
                aria-label={sound ? "Turn search sound off" : "Turn search sound on"}
                title={sound ? "Sound on" : "Sound off"}
                className={`shrink-0 rounded-lg border px-3.5 transition ${
                  sound
                    ? "border-[#E50914]/60 bg-[#E50914]/10 text-white"
                    : "border-white/12 bg-white/[0.03] text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5L6 9H3v6h3l5 4V5z"
                  />
                  {sound ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 9l5 6M21 9l-5 6" />
                  )}
                </svg>
              </button>
            </div>

            {!ready && (
              <p className="-mt-3 text-xs text-neutral-500">Answer all three to unlock the search.</p>
            )}
          </div>

          {/* ===== RIGHT: THE ANSWER ===== */}
          <div className="lg:col-span-2">
            {phase === "form" && (
              <div className={`flex ${PANEL_HEIGHT} flex-col items-center justify-center rounded-xl border border-dashed border-white/12 p-10 text-center`}>
                <p className="text-5xl font-bold text-white/10">ONE</p>
                <p className="mt-3 max-w-sm text-sm text-neutral-500">
                  Answer the three questions and Novious will pick a single film out of
                  the whole TMDB catalogue — not a shortlist.
                </p>
              </div>
            )}

            {phase === "searching" && (
              <div className={`relative flex ${PANEL_HEIGHT} items-center justify-center overflow-hidden rounded-xl border border-white/12 bg-black/40`}>
                {/* the projector sweep */}
                <div
                  aria-hidden="true"
                  className="challenge-scan absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#E50914]/15 to-transparent"
                />

                <div className="relative px-6 text-center" aria-live="polite">
                  <p
                    key={stage}
                    className="challenge-stage text-xl font-semibold text-white sm:text-2xl"
                  >
                    {SEARCH_STAGES[stage].text}
                    <span className="text-[#E50914]">…</span>
                  </p>

                  <div className="mx-auto mt-5 flex w-40 gap-1.5">
                    {SEARCH_STAGES.map((item, i) => (
                      <span
                        key={item.at}
                        className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                          i <= stage ? "bg-[#E50914]" : "bg-white/15"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {phase === "error" && (
              <div className={`flex ${PANEL_HEIGHT} flex-col items-center justify-center rounded-xl border border-[#E50914]/40 bg-[#E50914]/5 p-10 text-center`}>
                <p className="text-base font-semibold text-white">The search stopped</p>
                <p className="mt-2 max-w-sm text-sm text-neutral-400">{error}</p>
                <button
                  onClick={reset}
                  className="mt-6 rounded border border-neutral-500 px-5 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                >
                  Back to the questions
                </button>
              </div>
            )}

            {phase === "result" && result && (
              <div className={`relative overflow-hidden rounded-xl border border-white/12 ${PANEL_HEIGHT}`}>
                <img
                  src={`${BACKDROP_BASE}${result.backdrop_path}`}
                  alt={result.title}
                  className="challenge-backdrop absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/90 to-[#0d0d0d]/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] to-transparent" />

                <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
                  <img
                    src={`${POSTER_BASE}${result.poster_path}`}
                    alt={`Poster ${result.title}`}
                    style={{ animationDelay: "500ms" }}
                    className="challenge-rise w-32 shrink-0 self-start rounded-lg shadow-2xl shadow-black/70 sm:w-40"
                  />

                  <div className="min-w-0 flex-1">
                    <h3
                      style={{ animationDelay: "750ms" }}
                      className="challenge-rise text-2xl font-bold leading-tight text-white sm:text-3xl"
                    >
                      {result.title}
                    </h3>

                    <div
                      style={{ animationDelay: "900ms" }}
                      className="challenge-rise mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-300"
                    >
                      <span className="flex items-center gap-2">
                        <StarRating value={result.vote_average} className="text-xs" />
                        {result.vote_average?.toFixed(1)}
                      </span>
                      {result.release_date && <span>{result.release_date.slice(0, 4)}</span>}
                      {runtime && <span>{runtime}</span>}
                    </div>

                    {result.genres?.length > 0 && (
                      <div
                        style={{ animationDelay: "1000ms" }}
                        className="challenge-rise mt-3 flex flex-wrap gap-2"
                      >
                        {result.genres.map((genre) => (
                          <span
                            key={genre.id}
                            className="rounded-full border border-white/20 px-2.5 py-0.5 text-xs text-neutral-300"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <p
                      style={{ animationDelay: "1100ms" }}
                      className="challenge-rise mt-4 line-clamp-4 max-w-2xl text-sm leading-relaxed text-neutral-300"
                    >
                      {result.overview || "No description available."}
                    </p>

                    {/* ===== ACTIONS ===== */}
                    <div
                      style={{ animationDelay: "1400ms" }}
                      className="challenge-rise mt-5 flex flex-wrap gap-3"
                    >
                      {/* only offered when TMDB actually has a video for this film */}
                      {trailerKey ? (
                        <button
                          onClick={() => setShowTrailer(true)}
                          className="inline-flex items-center gap-2 rounded bg-[#E50914] px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-105 hover:bg-[#f6121d]"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Watch Trailer
                        </button>
                      ) : (
                        <span
                          title="TMDB has no trailer for this film"
                          className="cursor-not-allowed rounded bg-white/10 px-5 py-2.5 text-sm font-semibold text-neutral-500"
                        >
                          No trailer
                        </span>
                      )}

                      <Link
                        to={`/movie/${result.id}`}
                        className="rounded border border-neutral-500 px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:scale-105 hover:border-white hover:bg-white/10"
                      >
                        Movie details
                      </Link>

                      <button
                        onClick={() => search([...seen, result.id])}
                        className="rounded border border-neutral-700 px-5 py-2.5 text-sm font-semibold text-neutral-300 transition duration-200 hover:scale-105 hover:border-white hover:text-white"
                      >
                        Give me another
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <TrailerModal
        trailerKey={showTrailer ? trailerKey : null}
        title={result?.title}
        onClose={() => setShowTrailer(false)}
      />
    </section>
  );
};

export default OneMovieChallenge;
